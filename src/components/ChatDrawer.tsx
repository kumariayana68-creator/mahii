import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { X, Play, Volume2, Trash2, Copy, Sparkles, User, ArrowLeft } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onReplayAudio: (audioBase64: string) => void;
  onClearHistory: () => void;
  onSelectSuggestedReply?: (text: string) => void;
  suggestedReplies?: string[];
  disabled?: boolean;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onReplayAudio,
  onClearHistory,
  onSelectSuggestedReply,
  suggestedReplies,
  disabled,
}) => {
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-950/95 backdrop-blur-2xl border-l border-neutral-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-neutral-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-md shadow-pink-500/20 text-base">
            😏
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Transcript & Chat</h2>
            <p className="text-[11px] text-neutral-400">Mahii's conversation history</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear transcript"
              className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <span className="text-4xl mb-3">🥰</span>
            <p className="text-sm font-medium text-neutral-300">No chat recorded yet</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              Say something sweet to Mahii or tap the microphone to start talking!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm relative group ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-xs'
                    : 'bg-neutral-900/90 border border-neutral-800 text-neutral-100 rounded-bl-xs'
                }`}
              >
                {/* Header row for model message */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-neutral-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{msg.moodEmoji || '🥰'}</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                        Mahii
                      </span>
                      {msg.mood && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 capitalize">
                          {msg.mood}
                        </span>
                      )}
                    </div>

                    {msg.vocalBurst && (
                      <span className="text-[10px] italic text-neutral-400">
                        {msg.vocalBurst}
                      </span>
                    )}
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-pink-400/30 text-[11px] text-pink-200">
                    <User className="w-3 h-3" />
                    <span>You</span>
                  </div>
                )}

                {/* Message Body */}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Footer action tools */}
                <div className="flex items-center justify-end gap-1.5 mt-2 pt-1">
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    title="Copy message"
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-black/20 transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {msg.audioBase64 && (
                    <button
                      onClick={() => onReplayAudio(msg.audioBase64!)}
                      title="Replay Roxy's voice"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      Replay
                    </button>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-neutral-500 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}

        {/* Dynamic Suggested Follow-ups */}
        {suggestedReplies && suggestedReplies.length > 0 && (
          <div className="pt-2 border-t border-neutral-800/80">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-pink-400" />
              Sassy Follow-ups
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedReplies.map((reply, i) => (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => onSelectSuggestedReply?.(reply)}
                  className="text-xs px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-pink-500/50 text-neutral-200 transition-all text-left active:scale-95 disabled:opacity-50"
                >
                  "{reply}"
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>
    </div>
  );
};
