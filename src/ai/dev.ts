import { config } from 'dotenv';
config();

import '@/ai/flows/generate-course-structure.ts';
import '@/ai/flows/generate-module-summary-and-quiz.ts';
import '@/ai/flows/compare-curricula-and-recommend.ts';
import '@/ai/flows/recommend-universities.ts';