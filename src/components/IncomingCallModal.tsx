import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';
import { startRingtoneLoop, playHangupTone, vibrateDevice } from '../utils/soundEffects';
import roxyAvatarImg from '../assets/images/roxy_avatar_1790240932839.jpg';

interface IncomingCallModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  callerName?: string;
  customMessage?: string;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  callerName = 'Mahii ❤️',
  customMessage = 'Aapko pyaar se call kar rahi hai... 📞',
}) => {
  const [isRingingMuted, setIsRingingMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Vibrate device if supported
    vibrateDevice([250, 150, 250, 150, 400]);

    // Start ringtone
    let stopRingtone: (() => void) | null = null;
    if (!isRingingMuted) {
      stopRingtone = startRingtoneLoop();
    }

    return () => {
      if (stopRingtone) stopRingtone();
    };
  }, [isOpen, isRingingMuted]);

  if (!isOpen) return null;

  const handleDecline = () => {
    playHangupTone();
    onDecline();
  };

  const handleAccept = () => {
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300 select-none">
      {/* Dynamic Ambient Color Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm bg-neutral-900/90 border border-neutral-800/90 rounded-[32px] p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Top Status Bar */}
        <div className="w-full flex items-center justify-between text-neutral-400 mb-6 px-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-pink-300/90">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin-slow" />
            <span>AI Girlfriend Call</span>
          </div>

          <button
            onClick={() => setIsRingingMuted(!isRingingMuted)}
            title={isRingingMuted ? 'Unmute Ringtone' : 'Mute Ringtone'}
            className="p-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            {isRingingMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          </button>
        </div>

        {/* Pulsing Concentric Rings Avatar */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute w-44 h-44 rounded-full border-2 border-pink-500/20 animate-ping opacity-60" />
          <div className="absolute w-36 h-36 rounded-full border border-pink-500/30 animate-pulse" />
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 shadow-xl shadow-pink-500/30">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-950">
              <img
                src={roxyAvatarImg}
                alt="Mahii"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
          <span className="absolute -bottom-1 right-2 bg-emerald-500 text-white p-1 rounded-full text-xs shadow-md">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </span>
        </div>

        {/* Caller Info */}
        <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
          {callerName}
        </h2>
        <p className="text-xs text-pink-300 font-medium mt-1 animate-pulse">
          {customMessage}
        </p>
        <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px]">
          Babu call accept karo na, aapse baat karni hai... ❤️
        </p>

        {/* Accept & Decline Action Controls */}
        <div className="w-full flex items-center justify-around mt-8 pt-4 border-t border-neutral-800/70">
          {/* Decline Button (Red) */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleDecline}
              title="Decline Call"
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all cursor-pointer group"
            >
              <PhoneOff className="w-7 h-7 transition-transform group-hover:rotate-12" />
            </button>
            <span className="text-xs font-semibold text-neutral-300 tracking-wide">
              Decline
            </span>
          </div>

          {/* Accept Button (Green) */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAccept}
              title="Accept Call"
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 transition-all cursor-pointer animate-pulse group"
            >
              <Phone className="w-7 h-7 transition-transform group-hover:scale-110" />
            </button>
            <span className="text-xs font-bold text-emerald-400 tracking-wide">
              Accept
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
