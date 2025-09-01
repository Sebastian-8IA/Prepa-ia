'use client';

import { useState } from 'react';
import { useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GitCompareArrows, Loader2, File as FileIcon, Plus, Trash2, Scale, Star } from 'lucide-react';

import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';
import { compareCurriculaAndRecommend, type CompareCurriculaAndRecommendOutput } from '@/ai/flows/compare-curricula-and-recommend';
import { Skeleton } from '@/components/ui/skeleton';

const MAX_FILES = 3;
const MIN_FILES = 2;

const formSchema = z.object({
  curricula: z
    .array(z.object({ file: z.instanceof(File) }))
    .min(MIN_FILES, `Debes subir al menos ${MIN_FILES} mallas curriculares.`)
    .max(MAX_FILES, `Puedes subir como máximo ${MAX_FILES} mallas curriculares.`),
  criteria: z.string().min(10, { message: 'Los criterios deben tener al menos 10 caracteres.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ComparadorCurriculasPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareCurriculaAndRecommendOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      curricula: [{ file: undefined as any }, { file: undefined as any }],
      criteria: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "curricula",
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const filePromises = data.curricula.map(c => fileToDataUri(c.file));
      const curriculumFiles = await Promise.all(filePromises);

      const response = await compareCurriculaAndRecommend({
        curriculumFiles,
        recommendationCriteria: data.criteria,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al comparar las mallas',
        description: 'Hubo un problema con la IA. Asegúrate de que los archivos sean válidos y vuelve a intentarlo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Comparador de Mallas Curriculares"
        description="Sube las mallas curriculares de 2 o 3 universidades y recibe un análisis comparativo y una recomendación personalizada."
      />
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <FormLabel>Mallas Curriculares (PDF, DOCX, etc.)</FormLabel>
                <div className="mt-2 space-y-4">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`curricula.${index}.file`}
                      render={({ field: { onChange } }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                             <Button asChild variant="outline" className="w-full justify-start text-left font-normal">
                              <label className="cursor-pointer">
                                <FileIcon className="mr-2 h-4 w-4 shrink-0" />
                                <span className="truncate">
                                  {form.watch(`curricula.${index}.file`)?.name || `Universidad ${index + 1}`}
                                </span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  onChange={(e) => onChange(e.target.files?.[0])}
                                />
                              </label>
                            </Button>
                            {fields.length > MIN_FILES && (
                              <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                {fields.length < MAX_FILES && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => append({ file: undefined as any })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Universidad
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name="criteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criterios de Recomendación</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Busco una malla con enfoque en investigación, con fuertes conexiones con la industria y materias de emprendimiento."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <GitCompareArrows className="mr-2 h-4 w-4" />
                Comparar y Recomendar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {loading && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
        </div>
      )}

      {result && (
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Resultados del Análisis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scale className="h-6 w-6 text-primary"/>
                                Comparación Detallada
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{result.comparison}</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="bg-secondary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-6 w-6 text-amber-500"/>
                                Recomendación
                            </CardTitle>
                            <CardDescription>Basado en tus criterios, la mejor opción es:</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground">{result.recommendation.university}</h3>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{result.recommendation.reason}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
