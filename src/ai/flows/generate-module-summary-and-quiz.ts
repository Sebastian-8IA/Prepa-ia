'use server';
/**
 * @fileOverview Generates a detailed summary and an interactive multiple-choice quiz for a given module.
 *
 * - generateModuleSummaryAndQuiz - A function that generates the summary and quiz.
 * - GenerateModuleSummaryAndQuizInput - The input type for the generateModuleSummaryAndQuiz function.
 * - GenerateModuleSummaryAndQuizOutput - The return type for the generateModuleSummaryAndQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateModuleSummaryAndQuizInputSchema = z.object({
  moduleContent: z
    .string()
    .describe('The content of the module for which to generate a summary and quiz.'),
});
export type GenerateModuleSummaryAndQuizInput = z.infer<typeof GenerateModuleSummaryAndQuizInputSchema>;

const GenerateModuleSummaryAndQuizOutputSchema = z.object({
  summary: z.string().describe('A detailed summary of the module content.'),
  quiz: z.string().describe('An interactive multiple-choice quiz based on the summary.'),
});
export type GenerateModuleSummaryAndQuizOutput = z.infer<typeof GenerateModuleSummaryAndQuizOutputSchema>;

export async function generateModuleSummaryAndQuiz(input: GenerateModuleSummaryAndQuizInput): Promise<GenerateModuleSummaryAndQuizOutput> {
  return generateModuleSummaryAndQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateModuleSummaryAndQuizPrompt',
  input: {schema: GenerateModuleSummaryAndQuizInputSchema},
  output: {schema: GenerateModuleSummaryAndQuizOutputSchema},
  prompt: `You are an expert educator specializing in creating effective study materials.

  Based on the module content provided, generate a detailed summary and an interactive multiple-choice quiz.
  The quiz should be designed to test the student's understanding of the key concepts covered in the module.

  Module Content: {{{moduleContent}}}
  Summary:
  Quiz:
  `,
});

const generateModuleSummaryAndQuizFlow = ai.defineFlow(
  {
    name: 'generateModuleSummaryAndQuizFlow',
    inputSchema: GenerateModuleSummaryAndQuizInputSchema,
    outputSchema: GenerateModuleSummaryAndQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
