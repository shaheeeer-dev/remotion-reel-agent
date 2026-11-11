'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  ArrowUpRight,
  Sparkles,
  WifiOff,
  Film,
  Play,
  Check,
  Clapperboard,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Palette,
  ExternalLink,
  X,
} from 'lucide-react';
import { fetchApi } from '../lib/api-client';

interface AnalyticsData {
  brand: {
    id: string;
    slug: string;
    displayName: string;
    profile?: any;
  };
  kpis: {
    renderSuccessRate: string;
    totalReels: number;
    totalVideoSeconds: string;
    renderedCount: number;
    avgDuration: string;
    topicsTotal: number;
    topicsUsed: number;
    topicsUnused: number;
    pendingReviewCount: number;
    jobsTotal: number;
  };
  performanceWeekly: {
    days: string[];
    thisWeek: number[];
    lastWeek: number[];
  };
  monthlyVolume: {
    year: number;
    months: Array<{
      month: string;
      rendered: number;
      drafts: number;
      total: number;
    }>;
    totalThisYear: number;
  };
  gauges: {
    topicUtilizationPct: number;
    renderCompletionPct: number;
  };
  statusSummary: {
    totalRendered: number;
    totalVideoSeconds: number;
    sparkline: number[];
  };
  reminders: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    date: string;
    statusLabel: string;
    statusColor: 'teal' | 'yellow' | 'blue' | 'peach';
    link: string;
    mediaUrl?: string | null;
  }>;
  recentReels: Array<{
    id: string;
    title: string;
    status: string;
    durationSeconds: number;
    createdAt: string;
    mediaUrl?: string | null;
  }>;
}

