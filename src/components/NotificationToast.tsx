import React, { useEffect } from 'react';
import { Phone, X, Sparkles, Heart } from 'lucide-react';
import roxyAvatarImg from '../assets/images/roxy_avatar_1790240932839.jpg';

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  category: 'love' | 'care' | 'call' | 'routine';
  read?: boolean;
}

interface NotificationToastProps {
  alert: AlertNotification | null;
  onDismiss: () => void;
  onActionClick: (alert: AlertNotification) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  alert,
  onDismiss,
  onActionClick,
}) => {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto animate-in slide-in-from-top-4 duration-300">
      <div className="w-full bg-neutral-900/95 border border-pink-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0 w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-rose-400">
          <img
            src={roxyAvatarImg}
            alt="Mahii"
            className="w-full h-full object-cover rounded-full"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-[10px]">
            ❤️
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate">{alert.title}</span>
            <span className="text-[10px] text-pink-400 font-medium px-1.5 py-0.2 rounded-full bg-pink-500/15 border border-pink-500/30 shrink-0">
              Mahii Alert
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2 leading-tight">
            {alert.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onActionClick(alert)}
            className="px-2.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-pink-500/30 transition-all cursor-pointer"
          >
            <Phone className="w-3 h-3 fill-current" />
            <span>Reply</span>
          </button>
          <button
            onClick={onDismiss}
            title="Dismiss notification"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
