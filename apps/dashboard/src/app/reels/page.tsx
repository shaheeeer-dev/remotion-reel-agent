'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Film, Play, CheckCircle, UploadCloud, Loader2, AlertCircle, Eye, X, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchApi } from '../../lib/api-client';

interface ReelItem {
  id: string;
  title: string;
  hook: string;
  durationSeconds: number;
  status: string;
  createdAt: string;
  scenesCount: number;
  videoUrl?: string | null;
}

const DEFAULT_REELS: ReelItem[] = [
  {
    id: 'test2-linux-etc',
    title: 'Linux: What is the /etc Directory?',
    hook: 'Where does Linux keep all its configuration?',
    durationSeconds: 16,
    status: 'RENDERED',
    createdAt: '2026-11-10',
    scenesCount: 4,
    videoUrl: null,
  },
  {
    id: 'test2-docker-container',
    title: 'Docker: What is a Container Really?',
    hook: 'Is a Docker container just a lightweight VM?',
    durationSeconds: 16,
    status: 'NEEDS_REVIEW',
    createdAt: '2026-11-10',
    scenesCount: 4,
    videoUrl: null,
  },
  {
    id: 'test2-devops-cicd',
    title: 'DevOps: What is CI/CD?',
    hook: 'What actually happens when you git push?',
    durationSeconds: 17,
    status: 'APPROVED',
    createdAt: '2026-11-10',
    scenesCount: 4,
    videoUrl: null,
  },
];

export default function ReelsPage() {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [reels, setReels] = useState<ReelItem[]>(DEFAULT_REELS);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<{ title: string; url: string } | null>(null);

  const loadReels = useCallback(async () => {
    try {
      const res = await fetchApi<{ data: any[] }>('/api/v1/brands/learnops/reels');
      if (res.data && res.data.length > 0) {
        setReels(
          res.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            hook: r.hook,
            durationSeconds: r.durationSeconds,
            status: r.status,
            createdAt: r.createdAt.slice(0, 10),
            scenesCount: r.scenes?.length || (r.scriptJson?.scenes?.length ?? 4),
            videoUrl: r.mediaAssets?.[0]?.publicUrl || null,
          }))
        );
      }
    } catch {
      // Fallback to reference reels if backend is offline
    }
  }, []);

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  // Periodic polling if any reel is currently rendering
  useEffect(() => {
    const hasRendering = reels.some((r) => r.status === 'RENDERING');
    if (!hasRendering) return;

    const interval = setInterval(() => {
      loadReels();
    }, 4000);

    return () => clearInterval(interval);
  }, [reels, loadReels]);

  const handleAction = async (reelId: string, action: 'render' | 'approve' | 'publish') => {
    setIsProcessing(`${reelId}-${action}`);
    setToastMessage(null);

    try {
      const res = await fetchApi<any>(`/api/v1/reels/${reelId}/${action}`, {
        method: 'POST',
      });

      setToastMessage(`Success: ${res.message || `Action ${action} enqueued`}`);

      // Optimistic UI state update
      setReels((prev) =>
        prev.map((r) => {
          if (r.id !== reelId) return r;
          let newStatus = r.status;
          if (action === 'render') newStatus = 'RENDERING';
          if (action === 'approve') newStatus = 'APPROVED';
          if (action === 'publish') newStatus = 'PUBLISHING';
          return { ...r, status: newStatus };
        })
      );

      // Re-fetch after brief delay to catch immediate transitions
      setTimeout(loadReels, 2000);
    } catch (err: any) {
      setToastMessage(`Notice: ${err.message || `API request submitted (${action})`}`);
    } finally {
      setIsProcessing(null);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  const filteredReels =
    selectedFilter === 'ALL' ? reels : reels.filter((r) => r.status === selectedFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1E1E2C] tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-[#F29F67]" />
            Reels Studio
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Review generated scripts, inspect scene compositions, render MP4s, and publish to Instagram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadReels()}
            className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E1E2C] hover:bg-slate-50 transition shadow-sm"
            title="Refresh reels list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {['ALL', 'SCRIPT_READY', 'RENDERING', 'NEEDS_REVIEW', 'APPROVED', 'PUBLISHED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedFilter === filter
                  ? 'bg-[#FDEEE3] text-[#F29F67] border border-[#F29F67]/40 shadow-sm'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 px-4 rounded-xl bg-white border border-[#F29F67]/50 text-sm text-[#1E1E2C] shadow-sm">
          <AlertCircle className="w-4 h-4 text-[#F29F67] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Video Player Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-md w-full relative space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-[#1E1E2C] text-base truncate pr-4">{activePreview.title}</h3>
              <button
                onClick={() => setActivePreview(null)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#1E1E2C] hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-[9/16] w-full max-h-[65vh] rounded-2xl overflow-hidden bg-black mx-auto shadow-inner">
              <video
                src={activePreview.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
              <span>Resolution: 1080x1920 (9:16)</span>
              <a
                href={activePreview.url}
                target="_blank"
                rel="noreferrer"
                download
                className="text-[#F29F67] font-bold hover:underline"
              >
                Download MP4
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA] text-[11px] uppercase font-bold text-[#64748B]">
              <th className="py-4 px-6">Reel & Hook</th>
              <th className="py-4 px-6">Duration</th>
              <th className="py-4 px-6">Scenes</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filteredReels.map((reel) => (
              <tr key={reel.id} className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-6">
                  <div className="font-bold text-[#1E1E2C] text-sm">{reel.title}</div>
                  <div className="text-xs text-[#64748B] mt-0.5 line-clamp-1 italic">
                    "{reel.hook}"
                  </div>
                </td>
                <td className="py-4 px-6 font-mono text-xs font-semibold text-[#64748B]">
                  {reel.durationSeconds}s
                </td>
                <td className="py-4 px-6 text-xs text-[#64748B]">{reel.scenesCount} scenes</td>
                <td className="py-4 px-6">
                  <StatusBadge status={reel.status} />
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {reel.videoUrl && (
                      <button
                        onClick={() => setActivePreview({ title: reel.title, url: reel.videoUrl! })}
                        title="Watch rendered MP4"
                        className="p-2 rounded-xl bg-[#34B1AA]/15 text-[#18857E] hover:bg-[#34B1AA] hover:text-white transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(reel.id, 'render')}
                      disabled={isProcessing !== null || reel.status === 'RENDERING'}
                      title="Render video via Remotion"
                      className="p-2 rounded-xl bg-[#1E1E2C] hover:bg-[#F29F67] text-white transition disabled:opacity-50"
                    >
                      {isProcessing === `${reel.id}-render` || reel.status === 'RENDERING' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#F29F67]" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(reel.id, 'approve')}
                      disabled={isProcessing !== null || (reel.status !== 'NEEDS_REVIEW' && !reel.videoUrl)}
                      title="Approve for publishing"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition disabled:opacity-50"
                    >
                      {isProcessing === `${reel.id}-approve` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(reel.id, 'publish')}
                      disabled={isProcessing !== null || (reel.status !== 'APPROVED' && reel.status !== 'SCHEDULED')}
                      title="Publish to Instagram"
                      className="p-2 rounded-xl bg-[#3B8FF3]/15 text-[#2475D6] hover:bg-[#3B8FF3] hover:text-white transition disabled:opacity-50"
                    >
                      {isProcessing === `${reel.id}-publish` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
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
