'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle, Plus, ShieldCheck } from 'lucide-react';

export default function KnowledgePage() {
  const [docs, setDocs] = useState([
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
      title: 'Docker Container Runtime Isolation',
      category: 'Docker',
      source: 'OCI & Linux Kernel Documentation',
      content:
        'Containers are not virtual machines. They share the host OS kernel and use Linux cgroups (control groups for CPU, memory, I/O limits) and namespaces (pid, net, mnt, ipc, uts for process isolation). A container starts in milliseconds and has virtually zero hypervisor overhead.',
      isApproved: true,
    },
    {
      title: 'Continuous Integration & Continuous Delivery Principles',
      category: 'DevOps',
      source: 'DevOps Handbook & DORA Metrics',
      content:
        'CI/CD automates code integration, testing, packaging (Docker images), and deployment to staging and production. Key stages: Source checkout -> Build & Lint -> Automated Tests -> Artifact Packaging -> Progressive/Canary Deployment.',
      isApproved: true,
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#FF6B00]" />
            Knowledge Base
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Verified technical facts and brand claims. Gemini free-tier receives ONLY approved context documents.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8533] text-white text-sm font-bold shadow-lg shadow-[#FF6B00]/30 transition">
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      <div className="space-y-4">
        {docs.map((doc, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#151D2A] border border-[#233044] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                  {doc.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{doc.title}</h3>
                <span className="text-xs text-[#64748B]">Source: {doc.source}</span>
              </div>

              {doc.isApproved && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Approved for Prompts
                </span>
              )}
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
