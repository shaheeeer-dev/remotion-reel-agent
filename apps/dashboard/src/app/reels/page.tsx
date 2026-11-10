'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Film, Play, CheckCircle, UploadCloud, RefreshCw, Eye } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export default function ReelsPage() {
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const reels = [
    {
      id: 'reel-linux-etc',
      title: 'Linux: What is the /etc Directory?',
      hook: 'Where does Linux keep all its configuration?',
      durationSeconds: 16,
      status: 'RENDERED',
      createdAt: '2026-11-10',
      scenesCount: 4,
    },
    {
      id: 'reel-docker-container',
      title: 'Docker: What is a Container Really?',
      hook: 'Is a Docker container just a lightweight VM?',
      durationSeconds: 16,
      status: 'NEEDS_REVIEW',
      createdAt: '2026-11-10',
      scenesCount: 4,
    },
    {
      id: 'reel-devops-cicd',
      title: 'DevOps: What is CI/CD?',
      hook: 'What actually happens when you git push?',
      durationSeconds: 17,
      status: 'APPROVED',
      createdAt: '2026-11-10',
      scenesCount: 4,
    },
  ];

  const filteredReels =
    selectedFilter === 'ALL' ? reels : reels.filter((r) => r.status === selectedFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-[#C4B5FD]" />
            Reels Studio
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Review generated scripts, inspect scene compositions, render MP4s, and publish to Instagram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'SCRIPT_READY', 'RENDERED', 'NEEDS_REVIEW', 'APPROVED', 'PUBLISHED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedFilter === filter
                  ? 'bg-[#6F41EC] text-white shadow-md shadow-[#6F41EC]/30'
                  : 'bg-[#151D2A] text-[#94A3B8] hover:bg-[#233044]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#151D2A] border border-[#233044] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#233044] bg-[#0F1623]/60 text-xs uppercase font-bold text-[#64748B]">
              <th className="py-4 px-6">Reel & Hook</th>
              <th className="py-4 px-6">Duration</th>
              <th className="py-4 px-6">Scenes</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#233044]/60">
            {filteredReels.map((reel) => (
              <tr key={reel.id} className="hover:bg-[#1E293B]/40 transition">
                <td className="py-4 px-6">
                  <div className="font-bold text-white text-base">{reel.title}</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1 italic">
                    "{reel.hook}"
                  </div>
                </td>
                <td className="py-4 px-6 font-mono text-[#94A3B8]">
                  {reel.durationSeconds}s
                </td>
                <td className="py-4 px-6 text-[#94A3B8]">{reel.scenesCount} scenes</td>
                <td className="py-4 px-6">
                  <StatusBadge status={reel.status} />
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      title="Render video"
                      className="p-2 rounded-lg bg-[#233044] hover:bg-[#6F41EC] text-white transition"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      title="Approve for publishing"
                      className="p-2 rounded-lg bg-[#233044] hover:bg-emerald-600 text-white transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      title="Publish to Instagram"
                      className="p-2 rounded-lg bg-[#233044] hover:bg-cyan-600 text-white transition"
                    >
                      <UploadCloud className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

