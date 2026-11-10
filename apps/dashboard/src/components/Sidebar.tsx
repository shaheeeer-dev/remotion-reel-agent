'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  BookOpen,
  ListTodo,
  Sliders,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/', icon: Activity },
  { name: 'Reels Studio', href: '/reels', icon: Film },
  { name: 'Topic Pool', href: '/topics', icon: ListTodo },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { name: 'Brand Settings', href: '/brand', icon: Sliders },
  { name: 'Job Queue', href: '/jobs', icon: Layers },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0F1623] border-r border-[#233044] flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-[#233044]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8533] flex items-center justify-center font-black text-white text-lg shadow-lg shadow-[#FF6B00]/30">
            L
          </div>
          <div>
            <div className="font-extrabold text-white text-lg tracking-tight">LearnOps</div>
            <div className="text-xs text-[#94A3B8] font-medium">Reel Agent Studio</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/25'
                    : 'text-[#94A3B8] hover:bg-[#151D2A] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#233044] m-4 rounded-xl bg-[#151D2A]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6B00] mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Free Tier</span>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Deterministic Remotion rendering with strict schema safety.
        </p>
      </div>
    </aside>
  );
};
