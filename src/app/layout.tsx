import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Using Geist Sans directly as variable name
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({ // Renamed from Geist to geistSans for clarity
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed Geist Mono as it's not specified in the design requirements
// and the primary font is Geist Sans.

export const metadata: Metadata = {
  title: 'ትውውቅ (Tewuwuq) - Amharic AI Chat',
  description: 'Chat with an AI in Amharic. Powered by Firebase and Genkit.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
