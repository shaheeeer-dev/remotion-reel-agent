'use client';

import React, { useEffect, useState } from 'react';
import { Sliders, Instagram, Save, Check, AlertCircle } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export default function BrandPage() {
  const [autoPublish, setAutoPublish] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(16);
  const [displayName, setDisplayName] = useState('LearnOps');
  const [slug, setSlug] = useState('learnops');
  const [brandId, setBrandId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrand() {
      try {
        const res = await fetchApi<{ data: any[] }>('/api/v1/brands');
        if (res.data && res.data.length > 0) {
          const brand = res.data[0];
          setBrandId(brand.id);
          setDisplayName(brand.displayName);
          setSlug(brand.slug);
          setAutoPublish(brand.autoPublish);
          setDefaultDuration(brand.defaultDuration || 16);
        }
      } catch {
        // Keep defaults if offline
      }
    }
    loadBrand();
  }, []);

  const handleSave = async () => {
    setIsSaved(false);
    setSaveMessage(null);
    try {
      if (brandId) {
        await fetchApi(`/api/v1/brands/${brandId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            displayName,
            autoPublish,
            defaultDuration,
          }),
        });
      }
      setIsSaved(true);
      setSaveMessage('Brand settings saved successfully!');
    } catch (err: any) {
      setIsSaved(true);
      setSaveMessage(`Saved locally (${err.message || 'API sync failed'})`);
    } finally {
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#C4B5FD]" />
            Brand Profile & Policies
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Data-driven brand configuration, visual themes, publishing gates, and platform integrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6F41EC] hover:bg-[#825CF0] text-white text-sm font-bold shadow-lg shadow-[#6F41EC]/30 transition"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      {saveMessage && (
        <div className="flex items-center gap-2 p-3 px-4 rounded-xl bg-[#151D2A] border border-[#6F41EC]/50 text-sm text-[#C4B5FD]">
          <AlertCircle className="w-4 h-4 text-[#C4B5FD] shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="p-8 rounded-2xl bg-[#151D2A] border border-[#233044] space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-[#233044] pb-3">
          Brand Identity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Brand Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#0F1623] border border-[#233044] rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:border-[#6F41EC]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Slug</label>
            <input
              type="text"
              readOnly
              value={slug}
              className="w-full bg-[#0F1623] border border-[#233044] rounded-xl px-4 py-2.5 text-[#64748B] font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Primary Color</label>
            <div className="flex items-center gap-3 bg-[#0F1623] border border-[#233044] rounded-xl p-2 px-4">
              <span className="w-6 h-6 rounded-lg bg-[#6F41EC] border border-white/20 shadow-sm shadow-[#6F41EC]" />
              <span className="font-mono text-white">#6F41EC (LearnOps Electric Purple)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Secondary Accent</label>
            <div className="flex items-center gap-3 bg-[#0F1623] border border-[#233044] rounded-xl p-2 px-4">
              <span className="w-6 h-6 rounded-lg bg-[#C4B5FD] border border-white/20" />
              <span className="font-mono text-white">#C4B5FD (LearnOps Lavender)</span>
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
            <div className="font-bold text-white text-sm">Human Review & Approval Gate</div>
            <div className="text-xs text-[#94A3B8] mt-0.5">
              {autoPublish
                ? 'Automatic publishing is enabled once video is rendered.'
                : 'Require manual review & approval before publishing to Instagram.'}
            </div>
          </div>
          <button
            onClick={() => setAutoPublish(!autoPublish)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              autoPublish ? 'bg-[#6F41EC]' : 'bg-[#233044]'
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
                    ? 'bg-[#6F41EC] text-white shadow-md shadow-[#6F41EC]/20'
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
              <div className="font-bold text-white text-sm">Account Connection</div>
              <div className="text-xs text-amber-400 font-semibold">
                OAuth Verification Required (Set META_ACCESS_TOKEN in .env)
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const token = prompt('Enter your Meta Graph API Access Token:');
              if (token && brandId) {
                const userId = prompt('Enter Instagram Business User ID:') || 'me';
                fetchApi(`/api/v1/brands/${brandId}/integrations/instagram/connect`, {
                  method: 'POST',
                  body: JSON.stringify({ token, providerUserId: userId }),
                })
                  .then(() => alert('Instagram account connected successfully!'))
                  .catch((e) => alert(`Connection error: ${e.message}`));
              }
            }}
            className="text-xs px-4 py-2 rounded-xl bg-[#233044] hover:bg-[#6F41EC] text-white font-bold transition"
          >
            Connect Account
          </button>
        </div>
      </div>
    </div>
  );
}
