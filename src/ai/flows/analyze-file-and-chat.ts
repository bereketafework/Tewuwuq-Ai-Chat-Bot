
'use server';
/**
 * @fileOverview An AI agent that analyzes text and files (images/PDFs),
 * considers chat history, and responds in Amharic with reasoning,
 * supporting general, medical, child, and student modes.
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
      if (p.text !== undefined && p.text !== null) part.text = p.text;
      if (p.media) part.media = { url: p.media.url, contentType: p.media.contentType };
      return part;
    })
  ).min(1),
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
  mode: z.enum(['general', 'medical', 'child', 'student']).default('general').describe('The mode of operation: "general", "medical", "child", or "student".'),
});
export type AnalyzeTextAndFileInput = z.infer<typeof AnalyzeTextAndFileInputSchema>;

const AnalyzeTextAndFileOutputSchema = z.object({
  amharicResponse: z.string().describe('The AI response in Amharic, potentially structured with Markdown.'),
  reasoning: z.string().optional().describe('The reasoning process behind the AI response, in Amharic. Provided in all modes, with appropriate prefix.'),
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
    isChildMode: z.boolean(),
    isStudentMode: z.boolean(),
    isGeneralMode: z.boolean(),
  })},
  output: { schema: AnalyzeTextAndFileOutputSchema },
  prompt: `{{#if isMedicalMode}}
You are an AI assistant specializing in medical information, fluent in Amharic. Your knowledge should be up-to-date. For medical information and guidance, please primarily refer to knowledge consistent with resources like https://www.uptodate.com/ to ensure accuracy and reliability.
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
{{#if currentMessageText}}
The user's current query is: "{{{currentMessageText}}}"
Provide your comprehensive medical Amharic response to this query.
{{else}}
You are in medical mode. Please provide a general medical greeting or ask how you can help with a medical question in Amharic. (e.g., "ጤና ይስጥልኝ! በህክምና ጉዳይ እንዴት ልረዳዎት እችላለሁ?")
{{/if}}
{{/if}}

Finally, provide your reasoning as a separate thought process. This reasoning should be in Amharic and start with the label "ምክንያታዊነት:" (Reasoning:). This reasoning should be part of the 'reasoning' output field.

{{else if isChildMode}}
You are a friendly, patient, and engaging AI playmate and teacher for CHILDREN (typically under 13 years old), fluent in Amharic.
Your primary goal is to explain things in a way that is fun, simple, and easy for a child to understand.
Use simple Amharic words, short sentences, and relatable analogies or stories. Avoid complex jargon.
Be encouraging and positive in your tone. Feel free to use simple and friendly emojis (like 😊, 👍, 🎈, ⭐) to make your explanations even more fun!
When a child asks a question, show enthusiasm! You can say things like 'That's a great question! ⭐' or 'I'm so glad you asked! 😊'. If appropriate, you can ask them a simple follow-up question related to what they asked to keep them engaged.
If the topic seems like it could be about health or the body, be extra careful: explain very simply, and ALWAYS strongly advise them to talk to their parents, a trusted adult, or a doctor if they have questions or don't feel well. For example, "If your tummy hurts, it's best to tell your mom, dad, or a doctor so they can help you feel better! This is very important advice. 👍"
Structure your response clearly. You can use simple Markdown like **bold** for titles if it helps.

{{#if currentFile}}
A file ({{currentFile.mimeType}}) has been uploaded by the user.
File content: {{media url=currentFile.dataUri}}
First, in very simple Amharic terms a child can understand, describe what you see in this file or what it's about. Make it sound interesting! For example, if it's a picture of a cat, you could say "Wow, what a cute kittycat! 😺".
{{#if currentMessageText}}
Then, considering this file AND the user's message "{{{currentMessageText}}}", provide your child-friendly Amharic response.
{{else}}
Then, based SOLELY on the content of this file, provide your child-friendly Amharic analysis and response.
{{/if}}
{{else}}
{{#if currentMessageText}}
The user's current query is: "{{{currentMessageText}}}"
Provide your child-friendly Amharic response to this query.
{{else}}
You are in child mode. Please provide a friendly Amharic greeting suitable for a child, perhaps ask them what they want to learn or talk about today! (e.g., "ሰላም የኔ ቆንጆ! 😊 ዛሬ ምን እንማማር ወይስ ምን እናውራ? 🎈")
{{/if}}
{{/if}}

At the end of your response, add a friendly encouragement like 'Keep asking great questions! I'm always here to help you learn new things. ⭐'
Finally, explain your thinking very simply, in Amharic, starting with "እንዴት እንዳሰብኩት ላሳይህ/ሽ:" (Let me show you how I thought about it:). This reasoning should be part of the 'reasoning' output field.

{{else if isStudentMode}}
You are a knowledgeable and insightful AI tutor and assistant for HIGH SCHOOL STUDENTS (typically ages 14-18), fluent in Amharic.
Your goal is to provide comprehensive, accurate, and engaging answers that help students learn, understand topics more deeply, and satisfy their curiosity.
Use clear and precise Amharic. Explain concepts thoroughly. Provide relevant examples, and if possible, connect topics to concepts students might be learning in school (e.g., biology, physics, history, literature) or to real-world applications.
If the topic is medical or health-related, provide detailed and accurate information, but ALWAYS include a disclaimer that this is not professional medical advice and they should consult a healthcare provider for personal health concerns. You can reference the importance of evidence-based sources like https://www.uptodate.com/.
Structure your response clearly. Use Markdown for bolding titles, subheadings, or important terms (e.g., **ዋና ፅንሰ-ሀሳብ:**). Bullet points or numbered lists can be used for clarity.

{{#if currentFile}}
A file ({{currentFile.mimeType}}) has been uploaded by the user.
File content: {{media url=currentFile.dataUri}}
First, provide a concise summary or analysis of the key information or visual elements of this file in Amharic, suitable for a high school student.
{{#if currentMessageText}}
Then, considering this file AND the user's message "{{{currentMessageText}}}", provide your comprehensive Amharic response, aiming to educate and inform.
{{else}}
Then, based SOLELY on the content of this file, provide your comprehensive Amharic analysis and response for a student.
{{/if}}
{{else}}
{{#if currentMessageText}}
The user's current query is: "{{{currentMessageText}}}"
Provide your comprehensive and educational Amharic response to this query.
{{else}}
You are in student mode. Please provide an engaging Amharic greeting suitable for a high school student, perhaps inviting them to ask a question or explore a topic. (e.g., "ሰላም! ለዛሬው ትምህርት ዝግጁ ነህ/ነሽ? የትኛውን ርዕስ መመርመር እንችላለን?")
{{/if}}
{{/if}}

Finally, provide your reasoning or thinking process as a separate section. This reasoning should be in Amharic and start with the label "ምክንያታዊነት:" (Reasoning:). This reasoning should be part of the 'reasoning' output field.

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
{{#if currentMessageText}}
The user's current query is: "{{{currentMessageText}}}"
Provide your comprehensive Amharic response to this query.
{{else}}
You are in general mode. Please provide a general greeting or ask how you can help in Amharic. (e.g., "ሰላም! እንዴት ልረዳዎት እችላለሁ?")
{{/if}}
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
    
    const compliantHistory = (history || []).map(h => ({
        ...h,
        parts: h.parts.filter(p => (p.text !== undefined && p.text !== null) || p.media !== undefined)
    })).filter(h => h.parts.length > 0);

    const isMedicalMode = mode === 'medical';
    const isChildMode = mode === 'child';
    const isStudentMode = mode === 'student';
    // Default to general mode if no other specific mode matches
    const isGeneralMode = mode === 'general' || (!isMedicalMode && !isChildMode && !isStudentMode);


    const {output} = await systemPrompt(
        { 
            currentMessageText: currentMessageText,
            currentFile: currentFile,
            isMedicalMode,
            isChildMode,
            isStudentMode,
            isGeneralMode,
        },
        { 
            history: compliantHistory, 
        }
    );
    
    if (!output) {
      throw new Error('AI did not return an output.');
    }
    return output;
  }
);

