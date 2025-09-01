'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a course structure with modules,
 * each having a title and description, based on a given topic and optional document.
 *
 * @exports generateCourseStructure - The main function to trigger the course structure generation flow.
 * @exports GenerateCourseStructureInput - The input type for the generateCourseStructure function.
 * @exports GenerateCourseStructureOutput - The output type for the generateCourseStructure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCourseStructureInputSchema = z.object({
  topic: z.string().describe('The main topic or title of the course.'),
  documentDataUri: z
    .string()
    .optional()
    .describe(
      "Optional: A document related to the topic, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateCourseStructureInput = z.infer<
  typeof GenerateCourseStructureInputSchema
>;

const GenerateCourseStructureOutputSchema = z.object({
  modules: z.array(
    z.object({
      title: z.string().describe('The title of the module.'),
      description: z.string().describe('A brief description of the module.'),
    })
  ).describe('An array of course modules, each with a title and description.'),
});
export type GenerateCourseStructureOutput = z.infer<
  typeof GenerateCourseStructureOutputSchema
>;

export async function generateCourseStructure(
  input: GenerateCourseStructureInput
): Promise<GenerateCourseStructureOutput> {
  return generateCourseStructureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseStructurePrompt',
  input: {schema: GenerateCourseStructureInputSchema},
  output: {schema: GenerateCourseStructureOutputSchema},
  prompt: `You are an expert course designer. Your task is to generate a course structure based on the given topic and optional document.

Topic: {{{topic}}}
{{#if documentDataUri}}
Document: {{media url=documentDataUri}}
{{/if}}

Generate a course structure with several modules. Each module should have a title and a brief description.
Ensure the modules are logically organized and cover the main aspects of the topic.

Return the course structure as a JSON object with a 'modules' array. Each object in the array should have a 'title' and a 'description' field.
`,
});

const generateCourseStructureFlow = ai.defineFlow(
  {
    name: 'generateCourseStructureFlow',
    inputSchema: GenerateCourseStructureInputSchema,
    outputSchema: GenerateCourseStructureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
