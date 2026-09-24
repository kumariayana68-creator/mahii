/**
 * Audio processing utilities for real-time voice capture, visualizer analysis,
 * and 24kHz PCM / WebM / WAV audio playback.
 */

export function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    // 16-bit signed integer
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Checks whether the base64 audio data is a WAV/RIFF container or raw PCM.
 */
export function isRiffOrWav(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer);
  // 'R' 'I' 'F' 'F'
  return bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70;
}

/**
 * Plays base64 audio seamlessly through an AudioContext with an AnalyserNode
 * for reactive visualization, supporting both raw PCM (24kHz) and decoded audio.
 */
export async function playAudioData(
  audioCtx: AudioContext,
  analyser: AnalyserNode,
  base64Data: string,
  startTimeRef?: { current: number },
  onEnded?: () => void
): Promise<{ source: AudioBufferSourceNode; duration: number }> {
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const arrayBuffer = base64ToArrayBuffer(base64Data);
  let audioBuffer: AudioBuffer;

  if (isRiffOrWav(arrayBuffer)) {
    // Standard audio container (WAV, MP3, etc.)
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  } else {
    // Raw 16-bit PCM little-endian at 24kHz (standard Gemini TTS / Live output)
    const int16 = new Int16Array(arrayBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
    audioBuffer.copyToChannel(float32, 0);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  let start = audioCtx.currentTime;
  if (startTimeRef) {
    start = Math.max(audioCtx.currentTime, startTimeRef.current);
    startTimeRef.current = start + audioBuffer.duration;
  }

  source.start(start);
  if (onEnded) {
    source.onended = onEnded;
  }

  return { source, duration: audioBuffer.duration };
}
