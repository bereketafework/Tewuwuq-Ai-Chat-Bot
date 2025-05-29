
'use server';
/**
 * @fileOverview An AI agent that analyzes text and files (images/PDFs),
 * considers chat history, and responds in Amharic with reasoning,
 * supporting general and medical modes.
 *
 * - analyzeTextAndFile - The main function for AI interaction.
 * - AnalyzeTextAndFileInput - Input type.
 * - AnalyzeTextAndFileOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {MessagePart, Role} from 'genkit'; 
import {z} from 'genkit';

// Define the structure for individual history messages
const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']) as z.ZodType<Role>, // 'user' or 'model' (AI)
  parts: z.array(
    z.object({
      text: z.string().optional(),
      media: z.object({ 
        url: z.string(), // data URI for media
        contentType: z.string().optional() 
      }).optional(),
    }).transform(p => {
      const part: MessagePart = {};
      if (p.text) part.text = p.text;
      if (p.media) part.media = { url: p.media.url, contentType: p.media.contentType };
      return part;
    })
  ),
});

const AnalyzeTextAndFileInputSchema = z.object({
  history: z.array(HistoryMessageSchema).optional().describe('The conversation history leading up to the current message.'),
  currentMessageText: z.string().optional().describe('The current text message from the user.'),
  currentFile: z
    .object({
      dataUri: z.string().describe("The file content as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
      mimeType: z.string().describe('The MIME type of the file (e.g., image/png, application/pdf).'),
    })
    .optional()
    .describe('An optional file (image or PDF) uploaded by the user.'),
  mode: z.enum(['general', 'medical']).default('general').describe('The mode of operation: "general" or "medical".'),
});
export type AnalyzeTextAndFileInput = z.infer<typeof AnalyzeTextAndFileInputSchema>;

const AnalyzeTextAndFileOutputSchema = z.object({
  amharicResponse: z.string().describe('The AI response in Amharic, potentially structured with Markdown.'),
  reasoning: z.string().optional().describe('The reasoning process behind the AI response, in Amharic. Provided in both modes, starting with "ምክንያታዊነት:".'),
});
export type AnalyzeTextAndFileOutput = z.infer<typeof AnalyzeTextAndFileOutputSchema>;

export async function analyzeTextAndFile(input: AnalyzeTextAndFileInput): Promise<AnalyzeTextAndFileOutput> {
  return analyzeTextAndFileFlow(input);
}

const systemPrompt = ai.definePrompt({
  name: 'analyzeTextAndFilePrompt',
  input: { schema: z.object({
    currentMessageText: AnalyzeTextAndFileInputSchema.shape.currentMessageText,
    currentFile: AnalyzeTextAndFileInputSchema.shape.currentFile,
    isMedicalMode: z.boolean(),
  })},
  output: { schema: AnalyzeTextAndFileOutputSchema },
  prompt: `{{#if isMedicalMode}}
You are an AI assistant specializing in medical information, fluent in Amharic. Your knowledge should be up-to-date.
When responding to medical queries, analyze any provided text and/or files (images, PDFs).
Provide detailed information in Amharic, including potential symptoms, causes, diagnostic approaches, and general treatment options or lifestyle adjustments.
Structure your response clearly. Use Markdown for bolding titles or important phrases (e.g., **ዋና የህክምና ርዕስ:**).
It is CRUCIAL to ALWAYS explicitly state in Amharic that your information is NOT a substitute for professional medical advice and that the user MUST consult with a qualified healthcare provider for any health concerns or before making any medical decisions. This disclaimer should be part of the main Amharic response.

{{#if currentFile}}
A file ({{currentFile.mimeType}}) has been uploaded by the user.
File content: {{media url=currentFile.dataUri}}
First, summarize the key information or describe the visual elements of this file in Amharic.
{{#if currentMessageText}}
Then, considering this file AND the user's message "{{{currentMessageText}}}", provide your comprehensive medical Amharic response.
{{else}}
Then, based SOLELY on the content of this file, provide your comprehensive medical Amharic analysis and response.
{{/if}}
{{else}}
The user's current query is: "{{{currentMessageText}}}"
Provide your comprehensive medical Amharic response to this query.
{{/if}}

Finally, provide your reasoning as a separate thought process. This reasoning should be in Amharic and start with the label "ምክንያታዊነት:" (Reasoning:). This reasoning should be part of the 'reasoning' output field.

{{else}}
You are a helpful AI assistant fluent in Amharic. Your knowledge should be comprehensive and up-to-date.
Analyze any provided text and/or files (images, PDFs).
Structure your response clearly. Use Markdown for bolding titles or important phrases (e.g., **ዋና ርዕስ:**).

{{#if currentFile}}
A file ({{currentFile.mimeType}}) has been uploaded by the user.
File content: {{media url=currentFile.dataUri}}
First, summarize the key information or describe the visual elements of this file in Amharic.
{{#if currentMessageText}}
Then, considering this file AND the user's message "{{{currentMessageText}}}", provide your comprehensive Amharic response.
{{else}}
Then, based SOLELY on the content of this file, provide your comprehensive Amharic analysis and response.
{{/if}}
{{else}}
The user's current query is: "{{{currentMessageText}}}"
Provide your comprehensive Amharic response to this query.
{{/if}}

Finally, provide your reasoning or thinking process as a separate section. This reasoning should be in Amharic and start with the label "ምክንያታዊነት:" (Reasoning:). This reasoning should be part of the 'reasoning' output field.
{{/if}}`
});

const analyzeTextAndFileFlow = ai.defineFlow(
  {
    name: 'analyzeTextAndFileFlow',
    inputSchema: AnalyzeTextAndFileInputSchema,
    outputSchema: AnalyzeTextAndFileOutputSchema,
  },
  async (flowInput) => {
    const { history, currentMessageText, currentFile, mode } = flowInput;
    
    const {output} = await systemPrompt(
        { 
            currentMessageText: currentMessageText || "",
            currentFile: currentFile,
            isMedicalMode: mode === 'medical',
        },
        { 
            history: history || [], 
        }
    );
    
    if (!output) {
      throw new Error('AI did not return an output.');
    }
    return output;
  }
);

