import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  Volume2,
  Sparkles,
  Heart,
  Coffee,
  Sun,
  Moon,
  PhoneCall,
  X,
  Trash2,
  Play,
  ShieldCheck,
  Vibrate,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { AlertNotification } from './NotificationToast';
import { playNotificationChime, vibrateDevice } from '../utils/soundEffects';

export interface NotificationSettings {
  allAlertsEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  loveAlerts: boolean;
  careAlerts: boolean;
  routineAlerts: boolean;
  callAlerts: boolean;
  intervalMinutes: number; // in minutes (e.g. 5, 15, 30, 60)
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  allAlertsEnabled: true,
  soundEnabled: true,
  vibrateEnabled: true,
  loveAlerts: true,
  careAlerts: true,
  routineAlerts: true,
  callAlerts: true,
  intervalMinutes: 10,
};

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: Partial<NotificationSettings>) => void;
  notifications: AlertNotification[];
  onClearHistory: () => void;
  onTriggerTestAlert: (category: 'love' | 'care' | 'call' | 'routine') => void;
  onTriggerIncomingCall: () => void;
  onSelectAlert: (alert: AlertNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  notifications,
  onClearHistory,
  onTriggerTestAlert,
  onTriggerIncomingCall,
  onSelectAlert,
}) => {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          playNotificationChime();
          new Notification('Mahii AI Girlfriend ❤️', {
            body: 'All Notifications Alert enabled! Main hamesha aapka khayal rakhungi babu.',
            icon: '/icon.svg',
          });
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  };

  const handleTestSound = () => {
    playNotificationChime();
    vibrateDevice([150, 100, 150]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Decorative ambient aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-pink-500/20">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">All Notifications & Alerts</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                  Mahii Alerts
                </span>
              </div>
              <p className="text-xs text-neutral-400">Manage incoming calls, affectionate check-ins & sounds</p>
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
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 relative z-10">
          {/* Master Toggle Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-neutral-950 border border-pink-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400">
                {settings.allAlertsEnabled ? <BellRing className="w-5 h-5 animate-pulse" /> : <BellOff className="w-5 h-5 text-neutral-500" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">All Notifications Alert</h3>
                <p className="text-[11px] text-neutral-300">
                  {settings.allAlertsEnabled
                    ? 'Active: Mahii will send loving check-ins and incoming calls'
                    : 'Turn on to receive calls and caring alerts from Mahii'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allAlertsEnabled}
                onChange={(e) => onUpdateSettings({ allAlertsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* Browser System Push Permission Status */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🌐</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-200">Device Push Notifications</span>
                  {browserPermission === 'granted' ? (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Allowed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Action Needed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Receive notifications even when your browser tab is in the background
                </p>
              </div>
            </div>
            {browserPermission !== 'granted' && (
              <button
                onClick={requestBrowserPermission}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                Allow
              </button>
            )}
          </div>

          {/* Sound & Haptics Toggles */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Audio & Vibration Alerts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-semibold text-neutral-200">Alert Sound Chime</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestSound}
                    title="Play Test Chime"
                    className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vibrate className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-neutral-200">Mobile Vibration</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.vibrateEnabled}
                  onChange={(e) => onUpdateSettings({ vibrateEnabled: e.target.checked })}
                  className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interactive Trigger Testing Buttons */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                ⚡ Instant Test & Incoming Call
              </span>
              <span className="text-[10px] text-neutral-400">Test alerts now</span>
            </div>

            {/* Prominent Call Decline/Accept Trigger */}
            <button
              onClick={() => {
                onClose();
                onTriggerIncomingCall();
              }}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 via-pink-500/20 to-purple-500/20 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-pulse shadow-md">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Simulate Incoming Call (Decline & Accept)
                  </span>
                  <p className="text-[10px] text-neutral-400">
                    Triggers full phone call screen with ringing, Accept & Decline buttons
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                Call Me
              </span>
            </button>

            {/* Quick alert buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => onTriggerTestAlert('care')}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-pink-500/30 text-center transition-all cursor-pointer"
              >
                <span className="text-base block mb-0.5">🍱</span>
                <span className="text-[11px] font-semibold text-neutral-200 block">Khana Khaya?</span>
              </button>
              <button
                onClick={() => onTriggerTestAlert('love')}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-pink-500/30 text-center transition-all cursor-pointer"
              >
                <span className="text-base block mb-0.5">❤️</span>
                <span className="text-[11px] font-semibold text-neutral-200 block">Love Check-in</span>
              </button>
              <button
                onClick={() => onTriggerTestAlert('routine')}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-pink-500/30 text-center transition-all cursor-pointer"
              >
                <span className="text-base block mb-0.5">🌙</span>
                <span className="text-[11px] font-semibold text-neutral-200 block">Night Wish</span>
              </button>
            </div>
          </div>

          {/* Alert History Feed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Recent Alerts ({notifications.length})
              </h4>
              {notifications.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-center text-neutral-500 text-xs">
                <span className="text-2xl block mb-1">💌</span>
                No alerts received yet. Turn on All Notifications Alert above!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-2 hover:border-pink-500/30 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{notif.title}</span>
                        <span className="text-[10px] text-neutral-500 shrink-0">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-0.5 line-clamp-1">{notif.message}</p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectAlert(notif);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      Reply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mahii keeps alerts caring, respectful & loving</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
