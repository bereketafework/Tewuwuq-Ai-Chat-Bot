// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent that translates English questions to Amharic and responds in Amharic.
 *
 * - translateAndRespondInAmharic - A function that translates and responds in Amharic.
 * - TranslateAndRespondInAmharicInput - The input type for the translateAndRespondInAmharic function.
 * - TranslateAndRespondInAmharicOutput - The return type for the translateAndRespondInAmharic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateAndRespondInAmharicInputSchema = z.object({
  englishInput: z.string().describe('The English question or statement to be translated and responded to.'),
});
export type TranslateAndRespondInAmharicInput = z.infer<typeof TranslateAndRespondInAmharicInputSchema>;

const TranslateAndRespondInAmharicOutputSchema = z.object({
  amharicResponse: z.string().describe('The AI response in Amharic.'),
});
export type TranslateAndRespondInAmharicOutput = z.infer<typeof TranslateAndRespondInAmharicOutputSchema>;

export async function translateAndRespondInAmharic(input: TranslateAndRespondInAmharicInput): Promise<TranslateAndRespondInAmharicOutput> {
  return translateAndRespondInAmharicFlow(input);
}

const translateAndRespondInAmharicPrompt = ai.definePrompt({
  name: 'translateAndRespondInAmharicPrompt',
  input: {schema: TranslateAndRespondInAmharicInputSchema},
  output: {schema: TranslateAndRespondInAmharicOutputSchema},
  prompt: `Translate the following English input to Amharic and respond to it in Amharic.\n\nEnglish Input: {{{englishInput}}}`,
});

const translateAndRespondInAmharicFlow = ai.defineFlow(
  {
    name: 'translateAndRespondInAmharicFlow',
    inputSchema: TranslateAndRespondInAmharicInputSchema,
    outputSchema: TranslateAndRespondInAmharicOutputSchema,
  },
  async input => {
    const {output} = await translateAndRespondInAmharicPrompt(input);
    return output!;
  }
);
