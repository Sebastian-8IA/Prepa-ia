'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookText, BrainCircuit, File as FileIcon, Loader2, Send, X } from 'lucide-react';

import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';
import { generateCourseStructure, type GenerateCourseStructureOutput } from '@/ai/flows/generate-course-structure';
import { generateModuleSummaryAndQuiz, type GenerateModuleSummaryAndQuizOutput } from '@/ai/flows/generate-module-summary-and-quiz';

const formSchema = z.object({
  topic: z.string().min(5, { message: 'El tema debe tener al menos 5 caracteres.' }),
  file: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Module = GenerateCourseStructureOutput['modules'][number];

interface ModuleWithQuiz extends Module {
  id: number;
  summaryAndQuiz?: GenerateModuleSummaryAndQuizOutput;
  isLoadingQuiz?: boolean;
}

const ModuleView = ({ module, onGenerateQuiz }: { module: ModuleWithQuiz; onGenerateQuiz: (id: number) => void; }) => {
  return (
    <div className="space-y-4">
      {module.summaryAndQuiz ? (
        <div className="space-y-6 animate-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><BookText className="h-5 w-5" /> Resumen del Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{module.summaryAndQuiz.summary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><BrainCircuit className="h-5 w-5" /> Quiz Interactivo</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{module.summaryAndQuiz.quiz}</pre>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Button onClick={() => onGenerateQuiz(module.id)} disabled={module.isLoadingQuiz}>
          {module.isLoadingQuiz && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generar Resumen y Quiz
        </Button>
      )}
    </div>
  );
};

export default function GeneradorCursosPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ModuleWithQuiz[] | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: '' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const documentDataUri = data.file ? await fileToDataUri(data.file) : undefined;
      const response = await generateCourseStructure({ topic: data.topic, documentDataUri });
      setResult(response.modules.map((m, i) => ({ ...m, id: i })));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al generar el curso',
        description: 'Hubo un problema al contactar a la IA. Por favor, intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (moduleId: number) => {
    if (!result) return;
  
    setResult(prev => prev!.map(m => m.id === moduleId ? { ...m, isLoadingQuiz: true } : m));
  
    try {
      const moduleToProcess = result.find(m => m.id === moduleId);
      if (!moduleToProcess) return;
  
      const moduleContent = `Título: ${moduleToProcess.title}\nDescripción: ${moduleToProcess.description}`;
      const quizResponse = await generateModuleSummaryAndQuiz({ moduleContent });
      
      setResult(prev => prev!.map(m => m.id === moduleId ? { ...m, summaryAndQuiz: quizResponse, isLoadingQuiz: false } : m));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al generar el quiz',
        description: 'Hubo un problema con la IA. Intenta de nuevo.',
      });
      setResult(prev => prev!.map(m => m.id === moduleId ? { ...m, isLoadingQuiz: false } : m));
    }
  };

  const fileRef = form.register('file');

  return (
    <div className="animate-in">
      <PageHeader
        title="Generador de Cursos"
        description="Introduce un tema y un archivo de referencia opcional para que la IA cree una estructura de curso detallada para ti."
      />

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema del Curso</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Introducción a la Inteligencia Artificial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Archivo de Referencia (Opcional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Button asChild variant="outline">
                          <label className="cursor-pointer">
                            <FileIcon className="mr-2 h-4 w-4" />
                            Seleccionar Archivo
                            <input
                              type="file"
                              className="sr-only"
                              {...fileRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                onChange(file);
                              }}
                            />
                          </label>
                        </Button>
                        {value && (
                           <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                            <span>{value.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => onChange(undefined)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Generar Estructura
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )}

      {result && (
        <div className="mt-8 animate-in">
          <h2 className="text-2xl font-semibold mb-4">Estructura del Curso Generada</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {result.map((module) => (
              <AccordionItem value={`item-${module.id}`} key={module.id} className="border-b-0">
                <Card>
                  <AccordionTrigger className="text-left hover:no-underline p-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">{module.title}</span>
                      <span className="text-sm text-muted-foreground font-normal mt-1">{module.description}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0">
                    <ModuleView module={module} onGenerateQuiz={handleGenerateQuiz} />
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
