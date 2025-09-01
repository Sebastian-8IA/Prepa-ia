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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { recommendUniversities, type RecommendUniversitiesOutput } from '@/ai/flows/recommend-universities';

const formSchema = z.object({
  areaOfInterest: z.string().min(3, { message: 'Campo requerido.' }),
  desiredCareer: z.string().min(3, { message: 'Campo requerido.' }),
  budget: z.string().min(3, { message: 'Campo requerido.' }),
  city: z.string().min(3, { message: 'Campo requerido.' }),
  studyMode: z.enum(['online', 'presencial', 'hibrido']),
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
    },
  });

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="areaOfInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área de Interés</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tecnología, Salud, Arte" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="Ej: Ingeniería de Software" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: S/ 2000-3000 mensual" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="Ej: Lima, Arequipa" {...field} />
                    </FormControl>
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
              <div className="md:col-span-2">
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
