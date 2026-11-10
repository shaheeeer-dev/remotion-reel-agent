'use client';

import React, { useState } from 'react';
import { Sliders, Shield, Instagram, Save } from 'lucide-react';

export default function BrandPage() {
  const [autoPublish, setAutoPublish] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(16);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-[#FF6B00]" />
          Brand Profile & Policies
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          LearnOps brand configuration, visual themes, publishing gates, and platform integrations.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-[#151D2A] border border-[#233044] space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-[#233044] pb-3">
          Brand Identity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Brand Name</label>
            <input
              type="text"
              readOnly
              value="LearnOps"
              className="w-full bg-[#0F1623] border border-[#233044] rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Slug</label>
            <input
              type="text"
              readOnly
              value="learnops"
              className="w-full bg-[#0F1623] border border-[#233044] rounded-xl px-4 py-2.5 text-[#64748B] font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Primary Color</label>
            <div className="flex items-center gap-3 bg-[#0F1623] border border-[#233044] rounded-xl p-2 px-4">
              <span className="w-6 h-6 rounded-lg bg-[#FF6B00] border border-white/20" />
              <span className="font-mono text-white">#FF6B00 (LearnOps Vibrant Orange)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Background Color</label>
            <div className="flex items-center gap-3 bg-[#0F1623] border border-[#233044] rounded-xl p-2 px-4">
              <span className="w-6 h-6 rounded-lg bg-[#0B0F17] border border-white/20" />
              <span className="font-mono text-white">#0B0F17 (Dark Slate)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing & Automation Rules */}
      <div className="p-8 rounded-2xl bg-[#151D2A] border border-[#233044] space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-[#233044] pb-3">
          Publishing Gate & Automation
        </h2>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F1623] border border-[#233044]">
          <div>
            <div className="font-bold text-white text-sm">Human Approval Gate</div>
            <div className="text-xs text-[#94A3B8] mt-0.5">
              {autoPublish
                ? 'Automatic publishing is enabled once video is rendered.'
                : 'Require manual review & approval before publishing to Instagram.'}
            </div>
          </div>
          <button
            onClick={() => setAutoPublish(!autoPublish)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              autoPublish ? 'bg-[#FF6B00]' : 'bg-[#233044]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                autoPublish ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
            Default Reel Target Duration
          </label>
          <div className="flex items-center gap-3">
            {[12, 16, 18, 22].map((dur) => (
              <button
                key={dur}
                onClick={() => setDefaultDuration(dur)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  defaultDuration === dur
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/20'
                    : 'bg-[#0F1623] border border-[#233044] text-[#94A3B8] hover:bg-[#1E293B]'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instagram Connection */}
      <div className="p-8 rounded-2xl bg-[#151D2A] border border-[#233044] space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-[#233044] pb-3 flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          Instagram Professional Account
        </h2>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F1623] border border-[#233044]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
              IG
            </div>
            <div>
              <div className="font-bold text-white text-sm">@learnops.io</div>
              <div className="text-xs text-emerald-400 font-semibold">Connected (Business Account)</div>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            Graph API v21.0
          </span>
        </div>
      </div>
    </div>
  );
}
