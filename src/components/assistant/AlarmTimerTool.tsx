import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Bell,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Volume2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { playNotificationChime, vibrateDevice } from '../../utils/soundEffects';

interface AlarmItem {
  id: string;
  time: string; // "07:30"
  label: string;
  enabled: boolean;
}

export const AlarmTimerTool: React.FC = () => {
  const [subTab, setSubTab] = useState<'timer' | 'alarm'>('timer');

  // Timer States
  const [totalSeconds, setTotalSeconds] = useState(300); // default 5 mins
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Alarm States
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem('mahii_alarms');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'alm_1', time: '07:30', label: 'Wake up with Mahii ❤️', enabled: true },
      { id: 'alm_2', time: '13:30', label: 'Lunch reminder 🍱', enabled: true },
      { id: 'alm_3', time: '22:30', label: 'Good night call with babu 🌙', enabled: false },
    ];
  });

  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Mahii Date reminder ❤️');

  useEffect(() => {
    try {
      localStorage.setItem('mahii_alarms', JSON.stringify(alarms));
    } catch {}
  }, [alarms]);

  // Timer Tick Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            // Trigger Alarm chime & alert
            playNotificationChime();
            vibrateDevice([300, 150, 300, 150, 600]);
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('⏰ Mahii Timer Finished!', {
                body: 'Babu, aapka timer khatam ho gaya! ❤️',
                icon: '/icon.svg',
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const selectPreset = (seconds: number) => {
    setIsRunning(false);
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addAlarm = () => {
    if (!newAlarmTime) return;
    const item: AlarmItem = {
      id: 'alm_' + Date.now(),
      time: newAlarmTime,
      label: newAlarmLabel || 'Mahii Alarm',
      enabled: true,
    };
    setAlarms((prev) => [...prev, item]);
  };

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4 text-white">
      {/* Sub Tabs */}
      <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800">
        <button
          onClick={() => setSubTab('timer')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'timer'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Countdown Timer</span>
        </button>
        <button
          onClick={() => setSubTab('alarm')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'alarm'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Alarms ({alarms.filter((a) => a.enabled).length} active)</span>
        </button>
      </div>

      {subTab === 'timer' && (
        <div className="space-y-4">
          {/* Quick Presets */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { label: '1m', sec: 60 },
              { label: '3m', sec: 180 },
              { label: '5m', sec: 300 },
              { label: '10m', sec: 600 },
              { label: '15m', sec: 900 },
              { label: '25m (Focus)', sec: 1500 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => selectPreset(p.sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  totalSeconds === p.sec
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Big Countdown Display */}
          <div className="p-8 rounded-3xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
            <span className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-white mb-2">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-xs text-pink-300/80 font-medium">
              {isRunning ? 'Timer running with Mahii ⏳' : 'Tap Start to begin countdown'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              title="Reset Timer"
              className="p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-95 shadow-pink-500/40'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start Timer'}</span>
            </button>
          </div>
        </div>
      )}

      {subTab === 'alarm' && (
        <div className="space-y-3">
          {/* Add Alarm Form */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <span className="text-xs font-semibold text-neutral-300 block">Set New Alarm</span>
            <div className="flex gap-2">
              <input
                type="time"
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-pink-500"
              />
              <input
                type="text"
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                placeholder="Alarm label..."
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={addAlarm}
                className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Alarms List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  alarm.enabled
                    ? 'bg-neutral-950 border-pink-500/30'
                    : 'bg-neutral-950/60 border-neutral-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-white">{alarm.time}</span>
                    <span className="text-[11px] text-pink-300 font-medium truncate max-w-[150px]">
                      {alarm.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alarm.enabled}
                      onChange={() => toggleAlarm(alarm.id)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>

                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
