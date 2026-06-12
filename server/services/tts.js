import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Warm, natural narrator voice from Microsoft Edge's free neural TTS.
const STORY_VOICE = 'en-US-AriaNeural';

export async function synthesizeSpeech(text, { voice = STORY_VOICE, rate = '-10%' } = {}) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const result = tts.toStream(text, { rate });
  const stream = result.audioStream || result;
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
