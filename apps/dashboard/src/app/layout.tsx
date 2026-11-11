import './globals.css';
import { Sidebar } from '../components/Sidebar';

export const metadata = {
  title: 'Remotion Reel Agent — AI Social Video Studio',
  description: 'Automated educational Instagram Reels agent powered by Remotion, Gemini, and BullMQ.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#F4F5F7] text-[#1E1E2C]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </body>
    </html>
  );
}

