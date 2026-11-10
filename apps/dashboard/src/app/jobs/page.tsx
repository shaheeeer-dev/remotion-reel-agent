'use client';

import React from 'react';
import { Layers, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export default function JobsPage() {
  const jobs = [
    {
      id: 'job-1',
      jobType: 'RENDER_VIDEO',
      idempotencyKey: 'render_linux-etc_1731278400',
      status: 'SUCCEEDED',
      attempts: 1,
      target: 'Linux: What is /etc?',
      startedAt: '2026-11-10 22:30:12',
      completedAt: '2026-11-10 22:30:34',
    },
    {
      id: 'job-2',
      jobType: 'RENDER_VIDEO',
      idempotencyKey: 'render_docker-container_1731278415',
      status: 'SUCCEEDED',
      attempts: 1,
      target: 'Docker: What is a Container Really?',
      startedAt: '2026-11-10 22:31:00',
      completedAt: '2026-11-10 22:31:22',
    },
    {
      id: 'job-3',
      jobType: 'RENDER_VIDEO',
      idempotencyKey: 'render_devops-cicd_1731278430',
      status: 'SUCCEEDED',
      attempts: 1,
      target: 'DevOps: What is CI/CD?',
      startedAt: '2026-11-10 22:32:00',
      completedAt: '2026-11-10 22:32:25',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#FF6B00]" />
          Job Queue & Execution Log
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Durable job execution tracking with BullMQ and PostgreSQL. Enforces idempotency and bounded exponential retries.
        </p>
      </div>

      <div className="bg-[#151D2A] border border-[#233044] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#233044] bg-[#0F1623]/60 text-xs uppercase font-bold text-[#64748B]">
              <th className="py-4 px-6">Job Type & Target</th>
              <th className="py-4 px-6">Idempotency Key</th>
              <th className="py-4 px-6">Attempts</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#233044]/60">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-[#1E293B]/40 transition">
                <td className="py-4 px-6">
                  <div className="font-bold text-white text-sm">{job.jobType}</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">{job.target}</div>
                </td>
                <td className="py-4 px-6 font-mono text-xs text-[#64748B]">
                  {job.idempotencyKey}
                </td>
                <td className="py-4 px-6 text-[#94A3B8] text-xs">{job.attempts}</td>
                <td className="py-4 px-6">
                  <StatusBadge status={job.status} />
                </td>
                <td className="py-4 px-6 text-xs text-[#64748B] font-mono">
                  {job.completedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
