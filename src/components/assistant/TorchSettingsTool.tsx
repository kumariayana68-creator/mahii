import React, { useState, useRef, useEffect } from 'react';
import {
  Flashlight,
  Sun,
  Moon,
  Sliders,
  Sparkles,
  Zap,
  Power,
  RotateCcw,
  Check,
  Shield,
  Volume2,
  Vibrate,
  X,
} from 'lucide-react';

interface TorchSettingsToolProps {
  onOpenScreenTorch: () => void;
}

export const TorchSettingsTool: React.FC<TorchSettingsToolProps> = ({
  onOpenScreenTorch,
}) => {
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState<boolean | null>(null);
  const [torchError, setTorchError] = useState<string | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  // Toggle Physical Camera Flashlight
  const togglePhysicalTorch = async () => {
    if (isTorchOn) {
      // Turn off
      if (trackRef.current) {
        try {
          await (trackRef.current as any).applyConstraints({ advanced: [{ torch: false }] });
          trackRef.current.stop();
        } catch {}
        trackRef.current = null;
      }
      setIsTorchOn(false);
      return;
    }

    // Turn on
    try {
      setTorchError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      });

      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error('No camera track available');

      const capabilities = (track.getCapabilities?.() as any) || {};
      if ('torch' in capabilities) {
        await (track as any).applyConstraints({ advanced: [{ torch: true }] });
        trackRef.current = track;
        setIsTorchOn(true);
        setTorchSupported(true);
      } else {
        // Fallback: camera active but no physical LED torch (e.g. laptop or some tablets)
        setTorchSupported(false);
        track.stop();
        // Automatically open Screen Flashlight!
        onOpenScreenTorch();
      }
    } catch (err: any) {
      console.warn('Physical torch toggle failed:', err);
      setTorchSupported(false);
      setTorchError('Physical torch not accessible on this device. Screen Flashlight activated!');
      onOpenScreenTorch();
    }
  };

  useEffect(() => {
    return () => {
      if (trackRef.current) {
        try {
          trackRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-4 text-white">
      {/* Torch Flashlight Master Panel */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 flex flex-col items-center text-center relative overflow-hidden">
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            isTorchOn ? 'bg-amber-400/15' : 'bg-transparent'
          }`}
        />

        {/* Large Torch Toggle Button */}
        <button
          onClick={togglePhysicalTorch}
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 mb-4 ${
            isTorchOn
              ? 'bg-amber-400 text-neutral-950 shadow-amber-400/50 ring-8 ring-amber-400/20 animate-pulse'
              : 'bg-neutral-900 border-2 border-neutral-700 text-neutral-400 hover:text-white hover:border-pink-500/50 shadow-black'
          }`}
        >
          <Flashlight className={`w-8 h-8 ${isTorchOn ? 'text-black' : ''}`} />
          <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">
            {isTorchOn ? 'ON' : 'OFF'}
          </span>
        </button>

        <h3 className="text-base font-bold text-white">Camera LED Torch</h3>
        <p className="text-xs text-neutral-400 max-w-xs mt-1">
          {isTorchOn
            ? 'Camera flash is ON! Tap to turn off.'
            : 'Tap to toggle your phone camera LED flashlight.'}
        </p>

        {torchError && (
          <p className="text-[11px] text-amber-300 mt-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            {torchError}
          </p>
        )}
      </div>

      {/* Screen Flashlight & Night Light Button */}
      <button
        onClick={onOpenScreenTorch}
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 border border-amber-500/30 hover:border-amber-400 text-left transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            💡
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
              Full Screen Torch & Night Light
            </h4>
            <p className="text-[11px] text-neutral-400">
              Bright white screen illumination for dark rooms, reading & soft light
            </p>
          </div>
        </div>
        <span className="text-xs text-amber-300 font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
          Open Torch
        </span>
      </button>

      {/* Quick Companion Settings */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-400 block px-1">
          Companion & Device Features
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-neutral-200">Screen Strobe</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Ready</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-semibold text-neutral-200">Fast Launch</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
