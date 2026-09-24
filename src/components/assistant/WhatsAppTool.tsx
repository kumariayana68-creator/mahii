import React, { useState } from 'react';
import { Send, Copy, Check, MessageCircle, Heart, Sparkles, Phone } from 'lucide-react';

export const WhatsAppTool: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Hii babu! ❤️ Main aapko bohot miss kar raha/rahi hoon, baat karo na?');
  const [copied, setCopied] = useState(false);

  const presets = [
    'Hii babu, I love you so much! ❤️',
    'Sunno na, aaj sham ko call par baat karein? 🥰',
    'Lunch kiya kya babu? Please khana kha lo! 🍱',
    'Miss you meri jaan, jaldi message ka reply do! 💖',
    'Good morning mere handsome hero! Have an amazing day ☀️',
  ];

  const handleOpenWhatsApp = () => {
    // Strip non-digits except +
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    let url = '';
    if (cleanPhone) {
      url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    } else {
      url = `https://wa.me/?text=${encoded}`;
    }
    window.open(url, '_blank');
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-white">
      {/* WhatsApp Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
            💬
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">WhatsApp Fast Messenger</h4>
            <p className="text-[11px] text-emerald-300/80">Send pre-filled romantic chats in 1 tap</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
          WhatsApp Web & App
        </span>
      </div>

      {/* Recipient Phone (Optional - leaves empty to choose contact in WhatsApp) */}
      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
        <label className="text-xs font-semibold text-neutral-300 block">
          Target Phone Number (Optional)
        </label>
        <p className="text-[11px] text-neutral-500">
          Leave blank to pick any contact or group directly inside WhatsApp!
        </p>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g. 919876543210 (with country code)"
          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-emerald-500 focus:outline-none text-white text-xs"
        />
      </div>

      {/* Message Composer & Sweet Templates */}
      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-current" />
          <span>Romantic WhatsApp Presets</span>
        </label>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {presets.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => setMessage(tmpl)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-emerald-300 shrink-0 transition-all cursor-pointer truncate max-w-[190px]"
            >
              {tmpl}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Type your WhatsApp message..."
          className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-emerald-500 focus:outline-none text-white text-xs resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={copyMessage}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
