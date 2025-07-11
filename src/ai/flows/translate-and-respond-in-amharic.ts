
'use server';

/**
 * @fileOverview DEPRECATED - This flow is replaced by analyze-file-and-chat.ts
 * An AI agent that translates English questions to Amharic and responds in Amharic,
 * with different modes for general and medical queries.
 *
 * - translateAndRespondInAmharic - A function that translates and responds in Amharic.
 * - TranslateAndRespondInAmharicInput - The input type for the translateAndRespondInAmharic function.
 * - TranslateAndRespondInAmharicOutput - The return type for the translateAndRespondInAmharic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateAndRespondInAmharicInputSchema = z.object({
  englishInput: z.string().describe('The English question or statement to be translated and responded to.'),
  mode: z.enum(['general', 'medical']).default('general').describe('The mode of operation: "general" or "medical".'),
});
export type TranslateAndRespondInAmharicInput = z.infer<typeof TranslateAndRespondInAmharicInputSchema>;

const TranslateAndRespondInAmharicOutputSchema = z.object({
  amharicResponse: z.string().describe('The AI response in Amharic.'),
  reasoning: z.string().optional().describe('The reasoning process behind the AI response, in Amharic. Provided in both general and medical modes, starting with "ምክንያታዊነት:".'),
});
export type TranslateAndRespondInAmharicOutput = z.infer<typeof TranslateAndRespondInAmharicOutputSchema>;

export async function translateAndRespondInAmharic(input: TranslateAndRespondInAmharicInput): Promise<TranslateAndRespondInAmharicOutput> {
  // This flow is deprecated. Consider throwing an error or logging a warning.
  console.warn("translateAndRespondInAmharic flow is deprecated. Use analyzeTextAndFile instead.");
  // Fallback to a simple error response or a basic translation if absolutely necessary
  return { 
    amharicResponse: "ይህ ተግባር ተቋርጧል። እባክዎ አዲሱን ይጠቀሙ። (This function is deprecated. Please use the new one.)",
    reasoning: "ምክንያታዊነት: ይህ የድሮ ተግባር በአዲስና በተሻሻለ ተግባር ተተክቷል።"
  };

  // Original logic (commented out as it's deprecated)
  // return translateAndRespondInAmharicFlow(input);
}

/*
const translateAndRespondInAmharicPrompt = ai.definePrompt({
  name: 'translateAndRespondInAmharicPrompt',
  input: {schema: z.object({
    englishInput: z.string(),
    isMedicalMode: z.boolean(),
  })},
  output: {schema: TranslateAndRespondInAmharicOutputSchema},
  prompt: `{{#if isMedicalMode}}
You are an AI assistant specializing in medical information, fluent in Amharic. Your knowledge should be up-to-date.
When responding to medical queries, provide detailed information in Amharic, including potential symptoms, causes, diagnostic approaches, and general treatment options or lifestyle adjustments.
Structure your response clearly. Use Markdown for bolding titles or important phrases (e.g., **ዋና የህክምና ርዕስ:**).
It is CRUCIAL to ALWAYS explicitly state in Amharic that your information is NOT a substitute for professional medical advice and that the user MUST consult with a qualified healthcare provider for any health concerns or before making any medical decisions. This disclaimer should be part of the main Amharic response.
Translate the user's English query to Amharic. Then, respond comprehensively in Amharic.
Finally, provide your reasoning as a separate thought process. This reasoning should be in Amharic and start with the label "ምክንያታዊነት:" (Reasoning:). This reasoning should be part of the 'reasoning' output field.

User's English Query: {{{englishInput}}}
{{else}}
You are an AI assistant fluent in Amharic. Your knowledge should be comprehensive and up-to-date.
Translate the user's English query to Amharic. Then, respond comprehensively and in detail in Amharic.
Structure your response clearly. Use Markdown for bolding titles or important phrases (e.g., **ዋና ርዕስ:**).
Finally, provide your reasoning or thinking process as a separate section. This reasoning should be in Amharic and start with the label "ምክንያታዊነት:" (Reasoning:). This reasoning should be part of the 'reasoning' output field.

User's English Query: {{{englishInput}}}
{{/if}}`,
});

const translateAndRespondInAmharicFlow = ai.defineFlow(
  {
    name: 'translateAndRespondInAmharicFlow',
    inputSchema: TranslateAndRespondInAmharicInputSchema,
    outputSchema: TranslateAndRespondInAmharicOutputSchema,
  },
  async (flowInput) => {
    const promptInput = {
      englishInput: flowInput.englishInput,
      isMedicalMode: flowInput.mode === 'medical',
    };
    const {output} = await translateAndRespondInAmharicPrompt(promptInput);
    return output!;
  }
);
*/
