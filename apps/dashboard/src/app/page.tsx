'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Clock, ArrowRight, Server, WifiOff } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { fetchApi } from '../lib/api-client';

export default function OverviewPage() {
  const [isLiveApi, setIsLiveApi] = useState<boolean | null>(null);
  const [liveStats, setLiveStats] = useState<{
    reelsCount: number;
    topicsCount: number;
    docsCount: number;
  }>({
    reelsCount: 3,
    topicsCount: 4,
    docsCount: 3,
  });

  useEffect(() => {
    async function checkHealthAndLoad() {
      try {
        await fetchApi('/health');
        setIsLiveApi(true);

        const [brandsRes, topicsRes] = await Promise.allSettled([
          fetchApi<{ data: any[] }>('/api/v1/brands'),
          fetchApi<{ data: any[] }>('/api/v1/brands/learnops/topics'),
        ]);

        let reelsCount = 3;
        let topicsCount = 4;
        let docsCount = 3;

        if (brandsRes.status === 'fulfilled' && brandsRes.value.data.length > 0) {
          const brand = brandsRes.value.data[0];
          const reelsRes = await fetchApi<{ data: any[] }>(`/api/v1/brands/${brand.id}/reels`).catch(() => null);
          const docsRes = await fetchApi<{ data: any[] }>(`/api/v1/brands/${brand.id}/knowledge`).catch(() => null);
          if (reelsRes?.data) reelsCount = reelsRes.data.length;
          if (docsRes?.data) docsCount = docsRes.data.length;
        }

        if (topicsRes.status === 'fulfilled' && topicsRes.value.data) {
          topicsCount = topicsRes.value.data.length;
        }

        setLiveStats({ reelsCount, topicsCount, docsCount });
      } catch {
        setIsLiveApi(false);
      }
    }

    checkHealthAndLoad();
  }, []);

  const stats = [
    {
      label: 'Educational Reels',
      value: String(liveStats.reelsCount),
      note: '3 Test 2 Compositions',
    },
    {
      label: 'Approved Knowledge',
      value: `${liveStats.docsCount} docs`,
      note: 'Linux, Docker, CI/CD',
    },
    {
      label: 'Topic Pool',
      value: `${liveStats.topicsCount} topics`,
      note: 'Curated pool',
    },
    {
      label: 'Instagram Pipeline',
      value: 'Configured',
      note: 'Awaiting verified token',
    },
  ];

  const test2Videos = [
    {
      title: 'Linux: What is the /etc Directory?',
      duration: '16s',
      category: 'Linux',
      animation: 'Filesystem Tree & Terminal Demo',
      status: 'RENDERED',
    },
    {
      title: 'Docker: What is a Container Really?',
      duration: '16s',
      category: 'Docker',
      animation: 'Kernel/cgroup Stack & Container Isolation',
      status: 'RENDERED',
    },
    {
      title: 'DevOps: What is CI/CD?',
      duration: '17s',
      category: 'DevOps',
      animation: 'Commit to Deploy Flowchart & Stage Statuses',
      status: 'RENDERED',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Live / Demo Mode Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#151D2A] border border-[#233044] text-xs">
        <div className="flex items-center gap-2">
          {isLiveApi ? (
            <>
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-emerald-400">Live API Connected</span>
              <span className="text-[#64748B]">— Backend online at http://localhost:4000</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-amber-400">Demo Preview Mode</span>
              <span className="text-[#94A3B8]">
                — API offline. Displaying verified reference data. Start API with <code className="text-white bg-black/40 px-1 py-0.5 rounded">npm run dev:api</code>.
              </span>
            </>
          )}
        </div>
      </div>

      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-r from-[#151D2A] to-[#1E293B] border border-[#233044]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6F41EC]/15 border border-[#6F41EC]/30 text-xs font-bold text-[#C4B5FD] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
            Multi-Brand Social Reel Agent
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Social Media Manager
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1 max-w-xl">
            Automating short educational Instagram Reels using deterministic Remotion animation and Gemini free-tier script generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/topics"
            className="px-5 py-2.5 rounded-xl bg-[#6F41EC] hover:bg-[#825CF0] text-white text-sm font-bold shadow-lg shadow-[#6F41EC]/30 transition"
          >
            Generate New Reel
          </Link>
          <Link
            href="/reels"
            className="px-5 py-2.5 rounded-xl bg-[#233044] hover:bg-[#2E3F58] text-white text-sm font-semibold transition"
          >
            View All Reels
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-6 rounded-2xl bg-[#151D2A] border border-[#233044]">
            <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">{s.label}</div>
            <div className="text-2xl font-black text-white mt-2">{s.value}</div>
            <div className="text-xs text-[#64748B] mt-1">{s.note}</div>
          </div>
        ))}
      </div>

      {/* Test 2 Renderer Validation Highlight */}
      <div className="p-8 rounded-2xl bg-[#151D2A] border border-[#233044] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Test 2 — Renderer Validation Showcase
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Required 15–18s educational videos with visually distinct animations driven by explicit scene data.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            3 / 3 Compositions Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {test2Videos.map((video) => (
            <div
              key={video.title}
              className="p-5 rounded-xl bg-[#0F1623] border border-[#233044] hover:border-[#6F41EC]/60 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-[#C4B5FD] uppercase tracking-wider">{video.category}</span>
                  <StatusBadge status={video.status} />
                </div>
                <h3 className="font-bold text-white text-base leading-snug">{video.title}</h3>
                <div className="mt-3 p-3 rounded-lg bg-[#151D2A] border border-[#233044]/60">
                  <div className="text-[11px] font-semibold text-[#64748B] uppercase">Visual Logic</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">{video.animation}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#233044] text-xs text-[#64748B]">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {video.duration} (30 fps)
                </span>
                <Link
                  href="/reels"
                  className="text-[#C4B5FD] hover:text-white font-bold flex items-center gap-1"
                >
                  Inspect <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
