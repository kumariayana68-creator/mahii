import React from 'react';
import { MicOff, ExternalLink, ShieldAlert, CheckCircle2, RotateCw, X } from 'lucide-react';

interface MicPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorMessage?: string;
}

export const MicPermissionModal: React.FC<MicPermissionModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  errorMessage,
}) => {
  if (!isOpen) return null;

  const isIframe = window.self !== window.top;
  const currentUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <MicOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Microphone Access Denied</h2>
              <p className="text-[11px] text-rose-400 font-medium">Permission is required for voice chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Browser me microphone access block ya deny ho gaya hai. Mahii ke sath voice chat karne ke liye microphone enable karein:
          </p>

          {/* Quick Steps Guide */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Microphone Unblock Kaise Karein:
            </h4>
            <ol className="text-xs text-neutral-400 space-y-2 pl-4 list-decimal">
              <li>
                Browser ke address bar me <strong className="text-white">lock icon 🔒</strong> ya <strong className="text-white">site settings ⚙️</strong> par tap karein.
              </li>
              <li>
                <strong className="text-white">Microphone</strong> permission ko <span className="text-emerald-400 font-semibold">"Allow"</span> par set karein.
              </li>
              <li>
                Neeche <strong className="text-pink-400">"Retry Mic Permission"</strong> par tap karein.
              </li>
            </ol>
          </div>

          {/* If inside iframe / preview */}
          {isIframe && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-neutral-900 border border-pink-500/30 text-xs">
              <span className="font-bold text-white block mb-1">Open in Direct Tab:</span>
              <p className="text-neutral-400 text-[11px] mb-2.5">
                Agar preview panel microphone block kar raha hai, to direct new tab me open karke Allow karein:
              </p>
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:bg-pink-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Direct Full App Tab
              </a>
            </div>
          )}

          {/* Text fallback hint */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400">
            <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
            <span>
              Aap neeche text input box se bhi Mahii se chat aur sweet voice replies sun sakte hain bina mic ke!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onRetry}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 active:scale-95 text-white text-xs font-bold shadow-lg shadow-pink-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Retry Mic Permission
          </button>
        </div>
      </div>
    </div>
  );
};
