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
  Folder,
  Network,
  HardDrive,
  ShieldCheck,
  Volume2,
  Play,
  Pause,
  Mic,
} from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

const COLOR_PRESETS = [
  { label: 'Brand Purple (Official)', hex: '#783CEB' },
  { label: 'Accent Lavender (Official)', hex: '#B28BFF' },
  { label: 'Dark Amethyst', hex: '#110F17' },
  { label: 'Surface Amethyst', hex: '#1C1824' },
  { label: 'Sunset Coral', hex: '#F29F67' },
  { label: 'Royal Blue', hex: '#3B8FF3' },
  { label: 'Teal Mint', hex: '#34B1AA' },
  { label: 'Golden Amber', hex: '#E0B50F' },
];

const BG_PRESETS = [
  { label: 'Dark Amethyst (Official)', hex: '#110F17' },
  { label: 'Surface Amethyst', hex: '#1C1824' },
  { label: 'Obsidian Navy', hex: '#1E1E2C' },
  { label: 'Dark Midnight', hex: '#0B0F17' },
  { label: 'Slate Charcoal', hex: '#0F172A' },
];

const KOKORO_VOICES = [
  {
    id: 'af_heart',
    name: 'Heart',
    gender: 'Female',
    accent: 'American',
    grade: 'A',
    description: 'Warm, natural, and expressive. Top overall quality.',
  },
  {
    id: 'af_bella',
    name: 'Bella',
    gender: 'Female',
    accent: 'American',
    grade: 'A-',
    description: 'Dynamic, clear, and confident narration.',
  },
  {
    id: 'af_nicole',
    name: 'Nicole',
    gender: 'Female',
    accent: 'American',
    grade: 'B+',
    description: 'Calm, measured, and conversational tech educator.',
  },
  {
    id: 'af_sarah',
    name: 'Sarah',
    gender: 'Female',
    accent: 'American',
    grade: 'B',
    description: 'Professional, articulate documentary-style tone.',
  },
  {
    id: 'am_michael',
    name: 'Michael',
    gender: 'Male',
    accent: 'American',
    grade: 'B+',
    description: 'Engaging, authentic developer and tech educator.',
  },
  {
    id: 'am_adam',
    name: 'Adam',
    gender: 'Male',
    accent: 'American',
    grade: 'B',
    description: 'Direct, clear, and authoritative narrator.',
  },
  {
    id: 'am_fenrir',
    name: 'Fenrir',
    gender: 'Male',
    accent: 'American',
    grade: 'B',
    description: 'Deep, crisp, and resonant tech explainer.',
  },
  {
    id: 'bf_emma',
    name: 'Emma',
    gender: 'Female',
    accent: 'British',
    grade: 'A-',
    description: 'Polished, articulate British academic narrator.',
  },
  {
    id: 'bm_george',
    name: 'George',
    gender: 'Male',
    accent: 'British',
    grade: 'B+',
    description: 'Distinguished, authoritative British tech guide.',
  },
];

