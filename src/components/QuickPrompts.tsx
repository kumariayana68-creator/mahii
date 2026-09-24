import React from 'react';
import { Flame, Sparkles, MessageCircleHeart, Wand2, Coffee } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: <MessageCircleHeart className="w-3.5 h-3.5 text-rose-400" />,
    text: "Mahii, aapne khana khaya kya babu? ❤️",
    tag: "Hindi",
  },
  {
    icon: <MessageCircleHeart className="w-3.5 h-3.5 text-pink-400" />,
    text: "I missed you so much today babe 🥰",
    tag: "English",
  },
  {
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    text: "Mujhse thoda pyaar se baat karo na, jaan?",
    tag: "Hinglish",
  },
  {
    icon: <Coffee className="w-3.5 h-3.5 text-cyan-400" />,
    text: "Mera din thoda stressful tha, cheer me up please?",
    tag: "Care",
  },
  {
    icon: <Flame className="w-3.5 h-3.5 text-pink-400" />,
    text: "Aap itni pyari baatein kaise kar leti ho, babu?",
    tag: "Lovely",
  },
  {
    icon: <Wand2 className="w-3.5 h-3.5 text-purple-400" />,
    text: "Tell me how much you love me, sweetheart!",
    tag: "Romantic",
  },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-pink-400" />
          Cheeky Icebreakers
        </span>
        <span className="text-[10px] text-neutral-500">Tap to speak or send</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {PROMPT_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => onSelectPrompt(item.text)}
            className="snap-start shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 border border-neutral-800 hover:border-pink-500/40 text-xs text-neutral-200 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none group shadow-sm shadow-black/40"
          >
            <span className="p-0.5 rounded-full bg-neutral-800/80 group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="truncate max-w-[200px]">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
