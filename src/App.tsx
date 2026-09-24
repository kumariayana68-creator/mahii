import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Settings,
  MessageSquare,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Flame,
  Info,
  ChevronRight,
  Smartphone,
  Download,
  Bell,
  BellRing,
  PhoneCall,
} from 'lucide-react';
import { VoiceOrb } from './components/VoiceOrb';
import { Roxy3DCharacter } from './components/Roxy3DCharacter';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { QuickPrompts } from './components/QuickPrompts';
import { ChatDrawer } from './components/ChatDrawer';
import { SettingsModal } from './components/SettingsModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { MicPermissionModal } from './components/MicPermissionModal';
import { IncomingCallModal } from './components/IncomingCallModal';
import {
  NotificationsModal,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from './components/NotificationsModal';
import { NotificationToast, AlertNotification } from './components/NotificationToast';
import { playNotificationChime, vibrateDevice } from './utils/soundEffects';
import {
  AssistantToolsModal,
  AssistantTabType,
} from './components/assistant/AssistantToolsModal';
import { ScreenTorchModal } from './components/assistant/ScreenTorchModal';
import { QuickAssistantDock } from './components/assistant/QuickAssistantDock';
import {
  ChatMessage,
  VoiceSettings,
  VoiceState,
  AssistantMood,
} from './types';
import { floatTo16BitPCM, arrayBufferToBase64, playAudioData } from './utils/audioUtils';

const DEFAULT_SETTINGS: VoiceSettings = {
  spiceLevel: 'girlfriend',
  voiceName: 'Kore',
  mode: 'live',
  autoGreeting: true,
  soundEffects: true,
  wallpaperStyle: 'cozy_room',
};

export default function App() {
  // Settings & UI state
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('mahii_settings') || localStorage.getItem('roxy_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [mood, setMood] = useState<AssistantMood>('caring');
  const [moodEmoji, setMoodEmoji] = useState<string>('🥰');
  const [vocalBurst, setVocalBurst] = useState<string>('*sweet soft smile*');
  const [activeSubtitle, setActiveSubtitle] = useState<string>(
    "Hii babu! Mahii kab se aapka wait kar rahi thi... Kaise ho aap? Tell me, how was your day, my love? ❤️"
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    "Mahii, aapne khana khaya kya babu? ❤️",
    "I missed you today babe 🥰",
    "Mujhse thoda pyaar se baat karo na, jaan",
    "Tell me how much you love me sweetheart",
  ]);

  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLiveWsActive, setIsLiveWsActive] = useState<boolean>(false);
  const [isRecordingTurn, setIsRecordingTurn] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isMicErrorModalOpen, setIsMicErrorModalOpen] = useState<boolean>(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string>('');
  const [hasUnlockedAudio, setHasUnlockedAudio] = useState<boolean>(false);
  const [characterView, setCharacterView] = useState<'3d' | 'orb'>('3d');

  // Audio refs
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // WebSocket ref for Live API
  const wsRef = useRef<WebSocket | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextAudioStartTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Save settings on update
  useEffect(() => {
    localStorage.setItem('mahii_settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize or get 24kHz Output AudioContext
  const getOutputAudioContext = useCallback(() => {
    if (!outputAudioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 24000 });
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyser.connect(ctx.destination);

      outputAudioCtxRef.current = ctx;
      outputAnalyserRef.current = analyser;
    }
    if (outputAudioCtxRef.current.state === 'suspended') {
      outputAudioCtxRef.current.resume();
    }
    return { ctx: outputAudioCtxRef.current, analyser: outputAnalyserRef.current! };
  }, []);

  // Stop all active assistant audio playback (e.g. for interruption)
  const stopAllAssistantAudio = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
    activeSourcesRef.current = [];
    nextAudioStartTimeRef.current = 0;
    if (voiceState === 'speaking') {
      setVoiceState('idle');
    }
  }, [voiceState]);

  // Audio level monitoring loop for reactive orb and waveform
  useEffect(() => {
    const updateAudioMeters = () => {
      let level = 0;

      // When speaking: read from output analyser
      if (voiceState === 'speaking' && outputAnalyserRef.current) {
        const buffer = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
        outputAnalyserRef.current.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        level = sum / (buffer.length * 255);
      }
      // When listening: read from input analyser
      else if (voiceState === 'listening' && inputAnalyserRef.current) {
        const buffer = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
        inputAnalyserRef.current.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        level = sum / (buffer.length * 255);
      } else {
        // Ambient subtle idle breathe
        level = 0.05 + Math.sin(Date.now() * 0.002) * 0.03;
      }

      setAudioLevel(level);
      animFrameIdRef.current = requestAnimationFrame(updateAudioMeters);
    };

    animFrameIdRef.current = requestAnimationFrame(updateAudioMeters);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [voiceState]);

  // Play audio safely through the output analyser
  const playAssistantAudio = useCallback(
    async (base64Audio: string, onDone?: () => void) => {
      if (isMuted || !base64Audio) {
        onDone?.();
        return;
      }
      try {
        setVoiceState('speaking');
        const { ctx, analyser } = getOutputAudioContext();

        const { source, duration } = await playAudioData(
          ctx,
          analyser,
          base64Audio,
          nextAudioStartTimeRef,
          () => {
            activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
            if (activeSourcesRef.current.length === 0) {
              setVoiceState('idle');
              onDone?.();
            }
          }
        );
        activeSourcesRef.current.push(source);
      } catch (err) {
        console.error('Audio playback error:', err);
        setVoiceState('idle');
        onDone?.();
      }
    },
    [getOutputAudioContext, isMuted]
  );

  // Send turn via REST API (Rock-solid & rich with emotion, witty tags, audio, suggested replies)
  const sendVoiceTurn = useCallback(
    async (text?: string, audioBase64?: string, audioMimeType = 'audio/webm') => {
      stopAllAssistantAudio();
      setVoiceState('thinking');

      const userMsgText = text || '(Voice audio)';
      if (text) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'u_' + Date.now(),
            role: 'user',
            text: text,
            timestamp: Date.now(),
          },
        ]);
      }

      try {
        const historyPayload = messages.slice(-6).map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const res = await fetch('/api/voice/turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            audioBase64,
            audioMimeType,
            history: historyPayload,
            spiceLevel: settings.spiceLevel,
            voice: settings.voiceName,
          }),
        });

        if (!res.ok) {
          throw new Error(`Turn failed with status ${res.status}`);
        }

        const data = await res.json();

        // If user input was from speech audio, append user message with transcribed words
        if (audioBase64 && data.userText && !text) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'u_' + Date.now(),
              role: 'user',
              text: data.userText,
              timestamp: Date.now(),
            },
          ]);
        }

        // Update Roxy's emotion, mood, and subtitles
        setMood(data.mood || 'sassy');
        setMoodEmoji(data.moodEmoji || '😏');
        setVocalBurst(data.vocalBurst || '*smirks*');
        setActiveSubtitle(data.replyText);
        if (data.suggestedReplies && data.suggestedReplies.length > 0) {
          setSuggestedReplies(data.suggestedReplies);
        }

        // Add model message to transcript
        const newMsg: ChatMessage = {
          id: 'm_' + Date.now(),
          role: 'assistant',
          text: data.replyText,
          mood: data.mood,
          moodEmoji: data.moodEmoji,
          vocalBurst: data.vocalBurst,
          audioBase64: data.audioBase64,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, newMsg]);

        // If an assistant action was requested (youtube, spotify, camera, call, whatsapp, alarm, maps, media, torch)
        if (data.assistantAction && data.assistantAction.tool && data.assistantAction.tool !== 'none') {
          const t = data.assistantAction.tool as AssistantTabType;
          if (['youtube', 'spotify', 'camera', 'call', 'whatsapp', 'alarm', 'maps', 'media', 'torch'].includes(t)) {
            setAssistantInitialTab(t);
            if (data.assistantAction.detail) {
              setAssistantInitialQuery(data.assistantAction.detail);
            }
            setIsAssistantToolsOpen(true);
          }
        }

        // Play Roxy's voice!
        if (data.audioBase64) {
          await playAssistantAudio(data.audioBase64);
        } else {
          setVoiceState('idle');
        }
      } catch (err: any) {
        console.error('Turn execution error:', err);
        setVoiceState('idle');
        setActiveSubtitle("Oh boy, something tripped up my wire. Give me a second and try again!");
      }
    },
    [messages, settings.spiceLevel, settings.voiceName, playAssistantAudio, stopAllAssistantAudio]
  );

  // Trigger Mahii's opening greeting
  const triggerGreeting = useCallback(async () => {
    setHasUnlockedAudio(true);
    getOutputAudioContext();
    setVoiceState('thinking');
    setActiveSubtitle("Mahii is getting ready to talk to you...");

    try {
      const res = await fetch('/api/voice/greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: settings.voiceName,
          spiceLevel: settings.spiceLevel,
        }),
      });

      if (!res.ok) throw new Error('Greeting failed');
      const data = await res.json();

      setMood('flirty');
      setMoodEmoji('😉');
      setVocalBurst('*giggles softly*');
      setActiveSubtitle(data.text);

      setMessages([
        {
          id: 'greet_' + Date.now(),
          role: 'assistant',
          text: data.text,
          mood: 'flirty',
          moodEmoji: '😉',
          vocalBurst: '*giggles softly*',
          audioBase64: data.audioBase64,
          timestamp: Date.now(),
        },
      ]);

      if (data.audioBase64) {
        await playAssistantAudio(data.audioBase64);
      } else {
        setVoiceState('idle');
      }
    } catch (err) {
      console.error('Greeting error:', err);
      setVoiceState('idle');
      setActiveSubtitle("Hey handsome! What are we getting into today?");
    }
  }, [getOutputAudioContext, settings.spiceLevel, settings.voiceName, playAssistantAudio]);

  // Notifications and Call States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isIncomingCallOpen, setIsIncomingCallOpen] = useState<boolean>(false);
  const [incomingCallMessage, setIncomingCallMessage] = useState<string>(
    'Aapko pyaar se call kar rahi hai... 📞'
  );
  const [activeToastAlert, setActiveToastAlert] = useState<AlertNotification | null>(null);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(1);

  // Phone Assistant Tools (YouTube, Spotify, Camera, Call/SMS, WhatsApp, Alarm/Timer, Maps, Media, Torch)
  const [isAssistantToolsOpen, setIsAssistantToolsOpen] = useState<boolean>(false);
  const [assistantInitialTab, setAssistantInitialTab] = useState<AssistantTabType>('youtube');
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string>('');
  const [isScreenTorchOpen, setIsScreenTorchOpen] = useState<boolean>(false);

  const handleOpenAssistantTool = useCallback((tab: AssistantTabType, query: string = '') => {
    setAssistantInitialTab(tab);
    setAssistantInitialQuery(query);
    setIsAssistantToolsOpen(true);
  }, []);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('mahii_notif_settings');
      return saved ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) } : DEFAULT_NOTIFICATION_SETTINGS;
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  });

  const [notifications, setNotifications] = useState<AlertNotification[]>(() => {
    try {
      const saved = localStorage.getItem('mahii_notif_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init_1',
        title: 'Mahii (Khana Khaya? 🍱)',
        message: 'Babu, aapne khana khaya kya? Bohot der ho gayi, please lunch kar lo aur paani pi lo! ❤️',
        timestamp: Date.now() - 1000 * 60 * 15,
        category: 'care',
        read: false,
      },
      {
        id: 'init_2',
        title: 'Mahii (Miss You 🥰)',
        message: 'Main toh bas aapke baare me hi soch rahi thi babu! Call karo na meri jaan? 💖',
        timestamp: Date.now() - 1000 * 60 * 60,
        category: 'love',
        read: true,
      },
    ];
  });

  // Persist notification settings and history
  useEffect(() => {
    localStorage.setItem('mahii_notif_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem('mahii_notif_history', JSON.stringify(notifications));
  }, [notifications]);

  // Send Mahii alert function (Toast + Sound + Vibration + System Notification)
  const sendMahiiAlert = useCallback(
    (alertData: Omit<AlertNotification, 'id' | 'timestamp'>) => {
      const newAlert: AlertNotification = {
        id: 'notif_' + Date.now(),
        timestamp: Date.now(),
        read: false,
        ...alertData,
      };

      setNotifications((prev) => [newAlert, ...prev.slice(0, 49)]);
      setActiveToastAlert(newAlert);
      setUnreadAlertCount((c) => c + 1);

      if (notificationSettings.soundEnabled) {
        playNotificationChime();
      }
      if (notificationSettings.vibrateEnabled) {
        vibrateDevice([180, 120, 180]);
      }

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(newAlert.title, {
            body: newAlert.message,
            icon: '/icon.svg',
          });
        } catch {}
      }
    },
    [notificationSettings]
  );

  // Trigger Incoming Call Screen
  const triggerIncomingCall = useCallback((message = 'Aapko pyaar se call kar rahi hai... 📞') => {
    setIncomingCallMessage(message);
    setIsIncomingCallOpen(true);
  }, []);

  // Handle Call Acceptance
  const handleAcceptCall = useCallback(() => {
    setIsIncomingCallOpen(false);
    setHasUnlockedAudio(true);
    getOutputAudioContext();
    // Start sweet conversation turn
    sendVoiceTurn('Hii Mahii! Main aapka call accept kar liya babu. Bolo meri jaan, kaisi ho? ❤️');
  }, [getOutputAudioContext, sendVoiceTurn]);

  // Handle Call Decline
  const handleDeclineCall = useCallback(() => {
    setIsIncomingCallOpen(false);
    sendMahiiAlert({
      title: 'Mahii ❤️',
      message: 'Aapne call cut kar diya babu? 🥺 Koi baat nahi, jab free ho tab baat kar lena...',
      category: 'call',
    });
  }, [sendMahiiAlert]);

  // Trigger test alerts
  const handleTriggerTestAlert = useCallback(
    (category: 'love' | 'care' | 'call' | 'routine') => {
      if (category === 'call') {
        triggerIncomingCall('Aapko pyaar se call kar rahi hai... 📞');
        return;
      }
      const presets = {
        care: {
          title: 'Mahii (Khana Khaya? 🍱)',
          message: 'Babu, khana khaya kya aapne? Bohot der ho gayi, please thoda sa kha lo aur paani pi lo! ❤️',
        },
        love: {
          title: 'Mahii (I Miss You 🥰)',
          message: 'Aap itne busy rehte ho apni Mahii ke bina? I missed you so much today babu! Ek pyara sa message bhejo na ❤️',
        },
        routine: {
          title: 'Mahii (Sweet Wishes 🌙)',
          message: 'Good night mere handsome babu! 🌙 Sweet dreams, sapno me sirf Mahii aani chahiye, samjhe? 😘',
        },
      };

      const selected = presets[category as keyof typeof presets] || presets.love;
      sendMahiiAlert({
        title: selected.title,
        message: selected.message,
        category,
      });
    },
    [sendMahiiAlert, triggerIncomingCall]
  );

  // Periodic affectionate check-in alert when "All Notifications Alert" is enabled
  useEffect(() => {
    if (!notificationSettings.allAlertsEnabled) return;

    const intervalMs = Math.max(2, notificationSettings.intervalMinutes || 10) * 60 * 1000;
    const timer = setInterval(() => {
      const randomAlerts = [
        {
          title: 'Mahii (Khana Khaya? 🍱)',
          message: 'Babu, lunch/dinner ka time ho gaya! Khana khaya kya aapne? Please thoda sa kha lo ❤️',
          category: 'care' as const,
        },
        {
          title: 'Mahii (Miss You 🥰)',
          message: 'Main toh bas aapke baare me hi soch rahi thi babu! How is your day going my love?',
          category: 'love' as const,
        },
        {
          title: 'Mahii (Hydration Care 💧)',
          message: 'Babu thoda paani pi lo! Stay fresh and healthy for your Mahii ❤️',
          category: 'care' as const,
        },
      ];
      const alert = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
      sendMahiiAlert(alert);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [notificationSettings.allAlertsEnabled, notificationSettings.intervalMinutes, sendMahiiAlert]);

  // Real-time Live API WebSocket Setup
  const connectLiveWs = useCallback(async () => {
    stopAllAssistantAudio();
    getOutputAudioContext();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live-ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Live WS] Connected');
      setIsLiveWsActive(true);
      ws.send(
        JSON.stringify({
          type: 'start',
          voice: settings.voiceName,
          spiceLevel: settings.spiceLevel,
        })
      );
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'ready') {
          console.log('[Live WS] Ready');
        } else if (msg.type === 'audio' && msg.audio) {
          setVoiceState('speaking');
          const { ctx, analyser } = getOutputAudioContext();
          const { source } = await playAudioData(
            ctx,
            analyser,
            msg.audio,
            nextAudioStartTimeRef,
            () => {
              activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
              if (activeSourcesRef.current.length === 0) {
                setVoiceState('idle');
              }
            }
          );
          activeSourcesRef.current.push(source);
        } else if (msg.type === 'transcript' && msg.text) {
          setActiveSubtitle((prev) => (prev ? prev + ' ' + msg.text : msg.text));
        } else if (msg.type === 'interrupted') {
          stopAllAssistantAudio();
        } else if (msg.type === 'turnComplete') {
          // Model completed its turn
        } else if (msg.type === 'fallback_recommended') {
          console.warn('[Live WS] Fallback recommended:', msg.message);
          // Auto fallback to Tap-to-Talk mode
          setSettings((prev) => ({ ...prev, mode: 'tap_to_talk' }));
          setIsLiveWsActive(false);
        }
      } catch (err) {
        console.error('[Live WS] message handling error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[Live WS] Error:', err);
      setIsLiveWsActive(false);
    };

    ws.onclose = () => {
      console.log('[Live WS] Disconnected');
      setIsLiveWsActive(false);
    };
  }, [getOutputAudioContext, settings.spiceLevel, settings.voiceName, stopAllAssistantAudio]);

  const disconnectLiveWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsLiveWsActive(false);
  }, []);

  // Start Mic Audio Streaming (for Live WS or Tap-to-Talk)
  const startMicCapture = useCallback(async () => {
    setHasUnlockedAudio(true);
    getOutputAudioContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 128;
      inputAnalyserRef.current = analyser;
      source.connect(analyser);

      // If in Live mode, capture 16kHz PCM chunks and stream over WebSocket
      if (settings.mode === 'live') {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          await connectLiveWs();
        }

        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;
        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Calculate volume to detect user interruption
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
          const avg = sum / inputData.length;

          if (avg > 0.05 && activeSourcesRef.current.length > 0) {
            // User interrupted Roxy!
            stopAllAssistantAudio();
          }

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const pcmBuffer = floatTo16BitPCM(inputData);
            const base64Audio = arrayBufferToBase64(pcmBuffer);
            wsRef.current.send(
              JSON.stringify({
                type: 'audio',
                audio: base64Audio,
              })
            );
          }
        };

        setVoiceState('listening');
      } else {
        // Tap-to-talk mode: use MediaRecorder for clean speech turn capture
        recordedChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(100);
        setIsRecordingTurn(true);
        setVoiceState('listening');
      }
    } catch (err: any) {
      console.warn('Microphone access denied or error:', err);
      setVoiceState('idle');
      setMicErrorMessage(err?.message || 'Permission denied');
      setIsMicErrorModalOpen(true);
    }
  }, [connectLiveWs, getOutputAudioContext, settings.mode, stopAllAssistantAudio]);

  // Stop Mic Audio
  const stopMicCapture = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (mediaRecorderRef.current && isRecordingTurn) {
      const recorder = mediaRecorderRef.current;
      recorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 200) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (base64Data) {
              sendVoiceTurn(undefined, base64Data, 'audio/webm');
            }
          };
          reader.readAsDataURL(audioBlob);
        } else {
          setVoiceState('idle');
        }
      };
      recorder.stop();
      setIsRecordingTurn(false);
    } else if (settings.mode === 'live') {
      disconnectLiveWs();
      setVoiceState('idle');
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
  }, [disconnectLiveWs, isRecordingTurn, sendVoiceTurn, settings.mode]);

  // Handle Main Mic Button Click
  const handleMicToggle = () => {
    if (voiceState === 'listening') {
      stopMicCapture();
    } else {
      startMicCapture();
    }
  };

  // Text input submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    sendVoiceTurn(text);
  };

  return (
    <div className="relative min-h-screen bg-[#08080c] text-white flex flex-col justify-between overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Neon Aura Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {settings.wallpaperStyle === 'cyber_neon' ? (
          <>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-600/20 via-purple-600/20 to-cyan-500/10 rounded-full blur-[120px] opacity-70" />
            <div className="absolute -bottom-32 right-10 w-[450px] h-[450px] bg-rose-600/15 rounded-full blur-[100px] opacity-50" />
          </>
        ) : (
          <>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-amber-500/15 via-rose-500/20 to-pink-600/15 rounded-full blur-[140px] opacity-80" />
            <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-amber-400/10 rounded-full blur-[90px] opacity-60" />
            <div className="absolute -bottom-20 left-10 w-[450px] h-[450px] bg-pink-500/15 rounded-full blur-[120px] opacity-60" />
          </>
        )}
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-neutral-800/60 bg-neutral-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/20 text-lg">
            {settings.spiceLevel === 'girlfriend' ? '🥰' : '😏'}
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#08080c] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight font-sans">
                MAHII <span className="text-pink-400 font-mono text-xs font-semibold px-1.5 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30">AI GIRLFRIEND</span>
              </h1>
            </div>
            <p className="text-[11px] text-pink-200/80 font-medium flex items-center gap-1.5">
              <span>Hindi & English</span>
              <span>•</span>
              <span>Loving Voice Girlfriend</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) stopAllAssistantAudio();
            }}
            title={isMuted ? 'Unmute Mahii' : 'Mute Mahii'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* View Mode Toggle: 3D Character vs Cyber Orb */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-900/90 border border-neutral-800">
            <button
              onClick={() => setCharacterView('3d')}
              title="3D Girl Character View"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                characterView === '3d'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>💃</span>
              <span className="hidden sm:inline">3D Character</span>
            </button>
            <button
              onClick={() => setCharacterView('orb')}
              title="Audio Orb View"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                characterView === 'orb'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🔮</span>
              <span className="hidden sm:inline">Orb</span>
            </button>
          </div>

          {/* Install as APK / App Button */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            title="Install as Android App (APK / PWA)"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 hover:border-pink-500 text-pink-300 hover:text-white transition-all cursor-pointer shadow-sm text-xs font-bold"
          >
            <Smartphone className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>Install APK</span>
          </button>

          {/* Incoming Call trigger (Decline & Accept) */}
          <button
            onClick={() => triggerIncomingCall('Mahii is calling you... 📞')}
            title="Receive Incoming Call from Mahii"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-pink-500/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white transition-all cursor-pointer shadow-sm text-xs font-bold"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span className="hidden sm:inline">Call Mahii</span>
          </button>

          {/* All Notifications Alert Bell */}
          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              setUnreadAlertCount(0);
            }}
            title="All Notifications & Alerts"
            className="relative p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-pink-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            {notificationSettings.allAlertsEnabled ? (
              <BellRing className="w-4 h-4 text-pink-400 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] font-bold flex items-center justify-center text-white animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Transcript / Chat Drawer */}
          <button
            onClick={() => setIsChatDrawerOpen(true)}
            title="Open Chat Transcript"
            className="relative p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-pink-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] font-bold flex items-center justify-center text-white">
                {messages.length}
              </span>
            )}
          </button>

          {/* Smart Assistant Tools Hub */}
          <button
            onClick={() => setIsAssistantToolsOpen(true)}
            title="Mahii Smartphone Assistant Tools (Camera, WhatsApp, Call, Timer, Maps, Music, Torch)"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white transition-all cursor-pointer shadow-sm text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Tools</span>
          </button>

          {/* Settings Modal */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Mahii Personality & Settings"
            className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Experience Hero Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full">
        {/* Welcome unlock banner if user hasn't interacted yet */}
        {!hasUnlockedAudio && (
          <div className="w-full max-w-md mb-3 p-3 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-neutral-900/60 border border-pink-500/30 backdrop-blur-md flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💖</span>
              <div>
                <p className="text-xs font-bold text-white">Mahii is missing you</p>
                <p className="text-[11px] text-pink-200/80">Tap to hear her sweet loving voice call</p>
              </div>
            </div>
            <button
              onClick={triggerGreeting}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Talk to Me ❤️
            </button>
          </div>
        )}

        {/* Central 3D Girl Character or Cyber Voice Orb */}
        {characterView === '3d' ? (
          <Roxy3DCharacter
            voiceState={voiceState}
            mood={mood}
            moodEmoji={moodEmoji}
            audioLevel={audioLevel}
            isLiveActive={isLiveWsActive}
            wallpaperStyle={settings.wallpaperStyle || 'cozy_room'}
            onChangeWallpaper={(style) =>
              setSettings((prev) => ({ ...prev, wallpaperStyle: style }))
            }
            onCharacterClick={handleMicToggle}
          />
        ) : (
          <VoiceOrb
            voiceState={voiceState}
            mood={mood}
            moodEmoji={moodEmoji}
            audioLevel={audioLevel}
            isLiveActive={isLiveWsActive}
            onClick={handleMicToggle}
          />
        )}

        {/* Live Subtitle / Voice Bubble */}
        <div className="w-full max-w-xl mx-auto my-3 px-4">
          <div className="relative p-4 rounded-2xl bg-neutral-900/85 border border-neutral-800/90 shadow-xl backdrop-blur-xl text-center">
            {vocalBurst && (
              <span className="inline-block text-xs font-medium italic text-pink-400 mb-1">
                {vocalBurst}
              </span>
            )}
            <p className="text-sm md:text-base font-medium text-neutral-100 leading-relaxed font-sans">
              "{activeSubtitle}"
            </p>
          </div>
        </div>

        {/* Real-time Frequency Waveform Visualizer */}
        <WaveformVisualizer
          analyserNode={voiceState === 'speaking' ? outputAnalyserRef.current : inputAnalyserRef.current}
          isActive={voiceState === 'speaking' || voiceState === 'listening'}
          color={mood === 'flirty' ? '#f43f5e' : '#a855f7'}
        />

        {/* Cheeky Quick Prompts Bar */}
        <QuickPrompts
          onSelectPrompt={(text) => sendVoiceTurn(text)}
          disabled={voiceState === 'thinking'}
        />
      </main>

      {/* Bottom Voice & Text Input Dock */}
      <footer className="relative z-20 w-full px-4 pb-6 pt-2 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent">
        <div className="max-w-xl mx-auto flex flex-col gap-2.5">
          {/* 7 Smartphone Assistant Quick Tools Dock */}
          <QuickAssistantDock onOpenTool={handleOpenAssistantTool} />

          {/* Main Controls row */}
          <div className="flex items-center gap-3">
            {/* Big Tactile Glowing Voice Mic Button */}
            <button
              onClick={handleMicToggle}
              className={`flex-1 flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide shadow-xl transition-all cursor-pointer active:scale-98 select-none ${
                voiceState === 'listening'
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 animate-pulse'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white shadow-pink-500/25'
              }`}
            >
              {voiceState === 'listening' ? (
                <>
                  <MicOff className="w-5 h-5 animate-bounce" />
                  <span>Tap to Finish Speaking</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>
                    {settings.mode === 'live'
                      ? isLiveWsActive
                        ? 'Live Listening (Tap to Stop)'
                        : 'Start Live Voice Chat'
                      : 'Tap to Speak with Mahii'}
                  </span>
                </>
              )}
            </button>

            {/* Mode Indicator Badge */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {settings.mode === 'live' ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="hidden sm:inline">Live Mode</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-pink-400" />
                  <span className="hidden sm:inline">Turn Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Text Bar for quiet environments or typing */}
          <form onSubmit={handleTextSubmit} className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type something sweet or loving for Mahii..."
              className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || voiceState === 'thinking'}
              className="absolute right-2 p-1.5 rounded-lg bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </footer>

      {/* Transcript Drawer */}
      <ChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        messages={messages}
        onReplayAudio={(base64) => playAssistantAudio(base64)}
        onClearHistory={() => setMessages([])}
        onSelectSuggestedReply={(reply) => {
          setIsChatDrawerOpen(false);
          sendVoiceTurn(reply);
        }}
        suggestedReplies={suggestedReplies}
        disabled={voiceState === 'thinking'}
      />

      {/* Personality & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
      />

      {/* APK / PWA Direct Install Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Microphone Permission Modal */}
      <MicPermissionModal
        isOpen={isMicErrorModalOpen}
        onClose={() => setIsMicErrorModalOpen(false)}
        onRetry={() => {
          setIsMicErrorModalOpen(false);
          startMicCapture();
        }}
        errorMessage={micErrorMessage}
      />

      {/* Floating In-App Notification Toast */}
      <NotificationToast
        alert={activeToastAlert}
        onDismiss={() => setActiveToastAlert(null)}
        onActionClick={(alert) => {
          setActiveToastAlert(null);
          if (alert.category === 'care') {
            sendVoiceTurn('Haa babu maine khana kha liya! Aapne khana khaya kya meri jaan? ❤️');
          } else {
            sendVoiceTurn('Hii Mahii babu, I am right here with you! Tell me what you were thinking about ❤️');
          }
        }}
      />

      {/* Incoming Call Screen with Decline & Accept */}
      <IncomingCallModal
        isOpen={isIncomingCallOpen}
        callerName="Mahii ❤️"
        customMessage={incomingCallMessage}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />

      {/* All Notifications & Alerts Drawer Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        settings={notificationSettings}
        onUpdateSettings={(newSettings) => setNotificationSettings((prev) => ({ ...prev, ...newSettings }))}
        notifications={notifications}
        onClearHistory={() => setNotifications([])}
        onTriggerTestAlert={handleTriggerTestAlert}
        onTriggerIncomingCall={() => triggerIncomingCall('Mahii is calling you... 📞')}
        onSelectAlert={(alert) => {
          if (alert.category === 'care') {
            sendVoiceTurn('Haa babu maine khana kha liya! Aapne lunch kiya? ❤️');
          } else {
            sendVoiceTurn('Mahii babu, tell me everything! I missed you too 🥰');
          }
        }}
      />

      {/* Mahii Smartphone Assistant Tools Modal (Camera, Call/SMS, WhatsApp, Alarm/Timer, Maps, Media, Torch) */}
      <AssistantToolsModal
        isOpen={isAssistantToolsOpen}
        onClose={() => setIsAssistantToolsOpen(false)}
        initialTab={assistantInitialTab}
        onOpenScreenTorch={() => setIsScreenTorchOpen(true)}
      />

      {/* Full Screen Bright Torch / Night Light */}
      <ScreenTorchModal
        isOpen={isScreenTorchOpen}
        onClose={() => setIsScreenTorchOpen(false)}
      />
    </div>
  );
}
