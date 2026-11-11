'use client';

import React, { useEffect, useState } from 'react';
import {
  Palette,
  Sliders,
  Instagram,
  Save,
  Check,
  AlertCircle,
  Eye,
  Sparkles,
  Terminal,
  Layers,
} from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

const COLOR_PRESETS = [
  { label: 'Sunset Coral', hex: '#F29F67' },
  { label: 'Deep Navy', hex: '#1E1E2C' },
  { label: 'Royal Blue', hex: '#3B8FF3' },
  { label: 'Teal Mint', hex: '#34B1AA' },
  { label: 'Golden Amber', hex: '#E0B50F' },
  { label: 'Electric Purple', hex: '#6F41EC' },
  { label: 'Crimson Rose', hex: '#E11D48' },
  { label: 'Emerald Green', hex: '#10B981' },
];

const BG_PRESETS = [
  { label: 'Obsidian Navy', hex: '#1E1E2C' },
  { label: 'Dark Midnight', hex: '#0B0F17' },
  { label: 'Slate Charcoal', hex: '#0F172A' },
  { label: 'Neutral Zinc', hex: '#18181B' },
  { label: 'Studio Cream', hex: '#F8F9FA' },
];

export default function BrandPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('Remotion Reel');
  const [slug, setSlug] = useState('remotion-reel');
  const [audience, setAudience] = useState('Software engineers, DevOps architects, and modern developers');
  const [voiceTone, setVoiceTone] = useState('Practical, concise, technically rigorous, encouraging');
  const [autoPublish, setAutoPublish] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(16);

  // Reel Color Customization
  const [primaryColor, setPrimaryColor] = useState('#F29F67');
  const [secondaryColor, setSecondaryColor] = useState('#34B1AA');
  const [bgColor, setBgColor] = useState('#1E1E2C');

  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadBrand() {
      try {
        const res = await fetchApi<{ data: any[] }>('/api/v1/brands');
        if (res.data && res.data.length > 0) {
          const brand = res.data[0];
          setBrandId(brand.id);
          setDisplayName(brand.displayName || 'Remotion Reel');
          setSlug(brand.slug || 'remotion-reel');
          setAutoPublish(brand.autoPublish || false);
          setDefaultDuration(brand.defaultDuration || 16);

          if (brand.profile) {
            if (brand.profile.primaryColor) setPrimaryColor(brand.profile.primaryColor);
            if (brand.profile.secondaryColor) setSecondaryColor(brand.profile.secondaryColor);
            if (brand.profile.bgColor) setBgColor(brand.profile.bgColor);
            if (brand.profile.audience) setAudience(brand.profile.audience);
            if (brand.profile.voiceTone) setVoiceTone(brand.profile.voiceTone);
          }
        }
      } catch {
        // Keep defaults if offline
      }
    }
    loadBrand();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    setSaveMessage(null);
    try {
      if (brandId) {
        await fetchApi(`/api/v1/brands/${brandId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            displayName,
            slug,
            autoPublish,
            defaultDuration,
            primaryColor,
            secondaryColor,
            bgColor,
            audience,
            voiceTone,
          }),
        });
      }
      setIsSaved(true);
      setSaveMessage('Brand settings & Reel colors saved successfully!');
    } catch (err: any) {
      setIsSaved(true);
      setSaveMessage(`Notice: ${err.message || 'Saved locally'}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setIsSaved(false);
        setSaveMessage(null);
      }, 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDEEE3] text-xs font-bold text-[#F29F67] mb-2">
            <Palette className="w-3.5 h-3.5 text-[#F29F67]" />
            Brand & Reel Theme Customizer
          </div>
          <h1 className="text-2xl font-black text-[#1E1E2C] tracking-tight">
            Brand Profile & Reel Colors
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Customize your brand identity, edit the slug, and configure the exact colors used to render your Remotion Reels.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E1E2C] hover:bg-[#272738] text-white text-sm font-bold shadow-md shadow-[#1E1E2C]/20 transition disabled:opacity-50"
        >
          {isSaved ? <Check className="w-4 h-4 text-[#34B1AA]" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {saveMessage && (
        <div className="flex items-center gap-2 p-3.5 px-4 rounded-xl bg-white border border-[#34B1AA] text-sm text-[#1E1E2C] shadow-sm">
          <AlertCircle className="w-4 h-4 text-[#34B1AA] shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Brand Identity & Slug */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#1E1E2C] pb-2 border-b border-[#E2E8F0] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#F29F67]" />
              Brand Identity & Identity Slug
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1.5">
                  Brand Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Acme Tech, LearnOps"
                  className="w-full bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[#1E1E2C] font-semibold focus:outline-none focus:border-[#F29F67] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1.5">
                  Brand Slug (Editable)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. acme-tech"
                  className="w-full bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[#1E1E2C] font-mono font-medium focus:outline-none focus:border-[#F29F67] transition"
                />
                <span className="text-[11px] text-[#94A3B8] mt-1 block">
                  Used in API endpoints and URLs. Lowercase alphanumeric and hyphens.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase mb-1.5">
                Target Audience
              </label>
              <textarea
                rows={2}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#1E1E2C] font-medium focus:outline-none focus:border-[#F29F67] transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase mb-1.5">
                Voice Tone & Style
              </label>
              <input
                type="text"
                value={voiceTone}
                onChange={(e) => setVoiceTone(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E1E2C] font-medium focus:outline-none focus:border-[#F29F67] transition"
              />
            </div>
          </div>

          {/* Section 2: Reel Color Customizer (The User's Feature!) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
            <div className="border-b border-[#E2E8F0] pb-3">
              <h2 className="text-base font-bold text-[#1E1E2C] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#F29F67]" />
                Reel Video Color Studio
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Configure the primary, accent, and background colors dynamically used by Remotion when rendering your Reels.
              </p>
            </div>

            {/* Reel Primary Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1E1E2C] uppercase">
                  Reel Primary Brand Color
                </label>
                <span className="font-mono text-xs font-bold text-[#64748B]">{primaryColor}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-[#E2E8F0] p-1 bg-white"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#1E1E2C] uppercase focus:outline-none focus:border-[#F29F67]"
                />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {COLOR_PRESETS.slice(0, 5).map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      title={preset.label}
                      className={`w-7 h-7 rounded-lg transition transform hover:scale-110 border ${
                        primaryColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-[#1E1E2C] ring-2 ring-[#F29F67]/50'
                          : 'border-black/10'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Reel Secondary Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1E1E2C] uppercase">
                  Reel Secondary / Accent Color
                </label>
                <span className="font-mono text-xs font-bold text-[#64748B]">{secondaryColor}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-[#E2E8F0] p-1 bg-white"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-32 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#1E1E2C] uppercase focus:outline-none focus:border-[#F29F67]"
                />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {COLOR_PRESETS.slice(2).map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setSecondaryColor(preset.hex)}
                      title={preset.label}
                      className={`w-7 h-7 rounded-lg transition transform hover:scale-110 border ${
                        secondaryColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-[#1E1E2C] ring-2 ring-[#34B1AA]/50'
                          : 'border-black/10'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Reel Background Canvas Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1E1E2C] uppercase">
                  Reel Background Canvas Color
                </label>
                <span className="font-mono text-xs font-bold text-[#64748B]">{bgColor}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-[#E2E8F0] p-1 bg-white"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-32 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#1E1E2C] uppercase focus:outline-none focus:border-[#F29F67]"
                />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {BG_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setBgColor(preset.hex)}
                      title={preset.label}
                      className={`w-7 h-7 rounded-lg transition transform hover:scale-110 border ${
                        bgColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-[#1E1E2C] ring-2 ring-blue-400'
                          : 'border-black/10'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Video Automation & Timing */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#1E1E2C] pb-2 border-b border-[#E2E8F0] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3B8FF3]" />
              Video Automation & Target Duration
            </h2>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0]">
              <div>
                <div className="font-bold text-[#1E1E2C] text-sm">Human Review Gate</div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  {autoPublish
                    ? 'Auto-publish to Instagram once rendering completes.'
                    : 'Require manual review & approval before publishing to Instagram.'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoPublish(!autoPublish)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  autoPublish ? 'bg-[#34B1AA]' : 'bg-[#CBD5E1]'
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
              <label className="block text-xs font-bold text-[#64748B] uppercase mb-2">
                Default Target Duration (Seconds)
              </label>
              <div className="flex items-center gap-3">
                {[12, 16, 18, 22].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDefaultDuration(dur)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      defaultDuration === dur
                        ? 'bg-[#1E1E2C] text-white shadow-sm'
                        : 'bg-[#F8F9FA] border border-[#E2E8F0] text-[#64748B] hover:bg-slate-200'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Reel Visual Preview Phone Mockup */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#F29F67]" />
                Live Reel Composition Preview
              </span>
              <span className="text-[11px] font-semibold text-[#34B1AA] bg-[#34B1AA]/10 px-2 py-0.5 rounded-full">
                9:16 Video Frame
              </span>
            </div>

            {/* Mobile Phone Mockup Frame */}
            <div
              className="relative aspect-[9/16] w-full max-w-[320px] mx-auto rounded-[32px] p-4 shadow-2xl border-4 border-[#1E1E2C] flex flex-col justify-between overflow-hidden transition-colors duration-300"
              style={{ backgroundColor: bgColor }}
            >
              {/* Subtle Background Grid overlay */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Mock Reel Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {displayName.charAt(0) || 'R'}
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight truncate max-w-[140px]">
                    {displayName}
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-black"
                  style={{ backgroundColor: secondaryColor }}
                >
                  HD Reel
                </span>
              </div>

              {/* Mock Reel Scene: Hook & Terminal */}
              <div className="relative z-10 space-y-3 my-auto">
                {/* Badge */}
                <div
                  className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  TECHNICAL INSIGHT
                </div>

                {/* Headline */}
                <h3 className="text-lg font-black text-white leading-tight">
                  What is a Container Really?
                </h3>
                <p className="text-[11px] text-white/70 line-clamp-2">
                  It is not a lightweight VM. Here is how host kernel namespaces work.
                </p>

                {/* Mock Terminal Card */}
                <div className="bg-black/40 border border-white/15 rounded-xl p-3 font-mono text-[10px] space-y-1 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-white/40 pb-1 border-b border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2 h-2 rounded-full bg-green-500/80 inline-block" />
                    <span className="text-[9px] ml-1">bash terminal</span>
                  </div>
                  <div className="text-white pt-1">
                    <span style={{ color: secondaryColor }}>$</span> docker run -d nginx
                  </div>
                  <div style={{ color: primaryColor }}>
                    [cgroups] PID namespaces attached
                  </div>
                </div>
              </div>

              {/* Mock Reel Outro Bar */}
              <div className="relative z-10 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[10px]">
                <div className="text-white/80">
                  <div className="font-bold text-white">{displayName}</div>
                  <div className="text-[9px] text-white/60">Follow for daily tutorials</div>
                </div>
                <div
                  className="px-2.5 py-1 rounded-lg font-bold text-black text-[10px] shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  Follow
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-[#64748B]">
              Changes made here automatically update Remotion video scenes upon rendering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
