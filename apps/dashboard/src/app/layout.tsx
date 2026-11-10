import './globals.css';
import { Sidebar } from '../components/Sidebar';

export const metadata = {
  title: 'LearnOps — AI Social Media Manager',
  description: 'Automated educational Instagram Reels agent powered by Remotion, Gemini, and BullMQ.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#0B0F17]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </body>
    </html>
  );
}