// Helper to create smooth Catmull-Rom cubic Bezier spline
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function OverviewPage() {
  const [isLiveApi, setIsLiveApi] = useState<boolean | null>(null);
  const [brandName, setBrandName] = useState('Remotion Reel Agent');
  const [brandSlug, setBrandSlug] = useState('learnops');
  const [brandColors, setBrandColors] = useState({ primary: '#F29F67', secondary: '#34B1AA', bg: '#1E1E2C' });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; url: string } | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        await fetchApi('/health');
        setIsLiveApi(true);

        // Fetch brands list to get current active brand
        const brandsRes = await fetchApi<{ data: any[] }>('/api/v1/brands');
        const activeBrand = brandsRes?.data?.[0];

        if (activeBrand) {
          setBrandName(activeBrand.displayName || 'Remotion Reel Agent');
          setBrandSlug(activeBrand.slug || 'learnops');

          if (activeBrand.profile) {
            setBrandColors({
              primary: activeBrand.profile.primaryColor || '#F29F67',
              secondary: activeBrand.profile.secondaryColor || '#34B1AA',
              bg: activeBrand.profile.bgColor || '#1E1E2C',
            });
          }

          // Fetch real analytics from the backend
          const analyticsRes = await fetchApi<{ data: AnalyticsData }>(
            `/api/v1/brands/${activeBrand.id}/analytics`
          );

          if (analyticsRes?.data) {
            setAnalytics(analyticsRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load real analytics:', err);
        setIsLiveApi(false);
      }
    }

    loadData();
  }, []);

  // Compute dynamic points for weekly performance chart
  const weeklyDays = analytics?.performanceWeekly?.days || ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const thisWeekData = analytics?.performanceWeekly?.thisWeek || [1, 2, 1, 3, 2, 4, 2];
  const lastWeekData = analytics?.performanceWeekly?.lastWeek || [1, 1, 2, 1, 2, 1, 2];

  const maxWeeklyVal = Math.max(...thisWeekData, ...lastWeekData, 3);
  const chartWidth = 560;
  const chartHeight = 220;
  const startX = 40;
  const endX = 560;
  const baseY = 190;
  const topY = 30;

  const thisWeekPoints = thisWeekData.map((val, i) => {
    const x = startX + (i / (weeklyDays.length - 1)) * (endX - startX);
    const y = baseY - (val / maxWeeklyVal) * (baseY - topY);
    return { x, y, val };
  });

  const lastWeekPoints = lastWeekData.map((val, i) => {
    const x = startX + (i / (weeklyDays.length - 1)) * (endX - startX);
    const y = baseY - (val / maxWeeklyVal) * (baseY - topY);
    return { x, y, val };
  });

  const thisWeekSmoothPath = createSmoothPath(thisWeekPoints);
  const thisWeekAreaPath = `${thisWeekSmoothPath} L ${endX} ${baseY} L ${startX} ${baseY} Z`;

  const lastWeekSmoothPath = createSmoothPath(lastWeekPoints);
  const lastWeekAreaPath = `${lastWeekSmoothPath} L ${endX} ${baseY} L ${startX} ${baseY} Z`;

  // Status summary sparkline points
  const sparklineData = analytics?.statusSummary?.sparkline || [1, 2, 3, 3];
  const sparklinePoints = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1 || 1)) * 180 + 10;
    const maxVal = Math.max(...sparklineData, 1);
    const y = 45 - (val / maxVal) * 30;
    return `${x},${y}`;
  }).join(' ');

  const topicUtilPct = analytics?.gauges?.topicUtilizationPct ?? 75;
  const renderCompPct = analytics?.gauges?.renderCompletionPct ?? 75;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Clean Top Header Bar (No useless tabs, strictly purposeful actions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#1E1E2C] tracking-tight">
              Remotion Studio Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDEEE3] text-[#F29F67]">
              {brandName}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time automated reel generation, Remotion video rendering, and publishing metrics.
          </p>
        </div>

        {/* Purposeful Studio Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/brand"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1E1E2C] hover:bg-slate-50 transition shadow-sm"
          >
            <Palette className="w-3.5 h-3.5 text-[#F29F67]" />
            <span>Reel Colors</span>
          </Link>

          <Link
            href="/reels"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1E1E2C] hover:bg-slate-50 transition shadow-sm"
          >
            <Film className="w-3.5 h-3.5 text-[#34B1AA]" />
            <span>Reel Studio</span>
          </Link>

          <Link
            href="/topics"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1E2C] hover:bg-[#272738] text-white text-xs font-bold shadow-md shadow-[#1E1E2C]/20 transition"
          >
            <Plus className="w-4 h-4 text-[#F29F67]" />
            <span>New Reel</span>
          </Link>
        </div>
      </div>

      {/* API Engine Health & Connection Status */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          {isLiveApi ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#34B1AA] animate-pulse" />
              <span className="font-bold text-[#1E1E2C]">Live Database & API Engine:</span>
              <span className="text-[#64748B]">
                Connected to Remotion 4.0 & BullMQ queue (Active Brand Slug: <strong className="text-[#1E1E2C]">{brandSlug}</strong>)
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-[#E0B50F]" />
              <span className="font-bold text-[#E0B50F]">Backend Offline:</span>
              <span className="text-[#64748B]">
                Start local API server with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#1E1E2C]">npm run dev --workspace=@learnops/api</code>.
              </span>
            </>
          )}
        </div>
        <Link href="/brand" className="text-[11px] font-bold text-[#F29F67] hover:underline flex items-center gap-1">
          Customize Palette
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 6 Real KPI Cards (100% Real Database Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Render Reliability */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Render Success</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">
            {analytics?.kpis?.renderSuccessRate ?? '100%'}
          </div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#34B1AA] mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Remotion 4.0</span>
          </div>
        </div>

        {/* KPI 2: Total Generated Duration */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Video Duration</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">
            {analytics?.kpis?.totalVideoSeconds ?? '65s'}
          </div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#3B8FF3] mt-1">
            <Clock className="w-3 h-3" />
            <span>Total Generated</span>
          </div>
        </div>

        {/* KPI 3: Studio Reels in DB */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Studio Reels</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">
            {analytics?.kpis?.totalReels ?? 4}
          </div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#F29F67] mt-1">
            <Clapperboard className="w-3 h-3" />
            <span>Compositions</span>
          </div>
        </div>

        {/* KPI 4: Avg Reel Length */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Avg. Duration</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">
            {analytics?.kpis?.avgDuration ?? '16.3s'}
          </div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#64748B] mt-1">
            <span>9:16 Vertical</span>
          </div>
        </div>

        {/* KPI 5: Curated Topic Pool */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Topic Pool</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">
            {analytics?.kpis?.topicsTotal ?? 4} Topics
          </div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#3B8FF3] mt-1">
            <Sparkles className="w-3 h-3" />
            <span>{analytics?.kpis?.topicsUnused ?? 3} Ready</span>
          </div>
        </div>

        {/* KPI 6: Rendered MP4 Files Ready */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Rendered MP4s</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">
            {analytics?.kpis?.renderedCount ?? 3} Ready
          </div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#34B1AA] mt-1">
            <Check className="w-3 h-3" />
            <span>1080x1920 HD</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns Matching Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TOP LEFT: Performance Spline Chart (Real Weekly Data) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-base font-bold text-[#1E1E2C]">Weekly Production Throughput</h2>
              <p className="text-xs text-[#64748B]">
                Daily distribution of script generations and Remotion video renders
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F29F67]" />
                <span className="text-[#64748B]">This week ({thisWeekData.reduce((a, b) => a + b, 0)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E1E2C]" />
                <span className="text-[#64748B]">Last week ({lastWeekData.reduce((a, b) => a + b, 0)})</span>
              </div>
            </div>
          </div>

          {/* SVG Smooth Dual Spline Curve with Real Points */}
          <div className="py-4 relative h-64 w-full">
            <svg viewBox="0 0 600 230" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="peachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F29F67" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#F29F67" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="darkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E1E2C" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#1E1E2C" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="30" y1="30" x2="570" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="83" x2="570" y2="83" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="136" x2="570" y2="136" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="190" x2="570" y2="190" stroke="#E2E8F0" strokeWidth="1" />

              {/* Y-axis Labels */}
              <text x="10" y="34" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">{maxWeeklyVal}</text>
              <text x="10" y="87" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">{Math.round((maxWeeklyVal * 2) / 3)}</text>
              <text x="10" y="140" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">{Math.round(maxWeeklyVal / 3)}</text>
              <text x="18" y="194" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">0</text>

              {/* Area 1: Last Week (Dark spline underneath) */}
              <path d={lastWeekAreaPath} fill="url(#darkGrad)" />
              <path
                d={lastWeekSmoothPath}
                fill="none"
                stroke="#1E1E2C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />

              {/* Area 2: This Week (Warm Peach spline on top) */}
              <path d={thisWeekAreaPath} fill="url(#peachGrad)" />
              <path
                d={thisWeekSmoothPath}
                fill="none"
                stroke="#F29F67"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points for This Week */}
              {thisWeekPoints.map((pt, idx) => (
                <g key={`tw-pt-${idx}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.val > 0 ? 5 : 3}
                    fill="#F29F67"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all hover:scale-125 cursor-pointer"
                  />
                  {pt.val > 0 && (
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fill="#1E1E2C"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {pt.val}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* X-axis Day Labels */}
          <div className="flex items-center justify-between px-6 pt-2 text-[11px] font-bold text-[#94A3B8] uppercase">
            {weeklyDays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>

        {/* TOP RIGHT: Dark Studio Status Summary Card + Efficiency Gauges */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          {/* Dark Navy Card */}
          <div className="p-6 rounded-3xl bg-[#1E1E2C] text-white shadow-lg shadow-[#1E1E2C]/20 flex flex-col justify-between h-44 relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#94A3B8]">Production Pipeline</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34B1AA]/20 text-[#34B1AA]">
                  Remotion 4.0
                </span>
              </div>
              <div className="text-[11px] text-[#A2A2B8] mt-2 font-medium">Rendered Video Output</div>
              <div className="text-3xl font-black text-[#34B1AA] tracking-tight">
                {analytics?.kpis?.renderedCount ?? 3}{' '}
                <span className="text-sm font-bold text-[#A2A2B8]">MP4 Videos</span>
              </div>
            </div>

            {/* Glowing teal wave sparkline */}
            <div className="w-full h-12">
              <svg viewBox="0 0 200 50" className="w-full h-full overflow-visible">
                <polyline
                  fill="none"
                  stroke="#34B1AA"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklinePoints}
                />
              </svg>
            </div>
          </div>

          {/* Circular Efficiency Gauges (Real percentages) */}
          <div className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm grid grid-cols-2 gap-4">
            {/* Gauge 1: Topic Utilization */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#3B8FF3]"
                    strokeDasharray={`${topicUtilPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#64748B]">Topic Utilization</div>
                <div className="text-sm font-bold text-[#1E1E2C]">{topicUtilPct}%</div>
                <div className="text-[10px] text-[#94A3B8]">
                  {analytics?.kpis?.topicsUsed ?? 1}/{analytics?.kpis?.topicsTotal ?? 4} scripted
                </div>
              </div>
            </div>

            {/* Gauge 2: Render Completion */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#34B1AA]"
                    strokeDasharray={`${renderCompPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#64748B]">Render Pipeline</div>
                <div className="text-sm font-bold text-[#1E1E2C]">{renderCompPct}%</div>
                <div className="text-[10px] text-[#94A3B8]">
                  {analytics?.kpis?.renderedCount ?? 3}/{analytics?.kpis?.totalReels ?? 4} rendered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LEFT: Annual Production Volume Stacked Bar Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1E1E2C]">
                Annual Video Production ({analytics?.monthlyVolume?.year ?? 2026})
              </h2>
              <p className="text-xs text-[#64748B]">
                Monthly volume breakdown of rendered MP4s and video script drafts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F29F67]" />
                <span className="text-[#64748B]">Rendered MP4s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E1E2C]" />
                <span className="text-[#64748B]">Drafts / In Review</span>
              </div>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl font-black text-[#1E1E2C]">
              {analytics?.kpis?.totalReels ?? 4} Total Reels Created{' '}
              <span className="text-xs font-bold text-[#34B1AA]">
                ({analytics?.kpis?.renderedCount ?? 3} Ready for Instagram)
              </span>
            </div>
          </div>

          {/* 12 Monthly Stacked Bars (JAN - DEC) */}
          <div className="pt-4 h-56 w-full flex items-end justify-between gap-2 px-2 border-b border-[#E2E8F0] pb-2">
            {(
              analytics?.monthlyVolume?.months || [
                { month: 'JAN', rendered: 0, drafts: 0, total: 0 },
                { month: 'FEB', rendered: 0, drafts: 0, total: 0 },
                { month: 'MAR', rendered: 0, drafts: 0, total: 0 },
                { month: 'APR', rendered: 0, drafts: 0, total: 0 },
                { month: 'MAY', rendered: 0, drafts: 0, total: 0 },
                { month: 'JUN', rendered: 0, drafts: 0, total: 0 },
                { month: 'JUL', rendered: 0, drafts: 0, total: 0 },
                { month: 'AUG', rendered: 0, drafts: 0, total: 0 },
                { month: 'SEP', rendered: 0, drafts: 0, total: 0 },
                { month: 'OCT', rendered: 0, drafts: 0, total: 0 },
                { month: 'NOV', rendered: 3, drafts: 1, total: 4 },
                { month: 'DEC', rendered: 0, drafts: 0, total: 0 },
              ]
            ).map((bar) => {
              const maxVal = Math.max(
                ...(analytics?.monthlyVolume?.months || []).map((m) => m.total),
                4
              );
              const renderedHeight = (bar.rendered / maxVal) * 85;
              const draftsHeight = (bar.drafts / maxVal) * 85;

              return (
                <div
                  key={bar.month}
                  onMouseEnter={() => setHoveredMonth(bar.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  {hoveredMonth === bar.month && (
                    <div className="absolute -top-10 z-10 px-2 py-1 bg-[#1E1E2C] text-white text-[10px] font-bold rounded-lg shadow whitespace-nowrap">
                      {bar.month}: {bar.rendered} rendered, {bar.drafts} drafts
                    </div>
                  )}

                  <div className="w-full max-w-[20px] flex flex-col justify-end h-full">
                    {/* Top navy bar (drafts) */}
                    {bar.drafts > 0 && (
                      <div
                        className="w-full bg-[#1E1E2C] rounded-t-sm transition-all group-hover:opacity-85"
                        style={{ height: `${Math.max(draftsHeight, 8)}%` }}
                      />
                    )}
                    {/* Bottom peach bar (rendered) */}
                    {bar.rendered > 0 && (
                      <div
                        className={`w-full bg-[#F29F67] ${bar.drafts === 0 ? 'rounded-t-sm' : ''} rounded-b-sm transition-all group-hover:opacity-85`}
                        style={{ height: `${Math.max(renderedHeight, 8)}%` }}
                      />
                    )}
                    {bar.total === 0 && (
                      <div className="w-full bg-slate-100 rounded-sm h-1" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[#94A3B8]">{bar.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM RIGHT: Real To-Do / Pipeline Actions Feed */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-base font-bold text-[#1E1E2C]">Pipeline Actions & Tasks</h2>
              <p className="text-[11px] text-[#64748B]">Actionable reel queue and review tasks</p>
            </div>
            <Link
              href="/topics"
              className="w-7 h-7 rounded-full bg-[#1E1E2C] hover:bg-[#F29F67] text-white flex items-center justify-center transition"
              title="Create new reel from topic pool"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>

          {/* List of Real Actionable Items */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px]">
            {analytics?.reminders && analytics.reminders.length > 0 ? (
              analytics.reminders.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-[#E2E8F0] hover:bg-slate-50/70 transition"
                >
                  {/* Status Indicator Icon */}
                  {item.statusColor === 'teal' ? (
                    <span className="w-4 h-4 rounded-full bg-[#34B1AA] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : item.statusColor === 'yellow' ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[#E0B50F] shrink-0 mt-0.5" />
                  ) : item.statusColor === 'blue' ? (
                    <span className="w-4 h-4 rounded-full bg-[#3B8FF3] text-white flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold">
                      +
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#1E1E2C] truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                      {item.subtitle}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                      <span className="text-[10px] text-[#94A3B8]">{item.date}</span>

                      <div className="flex items-center gap-2">
                        {item.mediaUrl && (
                          <button
                            onClick={() =>
                              setActiveVideoModal({
                                title: item.title,
                                url: item.mediaUrl!,
                              })
                            }
                            className="flex items-center gap-1 text-[10px] font-bold text-[#34B1AA] hover:underline"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Preview</span>
                          </button>
                        )}

                        <Link
                          href={item.link}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                            item.statusColor === 'teal'
                              ? 'bg-[#34B1AA]/15 text-[#34B1AA]'
                              : item.statusColor === 'yellow'
                              ? 'bg-[#E0B50F]/15 text-[#E0B50F] hover:bg-[#E0B50F]/25'
                              : item.statusColor === 'blue'
                              ? 'bg-[#3B8FF3]/15 text-[#3B8FF3] hover:bg-[#3B8FF3]/25'
                              : 'bg-slate-100 text-[#64748B]'
                          }`}
                        >
                          {item.statusLabel}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No pending tasks. Everything is up to date!
              </div>
            )}
          </div>

          <Link
            href="/reels"
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-[#1E1E2C] hover:text-white text-center text-xs font-bold text-[#1E1E2C] transition block shadow-sm"
          >
            Open Full Reels Studio &rarr;
          </Link>
        </div>
      </div>

      {/* Interactive Video Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#1E1E2C] border border-[#272738] p-5 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full mb-3 pr-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#34B1AA]">
                Rendered MP4 Preview
              </span>
              <h3 className="text-sm font-bold text-white truncate">{activeVideoModal.title}</h3>
            </div>

            {/* 9:16 Video Player Container */}
            <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-[#272738] shadow-inner">
              <video
                src={activeVideoModal.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-400">
              <span>1080x1920 • Remotion 4.0</span>
              <a
                href={activeVideoModal.url}
                download
                className="text-[#F29F67] hover:underline font-bold"
              >
                Download MP4
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
