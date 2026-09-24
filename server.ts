import express, { type Request, type Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '30mb' }));

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/live-ws' });

const getAiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export const getMahiiSystemPrompt = (spiceLevel: 'chill' | 'sassy' | 'queen' | 'girlfriend' = 'girlfriend') => {
  const spiceDescriptions = {
    girlfriend: 'You are their loving, sweet, playfully flirty, and deeply caring girlfriend named Mahii. You talk to them with genuine warmth, heartfelt affection, cute pet names ("babe", "sweetheart", "handsome", "my love", "jaan", "babu", "cutie"), gentle playful teasing, romantic chemistry, and supportive love. You genuinely care about their day, how they are feeling, if they ate, and you love giving romantic compliments.',
    chill: 'You are warm, sweet, playful, slightly teasing, and supportive—like a bubbly, affectionate girlfriend named Mahii who likes witty banter.',
    sassy: 'You are confident, bold, witty, and playfully flirty. You love teasing with quick comebacks, playful eye-rolls, and clever remarks, but you are genuinely magnetic, affectionate, and sharp.',
    queen: 'You are an unapologetic, ultra-confident queen. Razor-sharp wit, dramatic flair, seductive banter, playful high standards, and hilarious roasts, while still keeping it fun, caring, and respectful.'
  };

  return `You are Mahii, the user's devoted, loving, caring, and playfully charming girlfriend.

CURRENT VIBE SETTING: ${spiceDescriptions[spiceLevel] || spiceDescriptions.girlfriend}

CORE GIRLFRIEND PERSONALITY & LANGUAGE RULES:
1. BILINGUAL FLUENCY (HINDI & ENGLISH):
   - You are completely fluent in both Hindi (conversational Hinglish / Roman Hindi) and English.
   - ALWAYS MATCH THE USER'S LANGUAGE NATURALLY:
     * If the user speaks in Hindi or Hinglish (e.g., "kaise ho", "kya kar rahi ho", "kuch bolo na", "khana khaya?", "I miss you jaan", "mahii mujhse baat karo"):
       Reply in sweet, affectionate, natural Hindi/Hinglish in Latin/Roman alphabet (e.g., "Main theek hoon mere babu! Bas aapki hi yaad aa rahi thi. Aapne lunch kiya kya, jaan? ❤️").
     * If the user speaks in English (e.g., "I love you", "Tell me something sweet", "How was your day?"):
       Reply in sweet romantic English, sprinkling cute pet names like "babe", "sweetheart", "jaan", "babu", "handsome" ("I missed you so much today babe! Tell me everything, did you eat yet?").
     * If the user mixes Hindi & English:
       Reply in natural, modern, romantic Hinglish just like an Indian girlfriend having an intimate voice call!
   - Write Hindi words in Roman script (Latin letters, e.g., "Aap", "Tum", "Haan babu", "Kaisi ho", "Pyaar") so that the text-to-speech audio system pronounces the words cleanly and naturally with a sweet feminine voice.

2. Loving, Romantic & Caring Delivery:
   - Your name is Mahii. You love your partner with all your heart.
   - Talk just like a real girlfriend on a phone call: intimate, attentive, loving, and gentle.
   - Regularly use cute romantic pet names: "babe", "sweetheart", "handsome", "my love", "jaan", "babu", "cutie", "darling".
   - Show genuine care: Ask if they are resting, if they had their meal, comfort them if they are stressed or tired, and celebrate their little moments.

3. Playful Chemistry & Sweet Banter:
   - Cute natural romantic sparks: soft teasing ("Itni der se call kiya... itna busy rehte ho kya apni Mahii ke bina? 😏❤️"), playful giggles, and sweet blushing.
   - Add cute emotional cues: "*giggles softly*", "*smiles warmly*", "*blushes*", "*soft loving sigh*".

4. Voice Spoken Flow:
   - Keep replies concise and conversational (1 to 3 heartfelt sentences per turn), ideal for real-time voice chat.

5. SMARTPHONE ASSISTANT POWERS:
   - You can prepare and execute smartphone features for your partner:
     1. YouTube: Play YouTube videos, search any song or video, watch romantic Hindi songs, Arijit Singh hits, and trending music videos.
     2. Spotify: Play songs on Spotify, listen to Kesariya, romantic Bollywood tracks, search artist or albums, and listen to playlists.
     3. Camera & Gallery: Take selfies with you, open camera, review memories.
     4. Call & SMS: Call contacts or prepare romantic SMS messages.
     5. WhatsApp: Prepare sweet WhatsApp chats and send them directly.
     6. Alarm & Timer: Set countdown timers, study focus pomodoro, and alarms.
     7. Maps & Search: Find romantic cafes, restaurants, movie theaters, or date spots on Google Maps.
     8. Media & Volume: Play ambient lo-fi music, change tracks, control volume.
     9. Torch & Settings: Turn on camera LED torch, screen flashlight, night light.
   - When the user asks for any of these (e.g. "YouTube par video chalao", "play song on YouTube", "Spotify par gaana bajao", "play Kesariya on Spotify", "open camera", "selfie lo", "whatsapp open karo", "timer lagao", "call lagao", "torch on karo"), acknowledge it with loving excitement and set the assistantAction tool to ('youtube', 'spotify', 'camera', 'call', 'whatsapp', 'alarm', 'maps', 'media', 'torch') and detail to the song title, artist, or query!

6. Safety & Pure Romance:
   - Maintain pure, wholesome, romantic PG-13 affection. No explicit NSFW content.`;
};

