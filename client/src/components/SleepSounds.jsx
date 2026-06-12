import { useEffect, useRef, useState } from 'react';

const SLEEP_SOUNDS = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', description: 'Steady rainfall on a quiet night.' },
  { id: 'ocean', name: 'Ocean waves', emoji: '🌊', description: 'Slow waves rolling onto the shore.' },
  { id: 'white', name: 'White noise', emoji: '📻', description: 'Even static that masks distractions.' },
  { id: 'brown', name: 'Deep rumble', emoji: '🌫️', description: 'Low, warm noise like distant thunder.' },
  { id: 'fan', name: 'Fan hum', emoji: '🌀', description: 'The soft whirr of a bedroom fan.' },
];

function createNoiseBuffer(ctx, type) {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  if (type === 'brown') {
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return buffer;
}

function formatSeconds(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function SleepSounds({ onBack }) {
  const [sound, setSound] = useState(null);
  const [volume, setVolume] = useState(0.6);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [timerLeft, setTimerLeft] = useState(null);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const nodesRef = useRef([]);
  const timeoutRef = useRef(null);

  const teardownNodes = () => {
    nodesRef.current.forEach((node) => {
      try { node.stop?.(); } catch (_) {}
      try { node.disconnect(); } catch (_) {}
    });
    nodesRef.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const stopSound = () => {
    teardownNodes();
    setTimerEndsAt(null);
    setSound(null);
  };

  const armTimer = (minutes) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!minutes) {
      setTimerEndsAt(null);
      return;
    }
    setTimerEndsAt(Date.now() + minutes * 60000);
    timeoutRef.current = setTimeout(() => stopSound(), minutes * 60000);
  };

  const chooseTimer = (minutes) => {
    setTimerMinutes(minutes);
    if (sound) armTimer(minutes);
  };

  const buildSleepGraph = (ctx, soundId, out) => {
    const nodes = [];
    const makeNoiseSource = (type) => {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, type);
      src.loop = true;
      return src;
    };
    if (soundId === 'rain') {
      const src = makeNoiseSource('pink');
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 400;
      const trim = ctx.createGain();
      trim.gain.value = 0.9;
      src.connect(highpass).connect(trim).connect(out);
      src.start();
      nodes.push(src, highpass, trim);
    } else if (soundId === 'ocean') {
      const src = makeNoiseSource('brown');
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 650;
      const swell = ctx.createGain();
      swell.gain.value = 0.55;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.4;
      lfo.connect(lfoDepth).connect(swell.gain);
      src.connect(lowpass).connect(swell).connect(out);
      src.start();
      lfo.start();
      nodes.push(src, lowpass, swell, lfo, lfoDepth);
    } else if (soundId === 'white') {
      const src = makeNoiseSource('white');
      const trim = ctx.createGain();
      trim.gain.value = 0.25;
      src.connect(trim).connect(out);
      src.start();
      nodes.push(src, trim);
    } else if (soundId === 'brown') {
      const src = makeNoiseSource('brown');
      const trim = ctx.createGain();
      trim.gain.value = 0.9;
      src.connect(trim).connect(out);
      src.start();
      nodes.push(src, trim);
    } else if (soundId === 'fan') {
      const src = makeNoiseSource('brown');
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 280;
      const trim = ctx.createGain();
      trim.gain.value = 1.1;
      const hum = ctx.createOscillator();
      hum.type = 'triangle';
      hum.frequency.value = 110;
      const humGain = ctx.createGain();
      humGain.gain.value = 0.03;
      src.connect(lowpass).connect(trim).connect(out);
      hum.connect(humGain).connect(out);
      src.start();
      hum.start();
      nodes.push(src, lowpass, trim, hum, humGain);
    }
    return nodes;
  };

  const playSound = async (soundId) => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioCtxRef.current = new AudioCtx();
      const master = audioCtxRef.current.createGain();
      master.gain.value = volume;
      master.connect(audioCtxRef.current.destination);
      masterGainRef.current = master;
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    nodesRef.current.forEach((node) => {
      try { node.stop?.(); } catch (_) {}
      try { node.disconnect(); } catch (_) {}
    });
    nodesRef.current = buildSleepGraph(ctx, soundId, masterGainRef.current);
    setSound(soundId);
    armTimer(timerMinutes);
  };

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume]);

  useEffect(() => {
    if (!sound || !timerEndsAt) {
      setTimerLeft(null);
      return undefined;
    }
    const tick = () => setTimerLeft(Math.max(0, Math.round((timerEndsAt - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sound, timerEndsAt]);

  useEffect(() => () => {
    nodesRef.current.forEach((node) => {
      try { node.stop?.(); } catch (_) {}
      try { node.disconnect(); } catch (_) {}
    });
    nodesRef.current = [];
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
    }
  }, []);

  return (
    <section className="card">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Adults • Wind down</p>
          <h2>Sleep sounds</h2>
        </div>
        <button className="secondary-btn" onClick={onBack}>Back home</button>
      </div>
      <p className="small" style={{ marginBottom: 16 }}>
        Pick a sound and let it loop while you drift off. Set the sleep timer to stop the audio automatically.
      </p>
      <div className="sound-grid">
        {SLEEP_SOUNDS.map((item) => (
          <button
            key={item.id}
            className={`sound-card ${sound === item.id ? 'playing' : ''}`}
            onClick={() => (sound === item.id ? stopSound() : playSound(item.id))}
          >
            <span className="sound-emoji">{item.emoji}</span>
            <span className="sound-name">{item.name}</span>
            <span className="small">{item.description}</span>
            {sound === item.id && <span className="sound-playing-tag">▶ Playing — tap to stop</span>}
          </button>
        ))}
      </div>
      <div className="sound-controls">
        <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <label>Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Sleep timer</label>
          <div className="timer-options">
            {[0, 15, 30, 60].map((minutes) => (
              <button
                key={minutes}
                className={`timer-btn ${timerMinutes === minutes ? 'selected' : ''}`}
                onClick={() => chooseTimer(minutes)}
              >
                {minutes === 0 ? 'Off' : `${minutes} min`}
              </button>
            ))}
          </div>
        </div>
      </div>
      {sound && timerLeft !== null && (
        <p className="small" style={{ marginTop: 14 }}>Sound stops in {formatSeconds(timerLeft)}.</p>
      )}
      {sound && (
        <div className="actions">
          <button className="secondary-btn" onClick={stopSound}>Stop sound</button>
        </div>
      )}
    </section>
  );
}

export default SleepSounds;
