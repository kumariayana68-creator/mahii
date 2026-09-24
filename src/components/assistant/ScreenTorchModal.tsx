import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sun, X, Zap } from 'lucide-react';

interface ScreenTorchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenTorchModal: React.FC<ScreenTorchModalProps> = ({ isOpen, onClose }) => {
  const [colorMode, setColorMode] = useState<'white' | 'amber' | 'pink'>('white');
  const [isStrobe, setIsStrobe] = useState(false);
  const [strobeState, setStrobeState] = useState(true);

  useEffect(() => {
    if (!isOpen || !isStrobe) return;
    const interval = setInterval(() => {
      setStrobeState((prev) => !prev);
    }, 150);
    return () => clearInterval(interval);
  }, [isOpen, isStrobe]);

  if (!isOpen) return null;

  const bgColors = {
    white: isStrobe ? (strobeState ? 'bg-white' : 'bg-black') : 'bg-white',
    amber: isStrobe ? (strobeState ? 'bg-amber-300' : 'bg-black') : 'bg-amber-300',
    pink: isStrobe ? (strobeState ? 'bg-pink-300' : 'bg-black') : 'bg-pink-300',
  };

  const isLight = !isStrobe || strobeState;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-colors duration-150 flex flex-col justify-between p-6 select-none ${bgColors[colorMode]}`}
    >
      {/* Top Bar with Clear Back Button */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={onClose}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm shadow-xl transition-all cursor-pointer ${
            isLight
              ? 'bg-black/70 hover:bg-black/85 text-white'
              : 'bg-white/80 hover:bg-white text-black'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </button>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            isLight ? 'bg-black/20 text-neutral-800' : 'bg-white/20 text-white'
          }`}
        >
          Screen Flashlight Active
        </span>
      </div>

      {/* Center Notice */}
      <div className="text-center my-auto pointer-events-none">
        <div
          className={`text-5xl mb-3 ${
            isLight ? 'text-neutral-900' : 'text-white'
          } animate-pulse`}
        >
          💡
        </div>
        <p
          className={`text-base font-bold ${
            isLight ? 'text-neutral-800' : 'text-neutral-200'
          }`}
        >
          Screen Torch Illumination
        </p>
        <p
          className={`text-xs ${
            isLight ? 'text-neutral-600' : 'text-neutral-400'
          }`}
        >
          Turn screen brightness to max for full flashlight power
        </p>
      </div>

      {/* Bottom Color & Mode Selectors */}
      <div className="flex items-center justify-center gap-3 z-10 flex-wrap">
        <button
          onClick={() => {
            setColorMode('white');
            setIsStrobe(false);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md ${
            colorMode === 'white' && !isStrobe
              ? 'bg-black text-white ring-2 ring-neutral-400'
              : 'bg-white/60 text-neutral-800 hover:bg-white'
          }`}
        >
          Pure White
        </button>

        <button
          onClick={() => {
            setColorMode('amber');
            setIsStrobe(false);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md ${
            colorMode === 'amber' && !isStrobe
              ? 'bg-black text-amber-300 ring-2 ring-amber-400'
              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
          }`}
        >
          Warm Candle 🕯️
        </button>

        <button
          onClick={() => {
            setColorMode('pink');
            setIsStrobe(false);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md ${
            colorMode === 'pink' && !isStrobe
              ? 'bg-black text-pink-300 ring-2 ring-pink-400'
              : 'bg-pink-100 text-pink-900 hover:bg-pink-200'
          }`}
        >
          Romantic Pink 💖
        </button>

        <button
          onClick={() => setIsStrobe(!isStrobe)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
            isStrobe
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-black/60 text-white hover:bg-black/80'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isStrobe ? 'Strobe ON' : 'SOS Strobe'}</span>
        </button>
      </div>
    </div>
  );
};
