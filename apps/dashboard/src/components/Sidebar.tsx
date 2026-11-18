'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  BookOpen,
  ListTodo,
  Sliders,
  Layers,
  Sparkles,
  LayoutDashboard,
  Video,
  Target,
  Palette,
} from 'lucide-react';
import { fetchApi } from '../lib/api-client';

const studioNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Reels Studio', href: '/reels', icon: Film },
  { name: 'Topic Pool', href: '/topics', icon: ListTodo },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
];

const configNav = [
  { name: 'Brand & Reel Colors', href: '/brand', icon: Palette },
  { name: 'Job Queue', href: '/jobs', icon: Layers },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [brandInfo, setBrandInfo] = useState<{ displayName: string; slug: string; primaryColor: string } | null>(null);

  useEffect(() => {
    fetchApi<{ data: any[] }>('/api/v1/brands')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const b = res.data[0];
          setBrandInfo({
            displayName: b.displayName || 'Remotion Reel',
            slug: b.slug || 'custom',
            primaryColor: b.profile?.primaryColor || '#F29F67',
          });
        }
      })
      .catch(() => { });
  }, [pathname]);

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 shadow-sm">
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F29F67] to-[#E0B50F] flex items-center justify-center font-black text-white shadow-md shadow-[#F29F67]/25 shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <div className="font-extrabold text-[#1E1E2C] text-base tracking-tight leading-tight truncate">
              Remotion Reel Agent
            </div>
            <div className="text-[11px] text-[#64748B] font-medium flex items-center gap-1.5 mt-0.5">
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0"
                style={{ backgroundColor: brandInfo?.primaryColor || '#F29F67' }}
              />
              <span className="truncate">{brandInfo?.displayName || 'Studio'}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Activity Data & Targets */}
        <div className="px-4 pt-5 pb-2">
          <div className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase px-3 mb-2 flex items-center gap-1.5">
            <Target className="w-3 h-3 text-[#F29F67]" />
            <span>Activity Data & Targets</span>
          </div>
          <nav className="space-y-1">
            {studioNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${isActive
                    ? 'bg-[#FDEEE3] text-[#F29F67] shadow-sm font-bold'
                    : 'text-[#64748B] hover:bg-[#F4F5F7] hover:text-[#1E1E2C]'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F29F67]' : 'text-[#94A3B8]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Masters & Config */}
        <div className="px-4 pt-4 pb-2">
          <div className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase px-3 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#3B8FF3]" />
            <span>Masters & System</span>
          </div>
          <nav className="space-y-1">
            {configNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${isActive
                    ? 'bg-[#FDEEE3] text-[#F29F67] shadow-sm font-bold'
                    : 'text-[#64748B] hover:bg-[#F4F5F7] hover:text-[#1E1E2C]'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F29F67]' : 'text-[#94A3B8]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Badge */}
      <div className="p-4 m-3 rounded-2xl bg-[#F8F9FA] border border-[#E2E8F0]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-[#1E1E2C]">Reel Agent Engine</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34B1AA]/15 text-[#34B1AA]">
            Online
          </span>
        </div>
        <a
          href="https://shaheer-dev.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#64748B] leading-snug hover:text-[#6F41EC] hover:underline transition-colors"
        >
          By shaheer-dev
        </a>
      </div>
    </aside>
  );
};

