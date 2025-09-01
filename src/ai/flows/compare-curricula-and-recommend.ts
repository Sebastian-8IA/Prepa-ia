'use server';
/**
 * @fileOverview Compares curricula from different universities and recommends the best option.
 *
 * - compareCurriculaAndRecommend - A function that handles the curricula comparison and recommendation process.
 * - CompareCurriculaAndRecommendInput - The input type for the compareCurriculaAndRecommend function.
 * - CompareCurriculaAndRecommendOutput - The return type for the compareCurriculaAndRecommend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompareCurriculaAndRecommendInputSchema = z.object({
  career: z.string().describe('The career for which the comparison is being made.'),
  curriculumFiles: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe(
      "An array of curriculum files (2-3) as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  recommendationCriteria: z.string().describe('The criteria for recommending the best curriculum, such as focus on research, industry connections, or specific subjects.'),
});
export type CompareCurriculaAndRecommendInput = z.infer<typeof CompareCurriculaAndRecommendInputSchema>;

const CompareCurriculaAndRecommendOutputSchema = z.object({
    summary: z.string().describe('A concise paragraph summarizing the key differences and similarities between the curricula.'),
    comparison: z.array(z.object({
        university: z.string().describe('The name of the university.'),
        advantages: z.array(z.string()).describe('A list of strengths of this curriculum.'),
        disadvantages: z.array(z.string()).describe('A list of weaknesses or gaps in this curriculum.'),
    })).describe('An array where each object represents a university with its advantages and disadvantages.'),
    recommendation: z.object({
        university: z.string().describe('The name of the recommended university.'),
        reason: z.string().describe('A justified reason for choosing this university based on user preferences and curriculum analysis.'),
    }),
});
export type CompareCurriculaAndRecommendOutput = z.infer<typeof CompareCurriculaAndRecommendOutputSchema>;

export async function compareCurriculaAndRecommend(
  input: CompareCurriculaAndRecommendInput
): Promise<CompareCurriculaAndRecommendOutput> {
  return compareCurriculaAndRecommendFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareCurriculaAndRecommendPrompt',
  input: {schema: CompareCurriculaAndRecommendInputSchema},
  output: {schema: CompareCurriculaAndRecommendOutputSchema},
  prompt: `Eres un asesor académico experto en educación superior en Perú. Tu misión es realizar un análisis comparativo detallado de las mallas curriculares para la carrera que la persona elija.
Recibirás archivos que contienen las mallas curriculares de varias universidades. Tu análisis debe basarse única y exclusivamente en la información contenida en estos documentos. NO DEBES INVENTAR INFORMACIÓN NI UTILIZAR CONOCIMIENTO EXTERNO.

**Proceso a seguir:**

1.  **Extracción de Datos:** Para cada universidad, examina el archivo de la malla curricular y extrae los detalles clave:
    *   Lista de cursos por ciclo o año.
    *   Cursos de especialización o electivos.
    *   Número total de créditos (si está disponible).
    *   Enfoque general (ej. teórico, práctico, investigativo).

2.  **Análisis Comparativo (Ventajas y Desventajas):** Una vez extraídos los datos, compara las mallas curriculares. Para cada universidad, identifica:
    *   **Ventajas:** ¿Qué hace que esta malla sea fuerte? (ej. Cursos innovadores, buena secuencia, flexibilidad, especializaciones atractivas).
    *   **Desventajas:** ¿Qué puntos débiles o carencias observas? (ej. Cursos desactualizados, poca flexibilidad, falta de enfoque práctico).

3.  **Elaboración del Resultado Final (en JSON):** Con base en tu análisis, genera la respuesta en el formato JSON solicitado.
    *   **summary:** Un párrafo conciso que resuma las diferencias y similitudes clave entre las mallas.
    *   **comparison:** Un arreglo donde cada objeto representa una universidad con su nombre ('university'), una lista de ventajas ('advantages') y una lista de desventajas ('disadvantages').
    *   **recommendation:** Una recomendación final con la universidad ('university') y una justificación ('reason') sobre qué opción parece tener la mejor malla curricular para la carrera y preferencias del usuario.

Recuerda, toda la respuesta debe ser en español y adherirse estrictamente al formato JSON de salida.

**Datos de Entrada:**

*   **Carrera:** {{{career}}}
*   **Criterios del usuario:** {{{recommendationCriteria}}}
*   **Archivos de Mallas Curriculares:**
    {{#each curriculumFiles}}
      *   Archivo {{@index}}: {{media url=this}}
    {{/each}}
`,
});

const compareCurriculaAndRecommendFlow = ai.defineFlow(
  {
    name: 'compareCurriculaAndRecommendFlow',
    inputSchema: CompareCurriculaAndRecommendInputSchema,
    outputSchema: CompareCurriculaAndRecommendOutputSchema,
    model: 'googleai/gemini-2.5-flash',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
