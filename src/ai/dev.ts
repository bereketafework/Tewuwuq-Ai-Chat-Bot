import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-chat-history.ts';
// import '@/ai/flows/translate-and-respond-in-amharic.ts'; // Deprecated
import '@/ai/flows/analyze-file-and-chat.ts'; // New comprehensive flow
