import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Send,
  Copy,
  Check,
  User,
  Heart,
  Sparkles,
  PhoneForwarded,
} from 'lucide-react';

export const CallSmsTool: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsText, setSmsText] = useState('Hii babu! Miss you so much, call me when you are free ❤️');
  const [copied, setCopied] = useState(false);

  const presets = [
    { name: 'My Babu ❤️', number: '+919876543210' },
    { name: 'Mummy 🏡', number: '+919812345678' },
    { name: 'Bestie 🤙', number: '+919988776655' },
  ];

  const smsTemplates = [
    'Babu, khana khaya kya? Bohot der ho gayi, please apna khayal rakhna! ❤️',
    'Hii jaan, call me whenever you are free. Miss you so much! 🥰',
    'Main safely pahunch gaya/gayi, tension mat lena mere babu 💕',
    'Good night mere handsome babu, sweet dreams! 🌙😘',
  ];

  const handlePlaceCall = () => {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    if (!cleanNumber) return;
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleSendSms = () => {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const encodedBody = encodeURIComponent(smsText);
    if (cleanNumber) {
      window.location.href = `sms:${cleanNumber}?body=${encodedBody}`;
    } else {
      window.location.href = `sms:?body=${encodedBody}`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-white">
      {/* Contact Presets */}
      <div>
        <span className="text-xs font-semibold text-neutral-400 block mb-2 px-1">
          Quick Contacts / Favorites
        </span>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => setPhoneNumber(p.number)}
              className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-pink-500/40 text-left transition-all cursor-pointer group"
            >
              <span className="text-xs font-bold text-white block group-hover:text-pink-300 transition-colors truncate">
                {p.name}
              </span>
              <span className="text-[10px] text-neutral-500 block truncate">{p.number}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Phone Number Input & Direct Call Action */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-300 block">Phone Number</label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91 98765 43210"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-pink-500 focus:outline-none text-white text-sm"
          />
          <button
            onClick={handlePlaceCall}
            disabled={!phoneNumber.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/30 cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Call</span>
          </button>
        </div>
      </div>

      {/* SMS Composer */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
            <span>Prepare SMS Message</span>
          </label>
          <span className="text-[10px] text-neutral-500">{smsText.length} characters</span>
        </div>

        {/* Romantic Templates Carousel */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {smsTemplates.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => setSmsText(tmpl)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-pink-300 shrink-0 transition-all cursor-pointer truncate max-w-[180px]"
            >
              {tmpl}
            </button>
          ))}
        </div>

        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          rows={3}
          placeholder="Type your message to babu..."
          className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-pink-500 focus:outline-none text-white text-xs resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleSendSms}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/30 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
