'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Share2,
  Printer,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  WifiOff,
  ChevronDown,
  Film,
  Play,
  Eye,
  Check,
  AlertCircle,
} from 'lucide-react';
import { fetchApi } from '../lib/api-client';

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'audiences' | 'demographics' | 'more'>('overview');
  const [isLiveApi, setIsLiveApi] = useState<boolean | null>(null);
  const [brandName, setBrandName] = useState('Remotion Reel');
  const [brandColors, setBrandColors] = useState({ primary: '#F29F67', secondary: '#34B1AA', bg: '#1E1E2C' });
  const [liveStats, setLiveStats] = useState({
    reelsCount: 4,
    topicsCount: 5,
    docsCount: 3,
  });
  const [recentReels, setRecentReels] = useState<any[]>([]);
  const [activeVideoPreview, setActiveVideoPreview] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        await fetchApi('/health');
        setIsLiveApi(true);

        const [brandsRes, topicsRes] = await Promise.allSettled([
          fetchApi<{ data: any[] }>('/api/v1/brands'),
          fetchApi<{ data: any[] }>('/api/v1/brands/learnops/topics'),
        ]);

        let reelsCount = 4;
        let topicsCount = 5;
        let docsCount = 3;

        if (brandsRes.status === 'fulfilled' && brandsRes.value.data.length > 0) {
          const brand = brandsRes.value.data[0];
          setBrandName(brand.displayName || 'Remotion Reel');
          if (brand.profile) {
            setBrandColors({
              primary: brand.profile.primaryColor || '#F29F67',
              secondary: brand.profile.secondaryColor || '#34B1AA',
              bg: brand.profile.bgColor || '#1E1E2C',
            });
          }

          const reelsRes = await fetchApi<{ data: any[] }>(`/api/v1/brands/${brand.id}/reels`).catch(() => null);
          const docsRes = await fetchApi<{ data: any[] }>(`/api/v1/brands/${brand.id}/knowledge`).catch(() => null);

          if (reelsRes?.data) {
            reelsCount = reelsRes.data.length;
            setRecentReels(reelsRes.data.slice(0, 4));
          }
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

    loadDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Bar & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        {/* Sub-navigation tabs matching image */}
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'audiences', label: 'Audiences' },
            { id: 'demographics', label: 'Demographics' },
            { id: 'more', label: 'More' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-white text-[#1E1E2C] shadow-sm border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#1E1E2C] hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons matching image: Share, Print, Export */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Dashboard link copied to clipboard!');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1E1E2C] hover:bg-slate-50 transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Share</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1E1E2C] hover:bg-slate-50 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Print</span>
          </button>

          <Link
            href="/topics"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1E2C] hover:bg-[#272738] text-white text-xs font-bold shadow-md shadow-[#1E1E2C]/20 transition"
          >
            <Plus className="w-4 h-4 text-[#F29F67]" />
            <span>New Reel</span>
          </Link>
        </div>
      </div>

      {/* API Health Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          {isLiveApi ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#34B1AA] animate-pulse" />
              <span className="font-bold text-[#1E1E2C]">API Engine Active:</span>
              <span className="text-[#64748B]">
                Connected to Remotion & BullMQ queue on port 4000 (Active Brand: <strong className="text-[#1E1E2C]">{brandName}</strong>)
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-[#E0B50F]" />
              <span className="font-bold text-[#E0B50F]">Backend Preview:</span>
              <span className="text-[#64748B]">
                Start local API with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#1E1E2C]">npm run dev:api</code>.
              </span>
            </>
          )}
        </div>
        <Link href="/brand" className="text-[11px] font-bold text-[#F29F67] hover:underline flex items-center gap-1">
          Edit Brand & Reel Colors
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Horizontal KPI Metric Row (Matching Image Top Row) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Bounce Rate</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">32.53%</div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-rose-500 mt-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>-0.5%</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Page Views</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">7,682</div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#34B1AA] mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+0.1%</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">New Sessions</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">68.8</div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-rose-500 mt-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>-2.1%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Avg. Time on Site</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">2m:35s</div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#34B1AA] mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+0.8%</span>
          </div>
        </div>

        {/* KPI 5: Curated Topics */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Topic Pool</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">{liveStats.topicsCount} Topics</div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#3B8FF3] mt-1">
            <Sparkles className="w-3 h-3" />
            <span>AI Ready</span>
          </div>
        </div>

        {/* KPI 6: Rendered Reels */}
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B]">Rendered Reels</div>
          <div className="text-xl font-black text-[#1E1E2C] mt-1">{liveStats.reelsCount} Reels</div>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#34B1AA] mt-1">
            <Check className="w-3 h-3" />
            <span>1080x1920</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns Matching Attached Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TOP LEFT: Performance Line Chart Card (7 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-base font-bold text-[#1E1E2C]">Performance Line Chart</h2>
              <p className="text-xs text-[#64748B]">Quaterly Appraisal Process for SA Team</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F29F67]" />
                <span className="text-[#64748B]">This week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E1E2C]" />
                <span className="text-[#64748B]">Last week</span>
              </div>
            </div>
          </div>

          {/* SVG Smooth Dual Spline Curve with Warm Gradient */}
          <div className="py-4 relative h-64 w-full">
            <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="peachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F29F67" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#F29F67" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="darkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E1E2C" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1E1E2C" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              <line x1="40" y1="30" x2="580" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="90" x2="580" y2="90" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="150" x2="580" y2="150" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="210" x2="580" y2="210" stroke="#E2E8F0" strokeWidth="1" />

              {/* Y-axis Labels */}
              <text x="15" y="34" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">300</text>
              <text x="15" y="94" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">200</text>
              <text x="15" y="154" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">100</text>
              <text x="25" y="214" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">0</text>

              {/* Area 1: Last Week (Dark line underneath) */}
              <path
                d="M 50 170 Q 120 180 170 120 T 300 135 T 430 160 T 570 140 L 570 210 L 50 210 Z"
                fill="url(#darkGrad)"
              />
              <path
                d="M 50 170 Q 120 180 170 120 T 300 135 T 430 160 T 570 140"
                fill="none"
                stroke="#1E1E2C"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Area 2: This Week (Warm Peach spline on top) */}
              <path
                d="M 50 165 Q 120 120 170 50 T 260 140 T 380 40 T 480 70 T 570 125 L 570 210 L 50 210 Z"
                fill="url(#peachGrad)"
              />
              <path
                d="M 50 165 Q 120 120 170 50 T 260 140 T 380 40 T 480 70 T 570 125"
                fill="none"
                stroke="#F29F67"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="50" cy="165" r="3.5" fill="#F29F67" />
              <circle cx="170" cy="50" r="4.5" fill="#F29F67" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="260" cy="140" r="3.5" fill="#1E1E2C" />
              <circle cx="380" cy="40" r="4.5" fill="#F29F67" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="480" cy="70" r="3.5" fill="#F29F67" />
            </svg>
          </div>

          {/* X-axis Day Labels matching image */}
          <div className="flex items-center justify-between px-6 pt-2 text-[11px] font-bold text-[#94A3B8] uppercase">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>
        </div>

        {/* TOP RIGHT: Dark Status Summary Card + Visitor Gauges (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          {/* Dark Navy Card matching image */}
          <div className="p-6 rounded-3xl bg-[#1E1E2C] text-white shadow-lg shadow-[#1E1E2C]/20 flex flex-col justify-between h-44 relative overflow-hidden">
            <div>
              <div className="text-xs font-semibold text-[#94A3B8]">Status Summary</div>
              <div className="text-[11px] text-[#A2A2B8] mt-2 font-medium">Closed Value</div>
              <div className="text-3xl font-black text-[#34B1AA] tracking-tight">357</div>
            </div>

            {/* Glowing teal wave line matching image */}
            <div className="w-full h-14">
              <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
                <path
                  d="M 0 35 C 40 45, 60 15, 100 25 C 140 35, 160 50, 200 20"
                  fill="none"
                  stroke="#34B1AA"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Bottom circular gauge cards matching image */}
          <div className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm grid grid-cols-2 gap-4">
            {/* Gauge 1 */}
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
                    strokeDasharray="27, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#64748B]">Total visitors</div>
                <div className="text-sm font-bold text-[#1E1E2C]">26.80%</div>
              </div>
            </div>

            {/* Gauge 2 */}
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
                    strokeDasharray="65, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#64748B]">Visits Per Day</div>
                <div className="text-sm font-bold text-[#1E1E2C]">9,065</div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LEFT: Market Overview Stacked Bar Chart (7 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1E1E2C]">Market Overview</h2>
              <p className="text-xs text-[#64748B]">Lorem ipsum dolor sit amet consectetur adipisicing elit</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-semibold text-[#1E1E2C] flex items-center gap-1.5 cursor-pointer">
                <span>This month</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </div>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl font-black text-[#1E1E2C]">
              $36,2531.00 <span className="text-xs font-bold text-[#64748B]">USD</span>{' '}
              <span className="text-xs font-bold text-[#34B1AA]">(+1.37%)</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E1E2C]" />
                <span className="text-[#64748B]">This week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F29F67]" />
                <span className="text-[#64748B]">Last week</span>
              </div>
            </div>
          </div>

          {/* Stacked Vertical Bar Chart across 12 months (JAN - DEC) matching image */}
          <div className="pt-4 h-56 w-full flex items-end justify-between gap-2 px-2 border-b border-[#E2E8F0] pb-2">
            {[
              { month: 'JAN', val1: 45, val2: 25 },
              { month: 'FEB', val1: 85, val2: 12 },
              { month: 'MAR', val1: 65, val2: 18 },
              { month: 'APR', val1: 60, val2: 24 },
              { month: 'MAY', val1: 80, val2: 28 },
              { month: 'JUN', val1: 62, val2: 20 },
              { month: 'JUL', val1: 75, val2: 15 },
              { month: 'AUG', val1: 40, val2: 30 },
              { month: 'SEP', val1: 72, val2: 22 },
              { month: 'OCT', val1: 70, val2: 12 },
              { month: 'NOV', val1: 50, val2: 18 },
              { month: 'DEC', val1: 90, val2: 10 },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full max-w-[18px] flex flex-col justify-end h-full">
                  {/* Top navy bar */}
                  <div
                    className="w-full bg-[#1E1E2C] rounded-t-sm transition-all group-hover:opacity-90"
                    style={{ height: `${bar.val2}%` }}
                  />
                  {/* Bottom peach bar */}
                  <div
                    className="w-full bg-[#F29F67] rounded-b-sm transition-all group-hover:opacity-90"
                    style={{ height: `${bar.val1}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#94A3B8]">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM RIGHT: To-Do / Reminders Card (5 cols) matching image */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#1E1E2C]">To-Do / Reminders</h2>
            <Link
              href="/topics"
              className="w-6 h-6 rounded-full bg-[#1E1E2C] hover:bg-[#F29F67] text-white flex items-center justify-center transition"
              title="Add new reel from topic"
            >
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* List of activity items matching image with status pills */}
          <div className="space-y-4 flex-1">
            {/* Item 1 */}
            <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
              <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#1E1E2C] truncate">
                  Linux: What is the /etc Directory?
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-[#94A3B8]">16s HD MP4</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0B50F]/15 text-[#E0B50F]">
                    Due tomorrow
                  </span>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
              <span className="w-4 h-4 rounded-full bg-[#34B1AA] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#1E1E2C] truncate">
                  Docker: What is a Container Really?
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-[#94A3B8]">16s Rendered</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34B1AA]/15 text-[#34B1AA]">
                    Done
                  </span>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
              <span className="w-4 h-4 rounded-full bg-[#34B1AA] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#1E1E2C] truncate">
                  DevOps: What is CI/CD?
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-[#94A3B8]">17s Rendered</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34B1AA]/15 text-[#34B1AA]">
                    Done
                  </span>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
              <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#1E1E2C] truncate">
                  Linux: chmod vs chown
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-[#94A3B8]">Script Ready</span>
                  <Link
                    href="/reels"
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3B8FF3]/15 text-[#3B8FF3] hover:underline"
                  >
                    Render Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/reels"
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-center text-xs font-bold text-[#1E1E2C] transition block"
          >
            Open Full Reels Studio &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
