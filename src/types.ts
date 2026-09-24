export type SpiceLevel = 'girlfriend' | 'chill' | 'sassy' | 'queen';

export type VoiceMode = 'live' | 'push_to_talk' | 'tap_to_talk';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type AssistantMood =
  | 'flirty'
  | 'teasing'
  | 'sassy'
  | 'amused'
  | 'impressed'
  | 'thoughtful'
  | 'caring'
  | 'dramatic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  mood?: AssistantMood;
  moodEmoji?: string;
  vocalBurst?: string;
  audioBase64?: string | null;
  timestamp: number;
}

export type WallpaperStyle = 'cozy_room' | 'cyber_neon';

export interface VoiceSettings {
  spiceLevel: SpiceLevel;
  voiceName: string;
  mode: VoiceMode;
  autoGreeting: boolean;
  soundEffects: boolean;
  wallpaperStyle?: WallpaperStyle;
}
