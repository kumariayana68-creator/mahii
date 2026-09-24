import React from 'react';
import { VoiceSettings, SpiceLevel, VoiceMode } from '../types';
import { X, Flame, Sparkles, Crown, Mic, Radio, Volume2, ShieldCheck, Heart, ArrowLeft } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const SPICE_OPTIONS: Array<{
    id: SpiceLevel;
    title: string;
    emoji: string;
    icon: React.ReactNode;
    desc: string;
    borderColor: string;
  }> = [
    {
      id: 'girlfriend',
      title: 'Loving Girlfriend (Recommended)',
      emoji: '🥰',
      icon: <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />,
      desc: 'Sweet, deeply affectionate, caring partner. Calls you "babe", "sweetheart", checks on your day & food, with cute playful romantic banter.',
      borderColor: 'border-rose-500/50 bg-rose-500/15',
    },
    {
      id: 'chill',
      title: 'Chill & Sweet',
      emoji: '🍬',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      desc: 'Warm, affectionate, supportive girlfriend with gentle, playful teasing.',
      borderColor: 'border-emerald-500/40 bg-emerald-500/10',
    },
    {
      id: 'sassy',
      title: 'Sassy & Flirty',
      emoji: '💅',
      icon: <Flame className="w-4 h-4 text-pink-400" />,
      desc: 'Confident, quick-witted, magnetic. Loves playful banter, teasing roasts, and flirty charm.',
      borderColor: 'border-pink-500/40 bg-pink-500/10',
    },
    {
      id: 'queen',
      title: 'Unapologetic Queen',
      emoji: '👑',
      icon: <Crown className="w-4 h-4 text-amber-400" />,
      desc: 'High drama, razor-sharp wit, supreme confidence, seductive banter, and zero tolerance for boring.',
      borderColor: 'border-amber-500/40 bg-amber-500/10',
    },
  ];

  const VOICE_OPTIONS = [
    { id: 'Kore', name: 'Kore', vibe: 'Youthful, playful, energetic & sassy (Recommended)' },
    { id: 'Aoede', name: 'Aoede', vibe: 'Warm, sultry, melodic & confident' },
    { id: 'Zephyr', name: 'Zephyr', vibe: 'Silky, relaxed, effortless & cool' },
    { id: 'Puck', name: 'Puck', vibe: 'Bold, punchy & lively' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-base font-bold text-white">Mahii's Personality Deck</h2>
              <p className="text-xs text-neutral-400">Customize her affection, tone, and vocal style</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Personality Spice Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 mb-2.5 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Attitude & Spice Level
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {SPICE_OPTIONS.map((opt) => {
                const isSelected = settings.spiceLevel === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ spiceLevel: opt.id })}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `${opt.borderColor} ring-1 ring-pink-500/50`
                        : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-2xl pt-0.5">{opt.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                          {opt.title}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Engine Preset */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              Voice Model Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VOICE_OPTIONS.map((v) => {
                const isSelected = settings.voiceName === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onUpdateSettings({ voiceName: v.id })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500/50 bg-purple-500/15 ring-1 ring-purple-500/40'
                        : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{v.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">{v.vibe}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Character Wallpaper Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
              <span>🖼️</span>
              3D Character Wallpaper / Scene
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ wallpaperStyle: 'cozy_room' })}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  (settings.wallpaperStyle || 'cozy_room') === 'cozy_room'
                    ? 'border-amber-500/60 bg-amber-500/15 ring-1 ring-amber-500/40'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <span>🎀</span>
                  <span>Cozy Study Room</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Warm lamp, pink tulips, aesthetic fairy lights, notebook & heart laptop
                </p>
              </button>

              <button
                onClick={() => onUpdateSettings({ wallpaperStyle: 'cyber_neon' })}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  settings.wallpaperStyle === 'cyber_neon'
                    ? 'border-pink-500/60 bg-pink-500/15 ring-1 ring-pink-500/40'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <span>✨</span>
                  <span>Cyber Studio</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Chic cropped leather jacket, purple neon rings, holographic orbital studio
                </p>
              </button>
            </div>
          </div>

          {/* Interaction Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              Conversation Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ mode: 'live' })}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  settings.mode === 'live'
                    ? 'border-cyan-500/50 bg-cyan-500/15 ring-1 ring-cyan-500/40'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-sm font-bold text-white">Live Voice (Hands-free)</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Continuous low-latency voice-to-voice stream with instant interruption
                </p>
              </button>

              <button
                onClick={() => onUpdateSettings({ mode: 'tap_to_talk' })}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  settings.mode === 'tap_to_talk'
                    ? 'border-pink-500/50 bg-pink-500/15 ring-1 ring-pink-500/40'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-bold text-white">Tap to Talk</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Tap to record your turn, tap again to finish and receive Mahii's reply
                </p>
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-200">Auto-Greeting on Start</span>
                <p className="text-[11px] text-neutral-500">Mahii speaks up with a sweet loving greeting when opening the app</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoGreeting}
                onChange={(e) => onUpdateSettings({ autoGreeting: e.target.checked })}
                className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 cursor-pointer accent-pink-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-200">Sound Effects & Cues</span>
                <p className="text-[11px] text-neutral-500">Play subtle audio pings when listening or completing turns</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 cursor-pointer accent-pink-500"
              />
            </div>
          </div>

          {/* Language Fluency Info */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🇮🇳</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Language: Hindi & English (Bilingual)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">Active</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Mahii understands & speaks Hindi, Hinglish, and English naturally.
                </p>
              </div>
            </div>
          </div>

          {/* Safety & Personality Badge */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Persona Guardrail: Mahii maintains loving charm, witty romantic banter, and caring affection while strictly keeping all content safe, classy, and PG-13.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
