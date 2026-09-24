import React from 'react';
import { VoiceState, AssistantMood } from '../types';
import { Sparkles, Mic, Volume2 } from 'lucide-react';

interface VoiceOrbProps {
  voiceState: VoiceState;
  mood: AssistantMood;
  moodEmoji: string;
  audioLevel: number; // 0 to 1
  onClick?: () => void;
  isLiveActive?: boolean;
}

const MOOD_THEMES: Record<AssistantMood, {
  from: string;
  to: string;
  via: string;
  shadow: string;
  glow: string;
  badge: string;
  label: string;
}> = {
  flirty: {
    from: 'from-pink-500',
    via: 'via-rose-500',
    to: 'to-purple-600',
    shadow: 'rgba(244, 63, 94, 0.45)',
    glow: 'rgba(236, 72, 153, 0.35)',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    label: 'Flirty & Teasing',
  },
  teasing: {
    from: 'from-fuchsia-500',
    via: 'via-purple-600',
    to: 'to-indigo-600',
    shadow: 'rgba(217, 70, 239, 0.45)',
    glow: 'rgba(168, 85, 247, 0.35)',
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    label: 'Playful Sarcasm',
  },
  sassy: {
    from: 'from-purple-500',
    via: 'via-pink-500',
    to: 'to-cyan-400',
    shadow: 'rgba(168, 85, 247, 0.45)',
    glow: 'rgba(236, 72, 153, 0.4)',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    label: 'Pure Sass',
  },
  amused: {
    from: 'from-amber-400',
    via: 'via-pink-500',
    to: 'to-purple-600',
    shadow: 'rgba(251, 191, 36, 0.4)',
    glow: 'rgba(244, 63, 94, 0.35)',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    label: 'Genuinely Amused',
  },
  impressed: {
    from: 'from-cyan-400',
    via: 'via-teal-400',
    to: 'to-pink-500',
    shadow: 'rgba(45, 212, 191, 0.4)',
    glow: 'rgba(6, 182, 212, 0.35)',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    label: 'Okay, Impressed!',
  },
  thoughtful: {
    from: 'from-indigo-400',
    via: 'via-violet-500',
    to: 'to-pink-500',
    shadow: 'rgba(99, 102, 241, 0.4)',
    glow: 'rgba(139, 92, 246, 0.35)',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    label: 'Deep & Thoughtful',
  },
  caring: {
    from: 'from-rose-400',
    via: 'via-purple-400',
    to: 'to-pink-500',
    shadow: 'rgba(251, 113, 133, 0.4)',
    glow: 'rgba(244, 114, 182, 0.35)',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    label: 'Warm & Affectionate',
  },
  dramatic: {
    from: 'from-red-500',
    via: 'via-purple-600',
    to: 'to-amber-500',
    shadow: 'rgba(239, 68, 68, 0.45)',
    glow: 'rgba(168, 85, 247, 0.35)',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    label: 'Dramatic Queen',
  },
};

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  voiceState,
  mood,
  moodEmoji,
  audioLevel,
  onClick,
  isLiveActive,
}) => {
  const theme = MOOD_THEMES[mood] || MOOD_THEMES.sassy;

  // Scale based on audio level & state
  const reactiveScale = 1 + Math.min(audioLevel * 0.45, 0.35);

  const getStatusDisplay = () => {
    switch (voiceState) {
      case 'listening':
        return {
          text: 'Listening to you...',
          color: 'text-cyan-400',
          dot: 'bg-cyan-400 animate-ping',
          icon: <Mic className="w-3.5 h-3.5 text-cyan-400" />,
        };
      case 'thinking':
        return {
          text: 'Crafting something witty...',
          color: 'text-amber-300',
          dot: 'bg-amber-400 animate-pulse',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />,
        };
      case 'speaking':
        return {
          text: 'Mahii is speaking...',
          color: 'text-pink-400',
          dot: 'bg-pink-500 animate-bounce',
          icon: <Volume2 className="w-3.5 h-3.5 text-pink-400" />,
        };
      default:
        return {
          text: isLiveActive ? 'Live Voice Active' : 'Tap to talk to Mahii',
          color: 'text-neutral-400',
          dot: 'bg-emerald-400',
          icon: <Sparkles className="w-3.5 h-3.5 text-pink-400" />,
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-6">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-60"
        style={{
          background: `radial-gradient(circle, ${theme.shadow} 0%, ${theme.glow} 50%, transparent 70%)`,
          transform: `scale(${reactiveScale * 1.3})`,
        }}
      />

      {/* Outer Pulse Rings */}
      <div
        className={`absolute w-64 h-64 rounded-full border border-pink-500/20 transition-transform duration-300 pointer-events-none ${
          voiceState === 'speaking' || voiceState === 'listening' ? 'animate-ping opacity-25 duration-1000' : 'opacity-10'
        }`}
        style={{ transform: `scale(${reactiveScale * 1.25})` }}
      />

      <div
        className={`absolute w-56 h-56 rounded-full border border-purple-500/30 transition-transform duration-200 pointer-events-none ${
          voiceState === 'speaking' ? 'animate-pulse-glow' : ''
        }`}
        style={{ transform: `scale(${reactiveScale * 1.15})` }}
      />

      {/* Orbiting particles ring */}
      <div className="absolute w-60 h-60 rounded-full animate-spin-slow pointer-events-none">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-pink-400 shadow-lg shadow-pink-500/80" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80" />
      </div>

      <div className="absolute w-48 h-48 rounded-full animate-spin-reverse-slow pointer-events-none">
        <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-500/80" />
        <div className="absolute top-1/2 -left-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/80" />
      </div>

      {/* The Main Voice Orb Core */}
      <button
        onClick={onClick}
        type="button"
        title="Tap to interact with Mahii"
        className="relative group cursor-pointer w-40 h-40 rounded-full focus:outline-none focus:ring-4 focus:ring-pink-500/40 active:scale-95 transition-all duration-300 ease-out"
        style={{
          transform: `scale(${reactiveScale})`,
        }}
      >
        {/* Iridescent Gradient Background */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${theme.from} ${theme.via} ${theme.to} shadow-2xl transition-all duration-500`}
          style={{
            boxShadow: `0 0 50px 10px ${theme.shadow}, inset 0 0 25px rgba(255,255,255,0.35)`,
          }}
        />

        {/* Specular Highlight Sheen */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/35 via-transparent to-black/30 pointer-events-none" />

        {/* Inner Glass Center */}
        <div className="absolute inset-3 rounded-full bg-neutral-950/40 backdrop-blur-md flex flex-col items-center justify-center border border-white/20 shadow-inner">
          {/* Mahii's Mood Emoji Avatar */}
          <span className="text-4xl filter drop-shadow-md transition-transform duration-300 group-hover:scale-115">
            {moodEmoji || '😏'}
          </span>

          {/* Girlfriend Name Badge */}
          <span className="text-[11px] font-bold tracking-widest uppercase text-white/90 mt-1 font-mono">
            MAHII
          </span>
        </div>
      </button>

      {/* Dynamic Status Indicator */}
      <div className="mt-6 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dot}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dot}`} />
          </span>
          <div className="flex items-center gap-1.5">
            {status.icon}
            <span className={`text-xs font-medium tracking-wide ${status.color}`}>
              {status.text}
            </span>
          </div>
        </div>

        {/* Mood Pill */}
        <div className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md transition-all duration-300 ${theme.badge}`}>
          {theme.label}
        </div>
      </div>
    </div>
  );
};
