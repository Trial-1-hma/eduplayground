import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../config';

// Plays a list of text chunks through the server's neural TTS, highlighting the
// current chunk via readingIndex. Falls back to the browser's built-in voice if
// the neural endpoint is unavailable.
export function useReadAloud({ voice, rate } = {}) {
  const [readingState, setReadingState] = useState('idle'); // idle | reading | paused
  const [readingIndex, setReadingIndex] = useState(-1);
  const [readError, setReadError] = useState('');

  const cancelledRef = useRef(false);
  const audioRef = useRef(null);
  const cacheRef = useRef(new Map());
  const modeRef = useRef('neural');
  const settingsRef = useRef({ voice, rate });
  settingsRef.current = { voice, rate };

  const haltPlayback = () => {
    cancelledRef.current = true;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
    }
    window.speechSynthesis?.cancel();
  };

  const clearCache = () => {
    cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    cacheRef.current.clear();
  };

  const stop = () => {
    haltPlayback();
    setReadingState('idle');
    setReadingIndex(-1);
  };

  // Stop and drop cached audio — call when the text content changes.
  const reset = () => {
    stop();
    clearCache();
  };

  useEffect(() => () => {
    haltPlayback();
    clearCache();
  }, []);

  const fetchChunkAudio = async (chunks, index) => {
    if (cacheRef.current.has(index)) return cacheRef.current.get(index);
    const res = await fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunks[index], ...settingsRef.current }),
    });
    if (!res.ok) throw new Error('Speech synthesis failed.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    cacheRef.current.set(index, url);
    return url;
  };

  const pickBrowserVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const english = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    return (
      english.find((v) => /natural|neural/i.test(v.name))
      || english.find((v) => /google/i.test(v.name))
      || english[0]
      || null
    );
  };

  const speakChunkBrowser = (chunks, index) => {
    if (cancelledRef.current || index >= chunks.length) {
      if (!cancelledRef.current) {
        setReadingState('idle');
        setReadingIndex(-1);
      }
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = 0.9;
    const browserVoice = pickBrowserVoice();
    if (browserVoice) utterance.voice = browserVoice;
    utterance.onend = () => speakChunkBrowser(chunks, index + 1);
    utterance.onerror = () => {
      if (!cancelledRef.current) {
        setReadingState('idle');
        setReadingIndex(-1);
      }
    };
    setReadingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const playChunkNeural = async (chunks, index) => {
    if (cancelledRef.current) return;
    if (index >= chunks.length) {
      setReadingState('idle');
      setReadingIndex(-1);
      return;
    }
    setReadingIndex(index);
    try {
      const url = await fetchChunkAudio(chunks, index);
      if (cancelledRef.current) return;
      if (index + 1 < chunks.length) {
        fetchChunkAudio(chunks, index + 1).catch(() => {});
      }
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = url;
      audio.onended = () => playChunkNeural(chunks, index + 1);
      await audio.play();
    } catch {
      if (cancelledRef.current) return;
      // Neural voice unavailable — fall back to the browser's built-in voice.
      modeRef.current = 'browser';
      if (window.speechSynthesis) {
        speakChunkBrowser(chunks, index);
      } else {
        setReadingState('idle');
        setReadingIndex(-1);
        setReadError('Read-aloud is not available right now. Please try again.');
      }
    }
  };

  const start = (chunks) => {
    stop();
    cancelledRef.current = false;
    modeRef.current = 'neural';
    setReadError('');
    setReadingState('reading');
    playChunkNeural(chunks, 0);
  };

  const pause = () => {
    if (modeRef.current === 'neural') {
      audioRef.current?.pause();
    } else {
      window.speechSynthesis.pause();
    }
    setReadingState('paused');
  };

  const resume = () => {
    if (modeRef.current === 'neural') {
      audioRef.current?.play();
    } else {
      window.speechSynthesis.resume();
    }
    setReadingState('reading');
  };

  return { readingState, readingIndex, readError, start, pause, resume, stop, reset };
}
