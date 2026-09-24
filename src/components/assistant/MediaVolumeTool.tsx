import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Radio,
  Sliders,
  Sparkles,
  Heart,
} from 'lucide-react';
import { ambientAudio } from '../../utils/ambientAudio';

export const MediaVolumeTool: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(ambientAudio.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(ambientAudio.getCurrentTrack());
  const [ambientVolume, setAmbientVolume] = useState(60);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    ambientAudio.setVolume(isMuted ? 0 : ambientVolume / 100);
  }, [ambientVolume, isMuted]);

  const handleTogglePlay = () => {
    const nextState = ambientAudio.togglePlay();
    setIsPlaying(nextState);
    setCurrentTrack(ambientAudio.getCurrentTrack());
  };

  const handleNext = () => {
    ambientAudio.nextTrack();
    setIsPlaying(true);
    setCurrentTrack(ambientAudio.getCurrentTrack());
  };

  const handlePrev = () => {
    ambientAudio.prevTrack();
    setIsPlaying(true);
    setCurrentTrack(ambientAudio.getCurrentTrack());
  };

  const activeTrackObj = ambientAudio.tracks[currentTrack] || ambientAudio.tracks[0];

  return (
    <div className="space-y-4 text-white">
      {/* Now Playing Card */}
      <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-pink-500/20 shrink-0">
            {activeTrackObj.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
              Mahii Ambiance Radio
            </span>
            <h3 className="text-base font-bold text-white truncate">{activeTrackObj.title}</h3>
            <p className="text-xs text-neutral-400 truncate">{activeTrackObj.vibe}</p>
          </div>

          {/* Equalizer animation when playing */}
          {isPlaying && (
            <div className="flex items-end gap-1 h-6 shrink-0">
              <span className="w-1 bg-pink-500 rounded-full animate-[bounce_0.6s_infinite] h-5" />
              <span className="w-1 bg-purple-500 rounded-full animate-[bounce_0.9s_infinite] h-3" />
              <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.7s_infinite] h-6" />
            </div>
          )}
        </div>

        {/* Media Player Controls */}
        <div className="flex items-center justify-center gap-5 pt-2">
          <button
            onClick={handlePrev}
            title="Previous Track"
            className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause Music' : 'Play Music'}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 hover:opacity-95 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            title="Next Track"
            className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Track Selection Playlist */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-neutral-400 block px-1">
          Ambient Lo-Fi Chill Playlist
        </span>
        <div className="space-y-1.5">
          {ambientAudio.tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => {
                ambientAudio.playTrack(track.id);
                setIsPlaying(true);
                setCurrentTrack(track.id);
              }}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                currentTrack === track.id && isPlaying
                  ? 'bg-pink-500/15 border-pink-500/40 text-pink-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg">{track.icon}</span>
                <div className="truncate">
                  <span className="text-xs font-bold block truncate">{track.title}</span>
                  <span className="text-[10px] text-neutral-500 block truncate">{track.vibe}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-pink-400">
                {currentTrack === track.id && isPlaying ? 'Playing' : 'Play'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Volume Sliders & Master Control */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
            <Volume2 className="w-4 h-4 text-pink-400" />
            <span>Volume Controls</span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        </div>

        {/* Ambient Lo-Fi Volume */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>Ambiance Music Volume</span>
            <span>{isMuted ? 'Muted' : `${ambientVolume}%`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : ambientVolume}
            onChange={(e) => {
              setIsMuted(false);
              setAmbientVolume(Number(e.target.value));
            }}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