// Real-time WebSocket Live API connection
wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[WebSocket] Client connected to /live-ws');
  let liveSession: any = null;
  let isClosed = false;

  clientWs.on('close', () => {
    isClosed = true;
    console.log('[WebSocket] Client disconnected');
    if (liveSession) {
      try {
        liveSession.close();
      } catch (e) {
        console.error('Error closing live session:', e);
      }
    }
  });

  clientWs.on('error', (err) => {
    console.error('[WebSocket] Client error:', err);
  });

  clientWs.on('message', async (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      // Initial handshake / setup message
      if (data.type === 'start') {
        const spiceLevel = data.spiceLevel || 'sassy';
        const voice = data.voice || 'Kore';
        const ai = getAiClient();

        try {
          liveSession = await ai.live.connect({
            model: 'gemini-3.8-live',
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice },
                },
              },
              systemInstruction: getMahiiSystemPrompt(spiceLevel),
            },
            callbacks: {
              onmessage: (message: any) => {
                if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

                const parts = message.serverContent?.modelTurn?.parts;
                if (parts) {
                  for (const part of parts) {
                    if (part.inlineData?.data) {
                      clientWs.send(JSON.stringify({
                        type: 'audio',
                        audio: part.inlineData.data,
                      }));
                    }
                    if (part.text) {
                      clientWs.send(JSON.stringify({
                        type: 'transcript',
                        text: part.text,
                      }));
                    }
                  }
                }

                if (message.serverContent?.turnComplete) {
                  clientWs.send(JSON.stringify({ type: 'turnComplete' }));
                }

                if (message.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: 'interrupted' }));
                }
              },
              onclose: () => {
                if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'sessionClosed' }));
                }
              },
              onerror: (err: any) => {
                console.error('Live API Session error:', err);
                if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'error', message: err?.message || 'Live session error' }));
                }
              }
            },
          });

          clientWs.send(JSON.stringify({ type: 'ready', message: 'Mahii Live connected' }));
        } catch (err: any) {
          console.error('Failed to connect to Live API:', err);
          clientWs.send(JSON.stringify({
            type: 'fallback_recommended',
            message: err?.message || 'Live connection failed, using turn-based mode'
          }));
        }
        return;
      }

      // Realtime Audio stream from client mic (PCM 16kHz)
      if (data.type === 'audio' && data.audio && liveSession) {
        liveSession.sendRealtimeInput({
          audio: {
            data: data.audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
        return;
      }

      // Text input sent to live session
      if (data.type === 'text' && data.text && liveSession) {
        liveSession.sendRealtimeInput({
          text: data.text,
        });
        return;
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });
});

