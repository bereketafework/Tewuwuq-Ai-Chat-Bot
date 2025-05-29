
'use server';
/**
 * @fileOverview Provides a deep analysis of a chat session.
 *
 * - analyzeChatSession - A function that analyzes the chat session.
 * - AnalyzeChatSessionInput - The input type for the analyzeChatSession function.
 * - AnalyzeChatSessionOutput - The return type for the analyzeChatSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a simplified message structure for the prompt.
const ChatMessageForAnalysisSchema = z.object({
  id: z.string(),
  text: z.string(),
  sender: z.enum(['user', 'ai']),
  timestamp: z.number(),
  file: z.object({
    name: z.string(),
    type: z.string(),
    dataUri: z.string(),
    size: z.number(),
  }).optional(),
  reasoning: z.string().optional(),
});


const AnalyzeChatSessionInputSchema = z.object({
  messages: z.array(ChatMessageForAnalysisSchema).describe('The array of chat messages in the session to be analyzed.'),
  sessionTitle: z.string().describe('The title of the chat session.'),
});
export type AnalyzeChatSessionInput = z.infer<typeof AnalyzeChatSessionInputSchema>;

const AnalyzeChatSessionOutputSchema = z.object({
  analysis: z.string().describe('A comprehensive analysis of the chat session in Amharic, structured with Markdown.'),
});
export type AnalyzeChatSessionOutput = z.infer<typeof AnalyzeChatSessionOutputSchema>;

// Helper to format messages for the prompt
function formatMessagesForPrompt(messages: z.infer<typeof ChatMessageForAnalysisSchema>[]): string {
  return messages.map(msg => {
    let fileInfo = '';
    if (msg.file) {
      fileInfo = ` [File Attached: ${msg.file.name} (${msg.file.type})]`;
    }
    let reasoningInfo = '';
    if (msg.sender === 'ai' && msg.reasoning) {
      // For brevity in the analysis prompt, we might omit detailed reasoning or summarize it.
      // Here, we'll just indicate if reasoning was present.
      // reasoningInfo = ` [AI Reasoning was provided]`;
    }
    return `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}${fileInfo}${reasoningInfo}`;
  }).join('\n---\n'); // Using a separator for clarity
}


export async function analyzeChatSession(input: AnalyzeChatSessionInput): Promise<AnalyzeChatSessionOutput> {
  return analyzeChatSessionFlow(input);
}

const analyzeChatSessionGenkitPrompt = ai.definePrompt({
  name: 'analyzeChatSessionPrompt',
  input: { schema: z.object({
    formattedMessages: z.string(),
    sessionTitle: AnalyzeChatSessionInputSchema.shape.sessionTitle,
  }) },
  output: { schema: AnalyzeChatSessionOutputSchema },
  prompt: `You are an expert in conversation analysis, fluent in Amharic.
Analyze the following Amharic chat session titled "**{{sessionTitle}}**".
The conversation is between a User and an AI.

Provide a comprehensive analysis in Amharic. Your analysis should be well-structured using Markdown (e.g., bold headings for sections like **ዋና ዋና የውይይት ርዕሶች**).
Consider the following aspects in your analysis:

- **የውይይቱ ዋና ዓላማ (Main Purpose of the Conversation):** What was the user trying to achieve?
- **ዋና ዋና የውይይት ርዕሶች (Key Discussion Topics):** Identify the main subjects discussed.
- **የውይይቱ ማጠቃለያ (Conversation Summary):** Briefly summarize the overall flow and outcome of the conversation. What were the key takeaways?
- **የተጠቃሚ ቁልፍ ጥያቄዎች እና የ AI ምላሾች (User's Key Questions and AI Responses):** Highlight 2-3 significant questions asked by the user and how the AI responded. Note any patterns or effectiveness of responses.
- **የተወሳሰቡ ወይም ያልተፈቱ ነጥቦች (Complex Queries or Unresolved Points):** Point out any particularly complex queries, or if there were any points the AI struggled with or didn't fully address.
- **የ AI ምላሾች ጥራት (Quality of AI Responses):** Comment on the clarity, relevance, and helpfulness of the AI's responses in general.

Chat History:
{{{formattedMessages}}}

Return ONLY the Amharic analysis based on the above instructions. Structure your response clearly with Markdown.
Start your analysis directly with a title like "**የውይይት ትንተና፡ {{sessionTitle}}**".
`,
});

const analyzeChatSessionFlow = ai.defineFlow(
  {
    name: 'analyzeChatSessionFlow',
    inputSchema: AnalyzeChatSessionInputSchema,
    outputSchema: AnalyzeChatSessionOutputSchema,
  },
  async (input) => {
    const formattedMessages = formatMessagesForPrompt(input.messages);
    const {output} = await analyzeChatSessionGenkitPrompt({
        formattedMessages,
        sessionTitle: input.sessionTitle,
    });
    if (!output) {
      throw new Error('AI did not return an analysis.');
    }
    return output;
  }
);
