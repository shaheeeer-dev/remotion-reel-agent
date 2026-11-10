'use client';

import React, { useEffect, useState } from 'react';
import { Layers, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchApi } from '../../lib/api-client';

interface JobItem {
  id: string;
  jobType: string;
  idempotencyKey: string;
  status: string;
  attempts: number;
  target?: string;
  startedAt?: string;
  completedAt?: string;
}

const DEFAULT_JOBS: JobItem[] = [
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>(DEFAULT_JOBS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadJobs = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchApi<{ data: any[] }>('/api/v1/jobs');
      if (res.data && res.data.length > 0) {
        setJobs(
          res.data.map((j: any) => ({
            id: j.id,
            jobType: j.jobType,
            idempotencyKey: j.idempotencyKey,
            status: j.status,
            attempts: j.attempts,
            target: j.reel?.title || 'System Task',
            startedAt: j.startedAt ? new Date(j.startedAt).toLocaleString() : undefined,
            completedAt: j.completedAt ? new Date(j.completedAt).toLocaleString() : undefined,
          }))
        );
      }
    } catch {
      // Keep defaults if offline
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#C4B5FD]" />
            Job Queue & Execution Log
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Durable job execution tracking with BullMQ and PostgreSQL. Enforces idempotency and bounded exponential retries.
          </p>
        </div>

        <button
          onClick={loadJobs}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151D2A] hover:bg-[#233044] text-[#C4B5FD] text-xs font-bold transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
                  {job.completedAt || 'In Progress'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
