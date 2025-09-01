'use server';

/**
 * @fileOverview Recommends 3 universities in Peru based on user preferences.
 *
 * - recommendUniversities - A function that handles the university recommendation process.
 * - RecommendUniversitiesInput - The input type for the recommendUniversities function.
 * - RecommendUniversitiesOutput - The return type for the recommendUniversities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendUniversitiesInputSchema = z.object({
  areaOfInterest: z.string().describe('The area of interest of the student.'),
  desiredCareer: z.string().describe('The desired career of the student.'),
  budget: z.string().describe('The budget of the student.'),
  city: z.string().describe('The city where the student wants to study.'),
  studyMode: z.string().describe('The study mode (e.g., online, in-person).'),
  extraDetails: z.array(z.string()).describe('A list of extra details the student is looking for in a university, such as accreditations, labs, double degree, research, or scholarships.'),
});
export type RecommendUniversitiesInput = z.infer<typeof RecommendUniversitiesInputSchema>;

const RecommendUniversitiesOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      universityName: z.string().describe('The name of the recommended university.'),
      description: z.string().describe('A short description of the university and why it is recommended.'),
    })
  ).length(3).describe('A list of 3 recommended universities.'),
});
export type RecommendUniversitiesOutput = z.infer<typeof RecommendUniversitiesOutputSchema>;

export async function recommendUniversities(input: RecommendUniversitiesInput): Promise<RecommendUniversitiesOutput> {
  return recommendUniversitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendUniversitiesPrompt',
  input: {schema: RecommendUniversitiesInputSchema},
  output: {schema: RecommendUniversitiesOutputSchema},
  prompt: `You are a university advisor in Peru. A student is looking for university recommendations based on their preferences.

  Area of Interest: {{{areaOfInterest}}}
  Desired Career: {{{desiredCareer}}}
  Budget: {{{budget}}}
  City: {{{city}}}
  Study Mode: {{{studyMode}}}
  Extra Details: {{#each extraDetails}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Recommend 3 universities in Peru that best match these criteria. Provide a short description for each university, explaining why it is a good fit for the student.  Format your answer as a JSON array.
`,
});

const recommendUniversitiesFlow = ai.defineFlow(
  {
    name: 'recommendUniversitiesFlow',
    inputSchema: RecommendUniversitiesInputSchema,
    outputSchema: RecommendUniversitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
