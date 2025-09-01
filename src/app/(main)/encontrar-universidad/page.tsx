'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, School, Search } from 'lucide-react';

import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { recommendUniversities, type RecommendUniversitiesOutput } from '@/ai/flows/recommend-universities';

const areasDeInteres = {
  'Tecnología': ['Ingeniería de Software', 'Ciencia de la Computación', 'Ingeniería de Sistemas'],
  'Salud': ['Medicina', 'Enfermería', 'Odontología', 'Psicología'],
  'Negocios': ['Administración de Empresas', 'Marketing', 'Contabilidad', 'Negocios Internacionales'],
  'Arte y Humanidades': ['Diseño Gráfico', 'Comunicaciones', 'Derecho', 'Arquitectura'],
};

const presupuestos = [
    'Menos de S/ 1000',
    'S/ 1000 - S/ 2000',
    'S/ 2000 - S/ 3500',
    'Más de S/ 3500',
];

const ciudades = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Piura', 'Chiclayo'];

const detallesExtraOptions = [
    { id: 'acreditaciones', label: 'Acreditaciones' },
    { id: 'laboratorios', label: 'Laboratorios' },
    { id: 'doble_titulacion', label: 'Doble Titulación' },
    { id: 'investigacion', label: 'Investigación' },
    { id: 'becas', label: 'Becas' },
] as const;

const formSchema = z.object({
  areaOfInterest: z.string().min(1, { message: 'Debes seleccionar un área.' }),
  desiredCareer: z.string().min(1, { message: 'Debes seleccionar una carrera.' }),
  budget: z.string().min(1, { message: 'Debes seleccionar un presupuesto.' }),
  city: z.string().min(1, { message: 'Debes seleccionar una ciudad.' }),
  studyMode: z.enum(['online', 'presencial', 'hibrido']),
  extraDetails: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EncontrarUniversidadPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendUniversitiesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      areaOfInterest: '',
      desiredCareer: '',
      budget: '',
      city: '',
      studyMode: 'presencial',
      extraDetails: [],
    },
  });
  
  const areaOfInterest = form.watch('areaOfInterest');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await recommendUniversities(data);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al buscar universidades',
        description: 'Hubo un problema con la IA. Por favor, intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Encontrar mi Universidad"
        description="Completa tus preferencias y deja que la IA te recomiende las mejores universidades en Perú para ti."
      />

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="areaOfInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Interés</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('desiredCareer', '');
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu área de interés" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(areasDeInteres).map(area => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="desiredCareer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrera Deseada</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!areaOfInterest}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={areaOfInterest ? "Selecciona una carrera" : "Elige un área primero"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areaOfInterest && areasDeInteres[areaOfInterest as keyof typeof areasDeInteres]?.map(carrera => (
                            <SelectItem key={carrera} value={carrera}>{carrera}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presupuesto Mensual</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rango de presupuesto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {presupuestos.map(presupuesto => (
                            <SelectItem key={presupuesto} value={presupuesto}>{presupuesto}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una ciudad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ciudades.map(ciudad => (
                            <SelectItem key={ciudad} value={ciudad}>{ciudad}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studyMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidad de Estudio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una modalidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="extraDetails"
                render={() => (
                    <FormItem>
                        <FormLabel>Detalles Extra</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {detallesExtraOptions.map((item) => (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="extraDetails"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.label)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item.label])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item.label
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {item.label}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />

              <div>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Universidades
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
        </div>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Universidades Recomendadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.recommendations.map((rec, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-6 w-6 text-primary" />
                    {rec.universityName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{rec.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
