import React from 'react';
import {
  Film,
  Music,
  Camera,
  Phone,
  MessageCircle,
  Timer,
  MapPin,
  Flashlight,
  Sparkles,
} from 'lucide-react';
import { AssistantTabType } from './AssistantToolsModal';

interface QuickAssistantDockProps {
  onOpenTool: (tab: AssistantTabType) => void;
}

export const QuickAssistantDock: React.FC<QuickAssistantDockProps> = ({ onOpenTool }) => {
  const dockItems: {
    tab: AssistantTabType;
    icon: any;
    label: string;
    color: string;
    badge?: string;
  }[] = [
    {
      tab: 'youtube',
      icon: Film,
      label: 'YouTube',
      color: 'hover:border-red-500/50 hover:bg-red-500/10 text-red-400',
    },
    {
      tab: 'spotify',
      icon: Music,
      label: 'Spotify',
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
    },
    {
      tab: 'camera',
      icon: Camera,
      label: 'Camera',
      color: 'hover:border-pink-500/50 hover:bg-pink-500/10 text-pink-400',
    },
    {
      tab: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'hover:border-green-500/50 hover:bg-green-500/10 text-green-400',
    },
    {
      tab: 'call',
      icon: Phone,
      label: 'Call/SMS',
      color: 'hover:border-teal-500/50 hover:bg-teal-500/10 text-teal-400',
    },
    {
      tab: 'alarm',
      icon: Timer,
      label: 'Timer',
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400',
    },
    {
      tab: 'maps',
      icon: MapPin,
      label: 'Maps',
      color: 'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400',
    },
    {
      tab: 'torch',
      icon: Flashlight,
      label: 'Torch',
      color: 'hover:border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-400',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-2">
      <div className="p-1.5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-xl shadow-lg flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        {dockItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              onClick={() => onOpenTool(item.tab)}
              title={`Open ${item.label}`}
              className={`flex-1 min-w-[50px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 border border-transparent transition-all cursor-pointer group active:scale-95 ${item.color}`}
            >
              <div className="w-7 h-7 rounded-lg bg-neutral-950/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-semibold text-neutral-300 group-hover:text-white transition-colors truncate max-w-[52px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