export default function BrandPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('LearnOps');
  const [slug, setSlug] = useState('learnops');
  const [audience, setAudience] = useState('Beginner to intermediate Linux & DevOps engineers');
  const [voiceTone, setVoiceTone] = useState('Practical, concise, technically rigorous, encouraging');
  const [autoPublish, setAutoPublish] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(16);

  // Reel Color Customization (Defaults to Official LearnOps Theme)
  const [primaryColor, setPrimaryColor] = useState('#783CEB');
  const [secondaryColor, setSecondaryColor] = useState('#B28BFF');
  const [bgColor, setBgColor] = useState('#110F17');
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [previewScene, setPreviewScene] = useState<'hook' | 'content' | 'terminal' | 'outro'>('hook');

  const playVoicePreview = (vId: string) => {
    if (playingVoiceId === vId && audioPlayer) {
      audioPlayer.pause();
      setPlayingVoiceId(null);
      return;
    }

    if (audioPlayer) {
      audioPlayer.pause();
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const audio = new Audio(`${apiBase}/api/v1/voices/${vId}/preview`);
    audio.onended = () => {
      setPlayingVoiceId(null);
    };
    audio.onerror = (e) => {
      console.error('[VoicePreview] Audio playback error:', e);
      setPlayingVoiceId(null);
    };
    audio.play().catch((err) => {
      console.error('[VoicePreview] Play failed:', err);
      setPlayingVoiceId(null);
    });
    setAudioPlayer(audio);
    setPlayingVoiceId(vId);
  };

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
            if (brand.profile.voiceId) setVoiceId(brand.profile.voiceId);
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
            voiceId,
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

          {/* Section 4: Narration & Voice Audition (Kokoro Offline TTS) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h2 className="text-base font-bold text-[#1E1E2C] flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#783CEB]" />
                Local Voice Narration (Kokoro TTS)
              </h2>
              <span className="text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                100% On-Device CPU
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Listen to the neural voice previews below. Click <strong className="text-[#1E1E2C]">Audition (▶)</strong> to test pronunciation on DevOps terms, then select your preferred voice.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {KOKORO_VOICES.map((v) => {
                const isSelected = voiceId === v.id;
                const isPlaying = playingVoiceId === v.id;

                return (
                  <div
                    key={v.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-[#783CEB] bg-[#783CEB]/5 ring-1 ring-[#783CEB]'
                        : 'border-[#E2E8F0] bg-[#F8F9FA] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1E1E2C]">{v.name}</span>
                          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] text-[#64748B]">
                            {v.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-bold">
                          <span className="bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] text-[#1E1E2C]">
                            {v.accent}
                          </span>
                          <span className="bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] text-[#1E1E2C]">
                            {v.gender}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                            {v.grade}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-snug">
                        {v.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                      <button
                        type="button"
                        onClick={() => playVoicePreview(v.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                          isPlaying
                            ? 'bg-[#783CEB] text-white animate-pulse'
                            : 'bg-white border border-[#E2E8F0] text-[#1E1E2C] hover:bg-slate-50'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Playing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-[#783CEB]" />
                            <span>Audition</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setVoiceId(v.id)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? 'bg-[#783CEB] text-white shadow-sm'
                            : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E1E2C]'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Select Voice'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Reel Visual Preview Phone Mockup */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#783CEB]" />
                Live Reel Preview
              </span>
              <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewScene('hook')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    previewScene === 'hook' ? 'bg-[#783CEB] text-white' : 'text-[#64748B]'
                  }`}
                >
                  Hook
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScene('content')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    previewScene === 'content' ? 'bg-[#783CEB] text-white' : 'text-[#64748B]'
                  }`}
                >
                  Content
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScene('terminal')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    previewScene === 'terminal' ? 'bg-[#783CEB] text-white' : 'text-[#64748B]'
                  }`}
                >
                  Terminal
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScene('outro')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    previewScene === 'outro' ? 'bg-[#783CEB] text-white' : 'text-[#64748B]'
                  }`}
                >
                  Outro
                </button>
              </div>
            </div>

            {/* Mobile Phone Mockup Frame (Pure matte background, no lines) */}
            <div
              className="relative aspect-[9/16] w-full max-w-[320px] mx-auto rounded-[32px] p-4 shadow-2xl border-4 border-[#1E1E2C] flex flex-col justify-between overflow-hidden transition-colors duration-300"
              style={{
                backgroundColor: previewScene === 'hook' ? primaryColor : bgColor,
              }}
            >
              {/* Top Reel Progress Bar */}
              <div className="relative z-20 w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2 shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width:
                      previewScene === 'hook'
                        ? '25%'
                        : previewScene === 'content'
                        ? '50%'
                        : previewScene === 'terminal'
                        ? '75%'
                        : '100%',
                    background:
                      previewScene === 'hook'
                        ? '#FFFFFF'
                        : `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />
              </div>

              {/* Scene 1: Hook Preview (Purple canvas, 3-tier open architecture, black box highlight) */}
              {previewScene === 'hook' && (
                <div className="relative z-10 flex-1 flex flex-col justify-between pb-6 pt-1 text-left">
                  {/* Tier 1 (Top): Monospace Kicker & Headline with Black Box */}
                  <div>
                    <div className="text-[8.5px] font-mono font-extrabold text-white/85 uppercase tracking-wider mb-1.5">
                      LINUX FILE SYSTEM • 02
                    </div>
                    <h3 className="text-[17px] font-black text-white leading-[1.18] tracking-tight">
                      Where Linux keeps its{' '}
                      <span className="inline-block bg-[#110F17] text-white px-1.5 py-0.5 rounded text-[14px] font-black shadow-md border border-white/20">
                        rules.
                      </span>
                    </h3>
                  </div>

                  {/* Tier 2 (Middle): Linux Drawer Metaphor (Black BG, White Accents, Purple Text) */}
                  <div
                    className="w-full rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 border border-white/25"
                    style={{ backgroundColor: '#110F17' }}
                  >
                    <div className="text-[8px] font-mono font-extrabold text-white/70 uppercase tracking-widest px-1">
                      LINUX MACHINE
                    </div>
                    <div className="bg-[#1C1824] rounded-lg px-2.5 py-1.5 text-[8px] font-mono font-bold text-white/40 border border-white/5 flex items-center justify-between">
                      <span>SYSTEM DRAWER 01</span>
                      <span className="text-[7px] text-white/30 uppercase">SYSTEM</span>
                    </div>

                    {/* Active Sliding Drawer */}
                    <div className="bg-[#1C1824] rounded-lg px-2.5 py-1.5 text-[9px] font-mono font-black border border-white shadow-xl flex items-center justify-between translate-x-1.5">
                      <div className="flex items-center gap-1.5">
                        <Folder size={12} color="#FFFFFF" strokeWidth={2.5} />
                        <span style={{ color: secondaryColor }}>/etc</span>
                      </div>
                      <span
                        className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: 'rgba(120, 60, 235, 0.45)' }}
                      >
                        CONFIG
                      </span>
                    </div>

                    <div className="bg-[#1C1824] rounded-lg px-2.5 py-1.5 text-[8px] font-mono font-bold text-white/40 border border-white/5 flex items-center justify-between">
                      <span>SYSTEM DRAWER 03</span>
                      <span className="text-[7px] text-white/30 uppercase">SYSTEM</span>
                    </div>
                  </div>

                  {/* Tier 3 (Bottom): Subtitles (3 words on screen, black block behind active spoken word) */}
                  <div className="flex items-center justify-center gap-1 text-center">
                    <span className="text-white/85 text-[11px] font-black px-1 py-0.5 border border-transparent">
                      Where
                    </span>
                    <span className="bg-[#110F17] text-white px-1.5 py-0.5 rounded-md text-[11px] font-black border border-white/20 shadow-lg">
                      Linux
                    </span>
                    <span className="text-white/85 text-[11px] font-black px-1 py-0.5 border border-transparent">
                      keeps
                    </span>
                  </div>
                </div>
              )}

              {/* Scene 2: Content Preview (Black canvas, 3-Card Stack branching from root node, crisp white borders) */}
              {previewScene === 'content' && (
                <div className="relative z-10 flex-1 flex flex-col justify-between pb-6 pt-1 text-left">
                  {/* Tier 1 (Top): Kicker with Accent Mark & Headline */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8.5px] font-mono font-extrabold text-white/60 uppercase tracking-wider">
                        INSIDE /ETC • 01
                      </span>
                      <div
                        className="w-6 h-1 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <h3 className="text-[17px] font-black text-white leading-[1.18] tracking-tight">
                      Plain files.{' '}
                      <span style={{ color: secondaryColor }}>Real effects.</span>
                    </h3>
                  </div>

                  {/* Tier 2 (Middle): Root node & 3 vertical cards */}
                  <div className="flex flex-col items-center w-full my-auto">
                    {/* Root Node */}
                    <div
                      className="px-3 py-1 rounded-lg border border-white font-mono text-[9px] font-black text-white inline-flex items-center gap-1.5 shadow-md"
                      style={{ backgroundColor: '#1C1824' }}
                    >
                      <Folder size={11} color="#FFFFFF" strokeWidth={2.5} />
                      <span>/etc</span>
                    </div>
                    <div className="w-0.5 h-2 bg-white/60 my-0.5" />

                    {/* Staggered cards */}
                    <div className="w-full space-y-1.5">
                      {/* Card 1 */}
                      <div
                        className="rounded-xl px-2.5 py-1.5 border border-white shadow-md flex items-center justify-between"
                        style={{ backgroundColor: '#1C1824' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white/10 border border-white flex items-center justify-center shrink-0">
                            <Network size={12} color="#FFFFFF" strokeWidth={2.2} />
                          </div>
                          <div>
                            <div className="text-[8px] font-mono font-black" style={{ color: secondaryColor }}>
                              /etc/hosts
                            </div>
                            <div className="text-[9px] font-black text-white leading-none">Name → address</div>
                          </div>
                        </div>
                        <span className="text-[7px] font-mono font-bold text-white/50 uppercase">HOSTS</span>
                      </div>

                      {/* Card 2 */}
                      <div
                        className="rounded-xl px-2.5 py-1.5 border border-white/25 shadow-md flex items-center justify-between"
                        style={{ backgroundColor: '#1C1824' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                            <HardDrive size={12} color="#FFFFFF" strokeWidth={2.2} />
                          </div>
                          <div>
                            <div className="text-[8px] font-mono font-black" style={{ color: secondaryColor }}>
                              /etc/fstab
                            </div>
                            <div className="text-[9px] font-black text-white leading-none">Filesystems at boot</div>
                          </div>
                        </div>
                        <span className="text-[7px] font-mono font-bold text-white/50 uppercase">FSTAB</span>
                      </div>

                      {/* Card 3 */}
                      <div
                        className="rounded-xl px-2.5 py-1.5 border border-white/25 shadow-md flex items-center justify-between"
                        style={{ backgroundColor: '#1C1824' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                            <ShieldCheck size={12} color="#FFFFFF" strokeWidth={2.2} />
                          </div>
                          <div>
                            <div className="text-[8px] font-mono font-black" style={{ color: secondaryColor }}>
                              /etc/ssh/sshd_config
                            </div>
                            <div className="text-[9px] font-black text-white leading-none">SSH server rules</div>
                          </div>
                        </div>
                        <span className="text-[7px] font-mono font-bold text-white/50 uppercase">SSHD_CONFIG</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier 3 (Bottom): Subtitles (3 words on screen, brand color block behind active spoken word) */}
                  <div className="flex items-center justify-center gap-1 text-center">
                    <span className="text-white/60 text-[11px] font-black px-1 py-0.5 border border-transparent">
                      Plain
                    </span>
                    <span
                      className="text-white px-1.5 py-0.5 rounded-md text-[11px] font-black border border-white/25 shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      text
                    </span>
                    <span className="text-white/60 text-[11px] font-black px-1 py-0.5 border border-transparent">
                      files
                    </span>
                  </div>
                </div>
              )}

              {/* Scene 3: Terminal Preview (Crisp white border, no purple borders, open bottom subtext) */}
              {previewScene === 'terminal' && (
                <div className="relative z-10 flex-1 flex flex-col justify-between pb-6 pt-1 text-left">
                  {/* Tier 1 (Top): Kicker with Accent Mark & Headline */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8.5px] font-mono font-extrabold text-white/60 uppercase tracking-wider">
                        TERMINAL EXECUTION • 02
                      </span>
                      <div
                        className="w-6 h-1 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <h3 className="text-[17px] font-black text-white leading-[1.18] tracking-tight">
                      Inspect rules in{' '}
                      <span style={{ color: secondaryColor }}>real time.</span>
                    </h3>
                  </div>

                  {/* Tier 2 (Middle): Terminal Box with Crisp White Border */}
                  <div
                    className="rounded-xl overflow-hidden shadow-2xl my-auto"
                    style={{
                      backgroundColor: '#1C1824',
                      border: '1.5px solid #FFFFFF', // Crisp white border!
                      boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="bg-[#15131C] px-2.5 py-1.5 flex items-center justify-between border-b border-white/10">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      </div>
                      <span className="text-[8px] font-mono text-[#91899C]">learner@linux: ~</span>
                      <div className="w-3" />
                    </div>

                    <div className="p-2.5 font-mono text-[9px] space-y-1">
                      <div>
                        <span style={{ color: secondaryColor, fontWeight: 700 }}>learner@linux:~$ </span>
                        <span className="text-white font-bold">ls -la /etc/nginx</span>
                      </div>
                      <div className="text-white/80 pt-0.5 text-[8px] leading-tight">
                        drwxr-xr-x 8 root root 4096 conf.d
                      </div>
                      <div className="text-white/80 text-[8px] leading-tight">
                        -rw-r--r-- 1 root root 1440 nginx.conf
                      </div>
                      <div className="text-[8px] pt-0.5 font-bold" style={{ color: secondaryColor }}>
                        # Active production configuration
                      </div>
                    </div>
                  </div>

                  {/* Tier 3 (Bottom): Subtitles (3 words on screen, brand color block behind active spoken word) */}
                  <div className="flex items-center justify-center gap-1 text-center">
                    <span className="text-white/60 text-[11px] font-black px-1 py-0.5 border border-transparent">
                      Inspect
                    </span>
                    <span
                      className="text-white px-1.5 py-0.5 rounded-md text-[11px] font-black border border-white/25 shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      active
                    </span>
                    <span className="text-white/60 text-[11px] font-black px-1 py-0.5 border border-transparent">
                      rules
                    </span>
                  </div>
                </div>
              )}

              {/* Scene 4: Outro Preview */}
              {previewScene === 'outro' && (
                <div
                  className="relative z-10 flex-1 flex items-center justify-center w-full"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="flex items-center justify-between w-[80%]">
                    <div>
                      <h1 className="text-base font-bold text-white leading-tight">
                        {displayName}
                      </h1>
                      <p className="text-[10px] text-[#91899C] mt-0.5">
                        Follow for daily tutorials.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-full font-bold text-white text-[11px] shadow-lg transition hover:brightness-110 shrink-0"
                      style={{
                        backgroundColor: primaryColor,
                        border: 'none',
                      }}
                    >
                      Follow
                    </button>
                  </div>
                </div>
              )}

              {/* Reel Brand Label */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-[#91899C] shrink-0">
                <span>1080x1920 • 9:16</span>
                <span className="font-mono">{previewScene.toUpperCase()} SCENE</span>
              </div>
            </div>

            <p className="text-center text-xs text-[#64748B]">
              Changes made here automatically apply to Remotion video scenes upon rendering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
