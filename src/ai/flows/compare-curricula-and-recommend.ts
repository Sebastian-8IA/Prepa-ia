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
  curriculumFiles: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe(
      'An array of curriculum files (2-3) as data URIs that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'    ),
  recommendationCriteria: z.string().describe('The criteria for recommending the best curriculum, such as focus on research, industry connections, or specific subjects.'),
});
export type CompareCurriculaAndRecommendInput = z.infer<typeof CompareCurriculaAndRecommendInputSchema>;

const CompareCurriculaAndRecommendOutputSchema = z.object({
  comparison: z.string().describe('A detailed comparison of the curricula, highlighting strengths and weaknesses of each.'),
  recommendation: z.object({
    university: z.string().describe('The name of the recommended university.'),
    reason: z.string().describe('The reasons for recommending this university based on the comparison and recommendation criteria.'),
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
  prompt: `You are an expert academic advisor specializing in comparing university curricula. Based on the provided curriculum files and recommendation criteria, provide a detailed comparison of the curricula, highlighting the strengths and weaknesses of each, and recommend the best university option.

Recommendation Criteria: {{{recommendationCriteria}}}

Curriculum Files:
{{#each curriculumFiles}}
  File {{@index}}: {{media url=this}}
{{/each}}`,
});

const compareCurriculaAndRecommendFlow = ai.defineFlow(
  {
    name: 'compareCurriculaAndRecommendFlow',
    inputSchema: CompareCurriculaAndRecommendInputSchema,
    outputSchema: CompareCurriculaAndRecommendOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