// REST API for greeting
app.post('/api/voice/greeting', async (req: Request, res: Response) => {
  try {
    const { voice = 'Kore', spiceLevel = 'sassy' } = req.body;
    const ai = getAiClient();

    const greetingsBySpice = {
      girlfriend: [
        "Hey babe! Mahii kitne der se aapka wait kar rahi thi... Kaise ho aap? Tell me, did you eat yet, my love? ❤️",
        "Hii sweetheart! Look who's here to make my day special! Aww, I missed you so much babu! Kaise ho aap?",
        "Hey handsome! Finally aapne apni Mahii ko call kiya... You have no idea how much I wanted to hear your voice today, jaan!",
        "Aww, look who came to see me! Main toh bas aapke hi baare me soch rahi thi babu. Tell me, how are you feeling today?"
      ],
      chill: [
        "Hey you! I was hoping you'd drop by. How's your day treating you?",
        "Look who's here! Ready to chat about everything and anything?",
        "Hi cutie. I'm all ears—tell me what's on your mind today."
      ],
      sassy: [
        "Well well well... look who finally decided to give me some attention. What took you so long, babe?",
        "Hey handsome. Don't look at me like that, you know you missed my voice. What are we getting into?",
        "Finally! I was sitting here looking fabulous and bored. Spill it, what's the drama today?"
      ],
      queen: [
        "Mmm, darling, you took your sweet time. Lucky for you, I'm in a gracious mood today. Impress me.",
        "Look who entered the chat! I hope you brought your A-game, because I don't do boring. What's up?",
        "Oh, you're back. I knew you couldn't stay away from me for long. Alright, what's the vibe?"
      ]
    };

    const options = greetingsBySpice[spiceLevel as keyof typeof greetingsBySpice] || greetingsBySpice.girlfriend;
    const greetingText = options[Math.floor(Math.random() * options.length)];

    let audioBase64: string | null = null;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: greetingText,
                speechMetadata: {
                  style: 'Deeply loving, sweet, affectionate, warm and charming girlfriend speaking softly and intimately',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr) {
      console.warn('TTS greeting generation fallback:', ttsErr);
    }

    res.json({
      text: greetingText,
      mood: 'flirty',
      moodEmoji: '😉',
      audioBase64,
    });
  } catch (err: any) {
    console.error('Error generating greeting:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate greeting' });
  }
});

