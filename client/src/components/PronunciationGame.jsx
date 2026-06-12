import { useEffect, useRef, useState } from 'react';
import { gameWords } from '../data/gameWords';
import { normalizeText, shuffleArray } from '../utils';

function PronunciationGame({ onBack }) {
  const [pronunciationIndex, setPronunciationIndex] = useState(0);
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const [speechStatus, setSpeechStatus] = useState('Say the word shown on screen. The game keeps listening.');
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [roundWords, setRoundWords] = useState(() => shuffleArray(gameWords).slice(0, 10));
  const [wordFeedback, setWordFeedback] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [skippedIndices, setSkippedIndices] = useState(new Set());

  const pronunciationIndexRef = useRef(pronunciationIndex);
  const roundWordsRef = useRef(roundWords);
  const recognitionRef = useRef(null);
  const gameStartedRef = useRef(false);
  const gameCompletedRef = useRef(false);

  const progressPercent = (pronunciationIndex / Math.max(roundWords.length, 1)) * 100;
  const currentChallenge = roundWords[pronunciationIndex];

  useEffect(() => {
    pronunciationIndexRef.current = pronunciationIndex;
  }, [pronunciationIndex]);

  useEffect(() => {
    roundWordsRef.current = roundWords;
  }, [roundWords]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    gameCompletedRef.current = gameCompleted;
  }, [gameCompleted]);

  useEffect(() => {
    if (gameCompleted || !gameStarted) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [gameCompleted, gameStarted]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return undefined;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;
    recognitionInstance.continuous = true;
    recognitionInstance.onstart = () => {
      setIsListening(true);
      setSpeechStatus('Listening... say the word out loud!');
    };
    recognitionInstance.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.trim();
      setSpeechTranscript(transcript);
      const targetWord = roundWordsRef.current[pronunciationIndexRef.current]?.word || '';
      if (normalizeText(transcript) === normalizeText(targetWord)) {
        setPronunciationScore((prev) => prev + 1);
        setSpeechStatus('Perfect! One obstacle cleared.');
        setWordFeedback('correct');
        setFeedbackKey((prev) => prev + 1);
        setWrongAttempts(0);
        setIsListening(false);
        if (pronunciationIndexRef.current >= roundWordsRef.current.length - 1) {
          setGameCompleted(true);
          setGameStarted(false);
          setIsListening(false);
        } else {
          setTimeout(() => {
            setPronunciationIndex((prev) => prev + 1);
            setSpeechTranscript('');
            setWordFeedback(null);
          }, 800);
        }
      } else {
        setWordFeedback('wrong');
        setFeedbackKey((prev) => prev + 1);
        setWrongAttempts((prev) => prev + 1);
        setSpeechStatus(`Heard: "${transcript}" — try again!`);
        setTimeout(() => setWordFeedback(null), 600);
      }
    };
    recognitionInstance.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setSpeechStatus('Microphone access was blocked. Please allow microphone permission and try again.');
      } else if (event.error === 'no-speech') {
        setSpeechStatus('I did not hear a word. Please try again.');
      } else {
        setSpeechStatus('Could not hear you. Please try again.');
      }
    };
    recognitionInstance.onend = () => {
      setIsListening(false);
      if (gameStartedRef.current && !gameCompletedRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          // Ignore restart errors while the app is still active.
        }
      }
    };

    recognitionRef.current = recognitionInstance;
    setRecognition(recognitionInstance);

    return () => {
      recognitionRef.current = null;
      recognitionInstance.stop();
    };
  }, []);

  const resetGame = () => {
    setPronunciationIndex(0);
    setPronunciationScore(0);
    setElapsedTime(0);
    setRoundWords(shuffleArray(gameWords).slice(0, 10));
    setSpeechStatus('Say the word shown on screen. The game keeps listening.');
    setSpeechTranscript('');
    setGameCompleted(false);
    setGameStarted(false);
    setIsListening(false);
    setWrongAttempts(0);
    setWordFeedback(null);
    setFeedbackKey(0);
    setSkippedIndices(new Set());
  };

  const skipWord = () => {
    const currentIndex = pronunciationIndexRef.current;
    setSkippedIndices((prev) => new Set([...prev, currentIndex]));
    setWordFeedback('skipped');
    setFeedbackKey((prev) => prev + 1);

    setTimeout(() => {
      setWrongAttempts(0);
      setWordFeedback(null);
      setSpeechTranscript('');
      setSpeechStatus('Listening... say the word shown above.');
      if (currentIndex >= roundWordsRef.current.length - 1) {
        setGameCompleted(true);
        setGameStarted(false);
        setIsListening(false);
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (_) {}
        }
      } else {
        setPronunciationIndex((prev) => prev + 1);
      }
    }, 500);
  };

  const startPronunciationRound = async () => {
    if (!recognition) {
      setSpeechStatus('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setGameStarted(true);
      setGameCompleted(false);
      setElapsedTime(0);
      setSpeechStatus('Listening... say the word shown above.');
      recognition.start();
    } catch (error) {
      setSpeechStatus('Microphone access is needed. Please allow it in your browser and try again.');
    }
  };

  return (
    <section className="card">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Kids • Voice game</p>
          <h2>Pronunciation obstacle course</h2>
        </div>
        <button className="secondary-btn" onClick={onBack}>Back</button>
      </div>
      {gameCompleted ? (
        <div className="game-celebration">
          <span className="celebration-emoji">🎉</span>
          <h2>You cleared the course!</h2>
          <p>You said <strong>{pronunciationScore} out of {roundWords.length}</strong> words correctly.</p>
          <p>Finished in <strong>{elapsedTime} seconds</strong>.</p>
          <div className="actions">
            <button className="primary-btn" onClick={resetGame}>Play again</button>
          </div>
        </div>
      ) : (
        <div className="game-card">
          <div className="game-banner">
            <h3>Obstacle {pronunciationIndex + 1} of {roundWords.length}</h3>
            {gameStarted && isListening && (
              <div className="mic-indicator">
                <div className="mic-dot" />
                <span>Listening...</span>
              </div>
            )}
          </div>
          <div className="game-track">
            <div className="track-outer">
              <div className="runner" style={{ left: `${Math.min(progressPercent, 94)}%` }}>🧒</div>
              <div className="track-bar">
                <div className="track-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
          <div className="obstacle-list">
            {roundWords.map((item, index) => {
              const isPast = index < pronunciationIndex;
              const isActive = index === pronunciationIndex;
              const wasSkipped = isPast && skippedIndices.has(index);
              return (
                <div key={item.word} className={`obstacle-chip ${isPast ? (wasSkipped ? 'skipped' : 'cleared') : isActive ? 'active' : ''}`}>
                  <span>{isPast ? (wasSkipped ? '✗' : '✓') : isActive ? '⚡' : '•'}</span>
                  <span>{item.word}</span>
                </div>
              );
            })}
          </div>
          <div className="game-main">
            <p className="word-clue">{currentChallenge?.clue}</p>
            <div key={`word-${pronunciationIndex}-${feedbackKey}`} className={`word-display ${wordFeedback ? `flash-${wordFeedback}` : ''}`}>
              <h2>{currentChallenge?.word}</h2>
            </div>
            {gameStarted && wrongAttempts > 0 && (
              <div className="attempt-badge">{wrongAttempts} {wrongAttempts === 1 ? 'try' : 'tries'} so far</div>
            )}
            <p className="small">
              {speechTranscript ? `You said: "${speechTranscript}"` : speechStatus}
            </p>
          </div>
          <div className="actions">
            {!gameStarted && (
              <button className="primary-btn" onClick={startPronunciationRound}>Start</button>
            )}
            {gameStarted && wrongAttempts >= 3 && (
              <button className="skip-btn secondary-btn" onClick={skipWord}>Skip this word</button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default PronunciationGame;
