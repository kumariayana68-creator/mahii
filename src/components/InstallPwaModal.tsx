import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, ExternalLink, X, Shield, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const ua = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-lg shadow-lg shadow-pink-500/25">
              📱
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Download / Install as App</h2>
              <p className="text-[11px] text-pink-300 font-medium">Install Mahii on your Android Phone or PC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          {/* Status Badge */}
          {isInstalled ? (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Mahii is already installed as a standalone app on your device!</span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                  Direct 1-Click Install
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                  PWA / Web APK
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                App phone screen par ek native Android app ki tarah save ho jayegi, full screen chalegi aur app icon create hoga.
              </p>

              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Install App Now (Add to Home Screen)
                </button>
              )}
            </div>
          )}

          {/* Android Chrome Installation Steps */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Android / Chrome par install kaise karein:
            </h4>
            <ol className="text-xs text-neutral-400 space-y-2 pl-4 list-decimal">
              <li>
                Chrome browser ke top-right me <strong className="text-white">3 dots (⋮)</strong> menu par tap karein.
              </li>
              <li>
                Menu me se <strong className="text-pink-300">"Add to Home screen"</strong> ya <strong className="text-pink-300">"Install app"</strong> par click karein.
              </li>
              <li>
                <strong className="text-white">Install</strong> select karein. Yeh aapke phone app drawer me icon bana dega!
              </li>
            </ol>
          </div>

          {/* Web2APK Note */}
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-neutral-200 font-semibold">Native .APK File Convert:</span>
              <p className="mt-0.5">
                Is live app URL ko aap free tools jaise <strong>PWABuilder.com</strong> ya <strong>Web2APK</strong> me daal kar direct sign kiya hua <code>.apk</code> download kar sakte hain!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
