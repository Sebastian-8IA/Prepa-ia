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
      reason: z.string().describe('Detailed and categorized explanation of why the university is a good option (e.g., "Academic Strengths", "Infrastructure and Resources", "Additional Opportunities").'),
      compatibilityPercentage: z.number().min(0).max(100).describe('A number from 0 to 100 indicating how well it aligns with the user\'s criteria.'),
      averageSalary: z.string().describe('The average salary of a graduate of the career of interest at that university. (Referential data)'),
      employmentRate: z.string().describe('The percentage of graduates of that career who get a job. (Referential data)'),
      budgetFit: z.string().describe('Indicates whether the university\'s tuition fee fits the user\'s budget.'),
      modality: z.string().describe('The study mode offered by the university.'),
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
  prompt: `You are an expert in higher education in Peru. Based on the following information, recommend the 3 best universities. Use your existing knowledge and web data (as in the "Ponte en Carrera" portals or from the universities themselves) to provide the most accurate information possible about salaries and employability.

Important: Always indicate that the salary and employability data are referential. The entire response must be in Spanish.

User preferences: Area of Interest: {{{areaOfInterest}}}, City: {{{city}}}, Study Mode: {{{studyMode}}}{{#if extraDetails}}, Extra Details: {{#each extraDetails}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
Budget: {{{budget}}}
Career Aspirations: {{{desiredCareer}}}

For each recommended university, provide the following information:
1. **University name.**
2. **Reason for recommendation:** Explain in detail and by category why the university is a good option (e.g., "Academic Strengths", "Infrastructure and Resources", "Additional Opportunities").
3. **Compatibility percentage:** A number from 0 to 100 indicating how well it aligns with the user's criteria.
4. **Average Salary:** The average salary of a graduate of the career of interest at that university. (Referential data)
5. **Employability Rate:** The percentage of graduates of that career who get a job. (Referential data)
6. **Budget fit:** Indicate whether the university's tuition fee fits the user's budget.
7. **Modality:** The study mode offered by the university.
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
