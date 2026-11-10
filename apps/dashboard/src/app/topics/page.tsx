'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListTodo, Plus, Sparkles, Check, Clock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

interface TopicItem {
  id: string;
  title: string;
  category: string;
  brief: string;
  isUsed: boolean;
}

const DEFAULT_TOPICS: TopicItem[] = [
  {
    id: 'top-1',
    title: 'Linux: What is the /etc Directory?',
    category: 'Linux',
    brief: 'Explain the role of /etc in Linux, showing the filesystem hierarchy and typical configuration files.',
    isUsed: true,
  },
  {
    id: 'top-2',
    title: 'Docker: What is a Container Really?',
    category: 'Docker',
    brief: 'Contrast containers with virtual machines. Highlight shared host kernel, namespaces, and cgroups.',
    isUsed: true,
  },
  {
    id: 'top-3',
    title: 'DevOps: What is CI/CD?',
    category: 'DevOps',
    brief: 'Walk through an automated pipeline from code commit to zero-downtime deployment.',
    isUsed: true,
  },
  {
    id: 'top-4',
    title: 'Linux: chmod vs chown',
    category: 'Linux',
    brief: 'Clear visual demonstration of permissions (rwx) vs file ownership.',
    isUsed: false,
  },
  {
    id: 'top-5',
    title: 'Docker Volumes vs Bind Mounts',
    category: 'Docker',
    brief: 'Data persistence in containers: when to use named volumes vs host bind mounts.',
    isUsed: false,
  },
];

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicItem[]>(DEFAULT_TOPICS);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopics() {
      try {
        const res = await fetchApi<{ data: TopicItem[] }>('/api/v1/brands/learnops/topics');
        if (res.data && res.data.length > 0) {
          setTopics(res.data);
        }
      } catch {
        // Fallback to default topics
      }
    }
    loadTopics();
  }, []);

  const handleGenerate = async (topicId: string) => {
    setIsGenerating(topicId);
    setStatusMessage(null);

    try {
      const res = await fetchApi<{ jobId: string; message: string }>(
        `/api/v1/brands/learnops/topics/${topicId}/generate`,
        { method: 'POST' }
      );
      setStatusMessage(`Enqueued generation: Job ID ${res.jobId || 'submitted'}`);

      // Optimistically mark topic as used
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, isUsed: true } : t))
      );
    } catch (err: any) {
      setStatusMessage(`API notice: ${err.message || 'Generation request submitted'}`);
    } finally {
      setIsGenerating(null);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-[#C4B5FD]" />
            Topic Pool
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Curated list of educational concepts. The daily queue picks an unused topic to generate and render.
          </p>
        </div>

        <button
          onClick={() => {
            const title = prompt('Enter new topic title:');
            if (title) {
              const category = prompt('Enter category (e.g. Linux, Docker, DevOps):') || 'DevOps';
              const brief = prompt('Enter brief description:') || '';
              fetchApi('/api/v1/brands/learnops/topics', {
                method: 'POST',
                body: JSON.stringify({ title, category, brief }),
              })
                .then(() => alert('Topic added!'))
                .catch(() => {
                  setTopics((prev) => [
                    ...prev,
                    { id: `top-${Date.now()}`, title, category, brief, isUsed: false },
                  ]);
                });
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6F41EC] hover:bg-[#825CF0] text-white text-sm font-bold shadow-lg shadow-[#6F41EC]/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      </div>

      {statusMessage && (
        <div className="flex items-center justify-between p-3.5 px-4 rounded-xl bg-[#151D2A] border border-[#6F41EC]/50 text-sm text-[#C4B5FD]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#C4B5FD] shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <Link
            href="/reels"
            className="flex items-center gap-1 font-bold text-white hover:text-[#C4B5FD] transition text-xs bg-[#6F41EC]/30 px-3 py-1.5 rounded-lg border border-[#6F41EC]/50"
          >
            Go to Reels Studio
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl bg-[#151D2A] border border-[#233044] flex flex-col justify-between hover:border-[#6F41EC]/50 transition"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#C4B5FD] uppercase tracking-wider">{t.category}</span>
                {t.isUsed ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Used in Reel
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Unused (Eligible)
                  </span>
                )}
              </div>
              <h3 className="font-bold text-white text-lg">{t.title}</h3>
              <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">{t.brief}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#233044] flex items-center justify-end">
              <button
                onClick={() => handleGenerate(t.id)}
                disabled={isGenerating !== null}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#233044] hover:bg-[#6F41EC] text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isGenerating === t.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
                )}
                {isGenerating === t.id ? 'Enqueuing...' : 'Generate Reel Script'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
