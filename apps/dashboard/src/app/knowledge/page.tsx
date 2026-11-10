'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  source: string;
  content: string;
  isApproved: boolean;
}

const DEFAULT_DOCS: KnowledgeDoc[] = [
  {
    id: 'doc-1',
    title: 'Linux /etc Directory Specification',
    category: 'Linux',
    source: 'FHS (Filesystem Hierarchy Standard)',
    content:
      'The /etc directory hierarchy contains configuration files. A "configuration file" is a local file used to control the operation of a program; it must be static and cannot be an executable binary. Examples include /etc/hosts, /etc/passwd, /etc/resolv.conf, and service configs such as /etc/nginx/nginx.conf.',
    isApproved: true,
  },
  {
    id: 'doc-2',
    title: 'Docker Container Runtime Isolation',
    category: 'Docker',
    source: 'OCI & Linux Kernel Documentation',
    content:
      'Containers are not virtual machines. They share the host OS kernel and use Linux cgroups (control groups for CPU, memory, I/O limits) and namespaces (pid, net, mnt, ipc, uts for process isolation). A container starts in milliseconds and has virtually zero hypervisor overhead.',
    isApproved: true,
  },
  {
    id: 'doc-3',
    title: 'Continuous Integration & Continuous Delivery Principles',
    category: 'DevOps',
    source: 'DevOps Handbook & DORA Metrics',
    content:
      'CI/CD automates code integration, testing, packaging (Docker images), and deployment to staging and production. Key stages: Source checkout -> Build & Lint -> Automated Tests -> Artifact Packaging -> Progressive/Canary Deployment.',
    isApproved: true,
  },
];

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>(DEFAULT_DOCS);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetchApi<{ data: KnowledgeDoc[] }>('/api/v1/brands/learnops/knowledge');
        if (res.data && res.data.length > 0) {
          setDocs(res.data);
        }
      } catch {
        // Fallback to default docs
      }
    }
    loadDocs();
  }, []);

  const toggleApproval = async (docId: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/api/v1/brands/learnops/knowledge/${docId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      setDocs((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isApproved: !currentStatus } : d))
      );
      setStatusMsg(`Document approval ${!currentStatus ? 'granted' : 'revoked'}.`);
    } catch {
      setDocs((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isApproved: !currentStatus } : d))
      );
      setStatusMsg(`Document approval state toggled locally.`);
    } finally {
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#C4B5FD]" />
            Knowledge Base
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Verified technical facts and brand claims. Gemini free-tier receives ONLY approved context documents.
          </p>
        </div>

        <button
          onClick={() => {
            const title = prompt('Enter document title:');
            if (title) {
              const category = prompt('Category (e.g. Linux, Docker, CI/CD):') || 'Linux';
              const source = prompt('Source reference:') || 'Documentation';
              const content = prompt('Content / fact description:') || '';
              fetchApi('/api/v1/brands/learnops/knowledge', {
                method: 'POST',
                body: JSON.stringify({ title, category, source, content, isApproved: true }),
              })
                .then(() => alert('Knowledge document added!'))
                .catch(() => {
                  setDocs((prev) => [
                    ...prev,
                    { id: `doc-${Date.now()}`, title, category, source, content, isApproved: true },
                  ]);
                });
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6F41EC] hover:bg-[#825CF0] text-white text-sm font-bold shadow-lg shadow-[#6F41EC]/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 p-3 px-4 rounded-xl bg-[#151D2A] border border-[#6F41EC]/50 text-sm text-[#C4B5FD]">
          <AlertCircle className="w-4 h-4 text-[#C4B5FD] shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-2xl bg-[#151D2A] border border-[#233044] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#C4B5FD] uppercase tracking-wider">
                  {doc.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{doc.title}</h3>
                <span className="text-xs text-[#64748B]">Source: {doc.source}</span>
              </div>

              <button
                onClick={() => toggleApproval(doc.id, doc.isApproved)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                  doc.isApproved
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                {doc.isApproved ? (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Approved for Prompts
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" /> Pending Approval (Excluded)
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-[#94A3B8] leading-relaxed bg-[#0F1623] p-4 rounded-xl border border-[#233044]/60">
              {doc.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
