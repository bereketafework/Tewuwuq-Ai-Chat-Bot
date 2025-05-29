import { ChatInterface } from '@/components/chat/ChatInterface';

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-0 md:p-4">
      <ChatInterface />
    </main>
  );
}