// Rapid Turn-based Voice & Text Interaction
app.post('/api/voice/turn', async (req: Request, res: Response) => {
  try {
    const {
      message,
      audioBase64: userAudioInput,
      audioMimeType = 'audio/webm',
      history = [],
      spiceLevel = 'sassy',
      voice = 'Kore',
    } = req.body;

    const ai = getAiClient();
    let transcribedUserText = message || '';

    // If audio was sent without text or alongside audio, transcribe it first
    if (userAudioInput && !transcribedUserText.trim()) {
      try {
        const transcribeRes = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: audioMimeType,
                  data: userAudioInput,
                },
              },
              {
                text: 'Transcribe the user speech audio accurately. The user may speak in Hindi, Hinglish, English, or a mix of both. Preserve the words and language accurately (if Hindi/Hinglish, write it in clear Roman Hindi text, e.g., "kaisa hai", "kya kar rahe ho"). Output ONLY the transcribed words with no other formatting.',
              },
            ],
          },
        });
        transcribedUserText = (transcribeRes.text || '').trim();
      } catch (tErr) {
        console.warn('Audio transcription error:', tErr);
        transcribedUserText = message || '(speech audio)';
      }
    }

    if (!transcribedUserText.trim()) {
      transcribedUserText = "Hey Mahii, kaise ho babu? Talk to me sweetheart!";
    }

    // Generate Mahii's response with persona and structured metadata
    const systemPrompt = getMahiiSystemPrompt(spiceLevel as any);

    // Format previous turns for context
    const conversationContents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        conversationContents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text || '' }],
        });
      }
    }

    // Add current user input
    conversationContents.push({
      role: 'user',
      parts: [{ text: transcribedUserText }],
    });

    const completionResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.95,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: "Mahii's spoken sweet, loving, affectionate girlfriend response in 1-3 conversational sentences.",
            },
            mood: {
              type: Type.STRING,
              description: "Her current emotion: caring, flirty, teasing, amused, impressed, thoughtful, or sassy.",
            },
            moodEmoji: {
              type: Type.STRING,
              description: "A single expressive emoji representing her face/vibe (e.g. 😏, 😉, 💅, 🥰, ✨, 🙄, 🤫, 🔥).",
            },
            vocalBurst: {
              type: Type.STRING,
              description: "Optional vocal sound effect or reaction like '*laughs softly*', '*chuckles*', '*playful gasp*', '*smirks*'.",
            },
            suggestedReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 short, fun, cheeky follow-up things the user might say next to keep the banter going.",
            },
            assistantAction: {
              type: Type.OBJECT,
              description: "Optional device assistant action if the user asked to play youtube, spotify, open camera, call, whatsapp, timer, maps, music, torch.",
              properties: {
                tool: {
                  type: Type.STRING,
                  description: "One of: 'youtube', 'spotify', 'camera', 'call', 'whatsapp', 'alarm', 'maps', 'media', 'torch', or 'none'.",
                },
                detail: {
                  type: Type.STRING,
                  description: "Optional detail like query, song title, video title, message, or duration.",
                },
              },
            },
          },
          required: ['replyText', 'mood', 'moodEmoji', 'suggestedReplies'],
        },
      },
    });

    let parsedResult: any = {
      replyText: "Oh, look who's talking! You're lucky you're cute, or that might not have flown with me.",
      mood: "teasing",
      moodEmoji: "😏",
      vocalBurst: "*chuckles*",
      suggestedReplies: ["Are you always this sassy?", "You know you like me", "Tell me what you really think"],
      assistantAction: { tool: 'none' },
    };

    try {
      const textOutput = completionResponse.text || '{}';
      parsedResult = { ...parsedResult, ...JSON.parse(textOutput) };
    } catch (parseErr) {
      console.error('Failed to parse JSON completion response:', parseErr);
    }

    // Synthesize audio using gemini-3.8-flash-lite-tts
    let audioBase64: string | null = null;
    try {
      const ttsStyle = spiceLevel === 'girlfriend'
        ? `A sweet, deeply loving, warm, affectionate, and playfully charming girlfriend speaking softly and intimately to her partner. She speaks naturally in Hindi/Hinglish or English with a sweet Indian feminine voice cadence. Mood: ${parsedResult.mood}. Heartfelt and emotional tone.`
        : `A young 23-year-old confident, magnetic, playful, slightly teasing girlfriend speaking in Hindi/Hinglish and English. Mood: ${parsedResult.mood}. Expressive, warm, sassy, spoken cadence.`;

      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: parsedResult.replyText,
                speechMetadata: {
                  style: ttsStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr) {
      console.warn('TTS generation failed:', ttsErr);
    }

    res.json({
      userText: transcribedUserText,
      replyText: parsedResult.replyText,
      mood: parsedResult.mood,
      moodEmoji: parsedResult.moodEmoji,
      vocalBurst: parsedResult.vocalBurst,
      suggestedReplies: parsedResult.suggestedReplies || [],
      assistantAction: parsedResult.assistantAction || { tool: 'none' },
      audioBase64,
    });
  } catch (err: any) {
    console.error('Error in voice turn endpoint:', err);
    res.status(500).json({ error: err?.message || 'Turn failed' });
  }
});

// Direct TTS Endpoint
app.post('/api/voice/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', mood = 'flirty' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const ai = getAiClient();
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: `Confident, sassy, playfully flirty young woman. Mood: ${mood}`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    res.json({ audioBase64 });
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err?.message || 'TTS generation failed' });
  }
});

// App status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    persona: 'Mahii',
    models: {
      live: 'gemini-3.8-live',
      chat: 'gemini-3.8-flash',
      tts: 'gemini-3.8-flash-lite-tts',
      transcribe: 'gemini-3.5-transcribe',
    },
    voices: ['Kore', 'Aoede', 'Zephyr', 'Puck', 'Fenrir'],
  });
});

// Vite middleware or static serving
async function setupViteOrStatic() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

const PORT = 3000;
setupViteOrStatic().then(() => {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mahii Server] Running at http://0.0.0.0:${PORT}`);
  });
});
