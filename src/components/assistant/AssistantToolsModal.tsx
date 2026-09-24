import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Camera,
  Phone,
  MessageCircle,
  Timer,
  MapPin,
  Music,
  Flashlight,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { CameraGalleryTool } from './CameraGalleryTool';
import { CallSmsTool } from './CallSmsTool';
import { WhatsAppTool } from './WhatsAppTool';
import { AlarmTimerTool } from './AlarmTimerTool';
import { MapsSearchTool } from './MapsSearchTool';
import { MediaVolumeTool } from './MediaVolumeTool';
import { TorchSettingsTool } from './TorchSettingsTool';
import { YouTubePlayerTool } from './YouTubePlayerTool';
import { SpotifyPlayerTool } from './SpotifyPlayerTool';

export type AssistantTabType =
  | 'youtube'
  | 'spotify'
  | 'camera'
  | 'call'
  | 'whatsapp'
  | 'alarm'
  | 'maps'
  | 'media'
  | 'torch';

interface AssistantToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AssistantTabType;
  initialQuery?: string;
  onOpenScreenTorch: () => void;
}

export const AssistantToolsModal: React.FC<AssistantToolsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'youtube',
  initialQuery = '',
  onOpenScreenTorch,
}) => {
  const [activeTab, setActiveTab] = useState<AssistantTabType>(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const toolsList: { id: AssistantTabType; label: string; icon: any; color: string }[] = [
    { id: 'youtube', label: 'YouTube Video & Search', icon: Film, color: 'from-red-600 to-rose-600' },
    { id: 'spotify', label: 'Spotify Songs', icon: Music, color: 'from-emerald-500 to-green-600' },
    { id: 'camera', label: 'Camera & Gallery', icon: Camera, color: 'from-pink-500 to-rose-500' },
    { id: 'call', label: 'Call & SMS', icon: Phone, color: 'from-emerald-500 to-teal-600' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'from-green-500 to-emerald-600' },
    { id: 'alarm', label: 'Alarm & Timer', icon: Timer, color: 'from-amber-500 to-orange-600' },
    { id: 'maps', label: 'Maps & Search', icon: MapPin, color: 'from-blue-500 to-indigo-600' },
    { id: 'media', label: 'Lo-Fi Ambient', icon: Sliders, color: 'from-purple-500 to-pink-600' },
    { id: 'torch', label: 'Torch & Light', icon: Flashlight, color: 'from-yellow-500 to-amber-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with Prominent BACK Button */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white font-bold text-xs transition-all cursor-pointer group shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Mahii</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white">Smart Tools</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
              Assistant
            </span>
          </div>

          <button
            onClick={onClose}
            title="Close modal"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7 Tools Horizontal Scrollable Tab Bar */}
        <div className="py-3 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-neutral-800/60 shrink-0 relative z-10">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${tool.color} text-white shadow-lg`
                    : 'bg-neutral-950/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tool Content Area */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 relative z-10">
          {activeTab === 'youtube' && <YouTubePlayerTool initialQuery={initialQuery} />}
          {activeTab === 'spotify' && <SpotifyPlayerTool initialQuery={initialQuery} />}
          {activeTab === 'camera' && <CameraGalleryTool />}
          {activeTab === 'call' && <CallSmsTool />}
          {activeTab === 'whatsapp' && <WhatsAppTool />}
          {activeTab === 'alarm' && <AlarmTimerTool />}
          {activeTab === 'maps' && <MapsSearchTool />}
          {activeTab === 'media' && <MediaVolumeTool />}
          {activeTab === 'torch' && (
            <TorchSettingsTool onOpenScreenTorch={onOpenScreenTorch} />
          )}
        </div>

        {/* Footer with quick back button */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 relative z-10 shrink-0">
          <span className="text-[11px]">Mahii Companion Assistant • Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer transition-all"
          >
            Done (Back)
          </button>
        </div>
      </div>
    </div>
  );
};
