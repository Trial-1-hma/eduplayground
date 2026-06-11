import { useEffect, useRef, useState } from 'react';

const API_URL = 'http://localhost:5000';
const FOUNDRY_TOPICS = ['animals', 'nature', 'food and fruit', 'vehicles', 'weather', 'plants', 'space', 'school supplies', 'sports', 'household objects'];
const gameWords = [
  { word: 'cat', clue: 'A small furry pet that purrs and has whiskers.' },
  { word: 'dog', clue: 'A loyal pet that barks and loves to fetch.' },
  { word: 'bird', clue: 'An animal with wings that can fly and sing.' },
  { word: 'fish', clue: 'An animal that swims in rivers and the sea.' },
  { word: 'frog', clue: 'A green animal that jumps and says ribbit.' },
  { word: 'cow', clue: 'A farm animal that gives milk and says moo.' },
  { word: 'duck', clue: 'A bird that swims and quacks.' },
  { word: 'lion', clue: 'The king of the jungle with a big golden mane.' },
  { word: 'horse', clue: 'A big animal you can ride across open fields.' },
  { word: 'pig', clue: 'A pink farm animal that loves to roll in mud.' },
  { word: 'bear', clue: 'A big furry animal that loves honey and berries.' },
  { word: 'rabbit', clue: 'A fluffy animal with long ears that hops around.' },
  { word: 'elephant', clue: 'The biggest land animal with a very long trunk.' },
  { word: 'monkey', clue: 'A clever animal that swings through trees.' },
  { word: 'snake', clue: 'A long reptile with no legs that slithers.' },
  { word: 'tiger', clue: 'A big wild cat with orange and black stripes.' },
  { word: 'penguin', clue: 'A black and white bird that swims but cannot fly.' },
  { word: 'sheep', clue: 'A fluffy farm animal whose wool makes warm clothes.' },
  { word: 'owl', clue: 'A wise night bird that hoots in the dark.' },
  { word: 'fox', clue: 'A clever orange animal with a bushy tail.' },
  { word: 'apple', clue: 'A round red or green fruit that grows on trees.' },
  { word: 'banana', clue: 'A yellow curved fruit that monkeys love to eat.' },
  { word: 'orange', clue: 'A round citrus fruit with a tough peel.' },
  { word: 'bread', clue: 'You eat this with butter or jam for breakfast.' },
  { word: 'milk', clue: 'A white drink that comes from cows.' },
  { word: 'egg', clue: 'A food with a shell that you crack open to cook.' },
  { word: 'cake', clue: 'A sweet baked treat you eat at birthday parties.' },
  { word: 'rice', clue: 'Tiny white grains you cook and eat with a meal.' },
  { word: 'soup', clue: 'A warm liquid food you eat with a spoon.' },
  { word: 'grape', clue: 'A small round fruit that grows in bunches on a vine.' },
  { word: 'lemon', clue: 'A yellow sour citrus fruit used in drinks and baking.' },
  { word: 'carrot', clue: 'A long orange vegetable that rabbits love to munch.' },
  { word: 'mango', clue: 'A tropical yellow fruit that is sweet and juicy.' },
  { word: 'cookie', clue: 'A small sweet baked treat you enjoy with a drink.' },
  { word: 'butter', clue: 'A yellow spread you put on bread and toast.' },
  { word: 'sun', clue: 'The bright star that shines in the sky by day.' },
  { word: 'rain', clue: 'Water falling from clouds in the sky.' },
  { word: 'tree', clue: 'A tall plant with a trunk, branches, and leaves.' },
  { word: 'water', clue: 'You drink this when you are thirsty.' },
  { word: 'cloud', clue: 'White fluffy shapes that drift across the sky.' },
  { word: 'moon', clue: 'The glowing ball you see in the sky at night.' },
  { word: 'star', clue: 'A tiny dot of light shining in the night sky.' },
  { word: 'river', clue: 'A long stream of flowing water heading to the sea.' },
  { word: 'mountain', clue: 'A very tall rocky hill that reaches into the clouds.' },
  { word: 'flower', clue: 'A pretty plant with colorful petals and a sweet scent.' },
  { word: 'grass', clue: 'The green plant that covers parks and lawns.' },
  { word: 'snow', clue: 'Soft white frozen water that falls from the sky in winter.' },
  { word: 'wind', clue: 'Moving air that you can feel blowing on your face.' },
  { word: 'sand', clue: 'Tiny golden grains you find at the beach.' },
  { word: 'leaf', clue: 'The flat green part that grows on a tree or plant.' },
  { word: 'stone', clue: 'A small hard rock you find on the ground.' },
  { word: 'sea', clue: 'A vast body of salty water full of creatures.' },
  { word: 'fire', clue: 'Hot glowing flames that give warmth and light.' },
  { word: 'ice', clue: 'Frozen water that is cold and slippery.' },
  { word: 'cave', clue: 'A dark hollow inside a rock where animals shelter.' },
  { word: 'school', clue: 'A place where children go to learn and play.' },
  { word: 'book', clue: 'You read this to find stories and learn new things.' },
  { word: 'door', clue: 'You open this to enter or leave a room.' },
  { word: 'chair', clue: 'A piece of furniture you sit on to rest.' },
  { word: 'table', clue: 'A flat surface with legs used for eating and working.' },
  { word: 'bed', clue: 'A soft comfortable place where you sleep every night.' },
  { word: 'clock', clue: 'A device that shows you what time it is.' },
  { word: 'lamp', clue: 'A light you switch on when it gets dark.' },
  { word: 'phone', clue: 'A device you use to talk to people far away.' },
  { word: 'ball', clue: 'A round toy you throw, kick, or bounce.' },
  { word: 'kite', clue: 'A toy that flies high in the wind on a long string.' },
  { word: 'bag', clue: 'A container with handles that you carry things in.' },
  { word: 'cup', clue: 'A small container you use to drink from.' },
  { word: 'key', clue: 'A small metal tool used to open a lock.' },
  { word: 'hat', clue: 'A covering you wear on top of your head.' },
  { word: 'shoe', clue: 'A covering you wear on your foot to protect it.' },
  { word: 'brush', clue: 'A tool with bristles used for painting or cleaning teeth.' },
  { word: 'pen', clue: 'A tool you hold to write words on paper.' },
  { word: 'car', clue: 'A vehicle with four wheels that you drive on roads.' },
  { word: 'train', clue: 'A long vehicle that travels on metal tracks.' },
  { word: 'plane', clue: 'A vehicle with wings that flies high in the sky.' },
  { word: 'bus', clue: 'A large vehicle that carries many passengers on roads.' },
  { word: 'bike', clue: 'A two-wheeled vehicle you pedal to move forward.' },
  { word: 'boat', clue: 'A vehicle that floats and travels across water.' },
  { word: 'rocket', clue: 'A powerful vehicle that shoots up into outer space.' },
  { word: 'happy', clue: 'A feeling that makes you smile and feel joyful.' },
  { word: 'smile', clue: 'The shape your mouth makes when you feel joyful.' },
  { word: 'laugh', clue: 'The happy sound you make when something is very funny.' },
  { word: 'friend', clue: 'Someone you enjoy playing and spending time with.' },
  { word: 'family', clue: 'The people you live with who love you very much.' },
  { word: 'baby', clue: 'A very young child who cannot yet walk or talk.' },
  { word: 'home', clue: 'The safe cozy place where you live with your family.' },
  { word: 'dream', clue: 'Exciting images and stories you see while you sleep.' },
  { word: 'brave', clue: 'Not afraid to do something even when it feels scary.' },
  { word: 'kind', clue: 'Being gentle and caring toward other people.' },
  { word: 'jump', clue: 'To push off the ground and leap into the air.' },
  { word: 'run', clue: 'To move your legs very quickly to go somewhere fast.' },
  { word: 'swim', clue: 'To move through water using your arms and legs.' },
  { word: 'sing', clue: 'To make music using only your voice.' },
  { word: 'draw', clue: 'To make pictures using a pencil or crayon.' },
  { word: 'cook', clue: 'To prepare and make food using heat.' },
  { word: 'play', clue: 'What you do for fun with friends and toys.' },
  { word: 'sleep', clue: 'To rest your body with your eyes closed at night.' },
  { word: 'red', clue: 'The color of apples and fire engines.' },
  { word: 'blue', clue: 'The color of the sky and the deep ocean.' },
  { word: 'green', clue: 'The color of leaves and fresh spring grass.' },
  { word: 'yellow', clue: 'The bright color of the sun and ripe bananas.' },
  { word: 'pink', clue: 'A light cheerful color like roses and flamingos.' },
  { word: 'brown', clue: 'The warm color of chocolate and tree bark.' },
  { word: 'soft', clue: 'Something gentle and smooth to touch, like a pillow.' },
  { word: 'bright', clue: 'Full of strong light, like the sun on a clear day.' },
];

const photoQuizWords= [
  { answer: 'cup', prompt: 'Find and photograph a cup or mug!' },
  { answer: 'chair', prompt: 'Find and photograph a chair!' },
  { answer: 'book', prompt: 'Find and photograph a book!' },
  { answer: 'shoe', prompt: 'Find and photograph a shoe!' },
  { answer: 'plant', prompt: 'Find and photograph a plant or flower!' },
  { answer: 'clock', prompt: 'Find and photograph a clock or watch!' },
  { answer: 'bag', prompt: 'Find and photograph a bag or backpack!' },
  { answer: 'lamp', prompt: 'Find and photograph a lamp or light!' },
  { answer: 'bottle', prompt: 'Find and photograph a bottle!' },
  { answer: 'pillow', prompt: 'Find and photograph a pillow or cushion!' },
  { answer: 'apple', prompt: 'Find and photograph an apple!' },
  { answer: 'banana', prompt: 'Find and photograph a banana!' },
  { answer: 'ball', prompt: 'Find and photograph a ball!' },
  { answer: 'spoon', prompt: 'Find and photograph a spoon or fork!' },
  { answer: 'hat', prompt: 'Find and photograph a hat!' },
  { answer: 'key', prompt: 'Find and photograph a key!' },
  { answer: 'pen', prompt: 'Find and photograph a pen or pencil!' },
  { answer: 'table', prompt: 'Find and photograph a table!' },
  { answer: 'door', prompt: 'Find and photograph a door!' },
  { answer: 'window', prompt: 'Find and photograph a window!' },
  { answer: 'mirror', prompt: 'Find and photograph a mirror!' },
  { answer: 'towel', prompt: 'Find and photograph a towel!' },
  { answer: 'soap', prompt: 'Find and photograph a bar of soap or soap dispenser!' },
  { answer: 'toothbrush', prompt: 'Find and photograph a toothbrush!' },
  { answer: 'comb', prompt: 'Find and photograph a comb or hairbrush!' },
  { answer: 'scissors', prompt: 'Find and photograph a pair of scissors!' },
  { answer: 'fork', prompt: 'Find and photograph a fork!' },
  { answer: 'knife', prompt: 'Find and photograph a knife!' },
  { answer: 'plate', prompt: 'Find and photograph a plate or dish!' },
  { answer: 'bowl', prompt: 'Find and photograph a bowl!' },
  { answer: 'mug', prompt: 'Find and photograph a mug!' },
  { answer: 'glass', prompt: 'Find and photograph a drinking glass!' },
  { answer: 'pan', prompt: 'Find and photograph a pan or pot!' },
  { answer: 'remote', prompt: 'Find and photograph a TV remote control!' },
  { answer: 'phone', prompt: 'Find and photograph a mobile phone!' },
  { answer: 'laptop', prompt: 'Find and photograph a laptop or computer!' },
  { answer: 'headphones', prompt: 'Find and photograph headphones or earphones!' },
  { answer: 'charger', prompt: 'Find and photograph a phone or laptop charger!' },
  { answer: 'umbrella', prompt: 'Find and photograph an umbrella!' },
  { answer: 'blanket', prompt: 'Find and photograph a blanket!' },
  { answer: 'candle', prompt: 'Find and photograph a candle!' },
  { answer: 'frame', prompt: 'Find and photograph a picture frame!' },
  { answer: 'calendar', prompt: 'Find and photograph a calendar!' },
  { answer: 'notebook', prompt: 'Find and photograph a notebook!' },
  { answer: 'pencil', prompt: 'Find and photograph a pencil!' },
  { answer: 'ruler', prompt: 'Find and photograph a ruler!' },
  { answer: 'eraser', prompt: 'Find and photograph an eraser!' },
  { answer: 'wallet', prompt: 'Find and photograph a wallet or purse!' },
  { answer: 'sunglasses', prompt: 'Find and photograph a pair of sunglasses!' },
  { answer: 'watch', prompt: 'Find and photograph a wristwatch!' },
  { answer: 'sock', prompt: 'Find and photograph a sock!' },
  { answer: 'shirt', prompt: 'Find and photograph a shirt!' },
  { answer: 'jacket', prompt: 'Find and photograph a jacket or coat!' },
  { answer: 'belt', prompt: 'Find and photograph a belt!' },
  { answer: 'scarf', prompt: 'Find and photograph a scarf!' },
  { answer: 'glove', prompt: 'Find and photograph a glove!' },
  { answer: 'orange', prompt: 'Find and photograph an orange!' },
  { answer: 'lemon', prompt: 'Find and photograph a lemon!' },
  { answer: 'onion', prompt: 'Find and photograph an onion!' },
  { answer: 'potato', prompt: 'Find and photograph a potato!' },
  { answer: 'tomato', prompt: 'Find and photograph a tomato!' },
  { answer: 'carrot', prompt: 'Find and photograph a carrot!' },
  { answer: 'bread', prompt: 'Find and photograph a loaf or slice of bread!' },
  { answer: 'egg', prompt: 'Find and photograph an egg!' },
  { answer: 'strawberry', prompt: 'Find and photograph a strawberry!' },
  { answer: 'coin', prompt: 'Find and photograph a coin!' },
  { answer: 'envelope', prompt: 'Find and photograph an envelope!' },
  { answer: 'tape', prompt: 'Find and photograph a roll of tape!' },
  { answer: 'stapler', prompt: 'Find and photograph a stapler!' },
  { answer: 'flashlight', prompt: 'Find and photograph a flashlight or torch!' },
  { answer: 'battery', prompt: 'Find and photograph a battery!' },
  { answer: 'speaker', prompt: 'Find and photograph a speaker!' },
  { answer: 'keyboard', prompt: 'Find and photograph a keyboard!' },
  { answer: 'mouse', prompt: 'Find and photograph a computer mouse!' },
  { answer: 'calculator', prompt: 'Find and photograph a calculator!' },
  { answer: 'toothpaste', prompt: 'Find and photograph a tube of toothpaste!' },
  { answer: 'shampoo', prompt: 'Find and photograph a bottle of shampoo!' },
  { answer: 'sponge', prompt: 'Find and photograph a sponge!' },
  { answer: 'brush', prompt: 'Find and photograph a paintbrush or toothbrush!' },
  { answer: 'mat', prompt: 'Find and photograph a mat or rug!' },
  { answer: 'curtain', prompt: 'Find and photograph a curtain!' },
  { answer: 'shelf', prompt: 'Find and photograph a shelf!' },
  { answer: 'drawer', prompt: 'Find and photograph a drawer!' },
  { answer: 'hanger', prompt: 'Find and photograph a clothes hanger!' },
  { answer: 'bin', prompt: 'Find and photograph a bin or trash can!' },
  { answer: 'fan', prompt: 'Find and photograph a fan!' },
  { answer: 'map', prompt: 'Find and photograph a map!' },
  { answer: 'magazine', prompt: 'Find and photograph a magazine!' },
  { answer: 'sticker', prompt: 'Find and photograph a sticker!' },
  { answer: 'toy', prompt: 'Find and photograph a toy!' },
  { answer: 'puzzle', prompt: 'Find and photograph a puzzle or puzzle piece!' },
  { answer: 'dice', prompt: 'Find and photograph a dice!' },
  { answer: 'marker', prompt: 'Find and photograph a marker or highlighter!' },
  { answer: 'stamp', prompt: 'Find and photograph a stamp!' },
  { answer: 'paperclip', prompt: 'Find and photograph a paper clip!' },
  { answer: 'rubber band', prompt: 'Find and photograph a rubber band!' },
  { answer: 'leaf', prompt: 'Find and photograph a leaf!' },
  { answer: 'stone', prompt: 'Find and photograph a stone or pebble!' },
  { answer: 'feather', prompt: 'Find and photograph a feather!' },
  { answer: 'flower', prompt: 'Find and photograph a flower!' },
];

const logoQuizBrands = [
  { name: 'YouTube', slug: 'youtube' },
  { name: 'Netflix', slug: 'netflix' },
  { name: 'Spotify', slug: 'spotify' },
  { name: 'Google', slug: 'google' },
  { name: 'Apple', slug: 'apple' },
  { name: 'Amazon', slug: 'amazon' },
  { name: 'Instagram', slug: 'instagram' },
  { name: 'WhatsApp', slug: 'whatsapp' },
  { name: 'TikTok', slug: 'tiktok' },
  { name: 'Snapchat', slug: 'snapchat' },
  { name: 'Twitch', slug: 'twitch' },
  { name: 'Discord', slug: 'discord' },
  { name: 'Roblox', slug: 'roblox' },
  { name: 'Steam', slug: 'steam' },
  { name: 'Nintendo', slug: 'nintendo' },
  { name: 'PlayStation', slug: 'playstation' },
  { name: 'Xbox', slug: 'xbox' },
  { name: 'Zoom', slug: 'zoom' },
  { name: "McDonald's", slug: 'mcdonalds' },
  { name: 'LEGO', slug: 'lego' },
  { name: 'NASA', slug: 'nasa' },
  { name: 'Coca-Cola', slug: 'cocacola' },
  { name: 'Microsoft', slug: 'microsoft' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Facebook', slug: 'facebook' },
  { name: 'X', slug: 'x' },
  { name: 'Reddit', slug: 'reddit' },
  { name: 'Pinterest', slug: 'pinterest' },
  { name: 'LinkedIn', slug: 'linkedin' },
  { name: 'PayPal', slug: 'paypal' },
  { name: 'Visa', slug: 'visa' },
  { name: 'Uber', slug: 'uber' },
  { name: 'Airbnb', slug: 'airbnb' },
  { name: 'Starbucks', slug: 'starbucks' },
  { name: 'KFC', slug: 'kfc' },
  { name: 'Burger King', slug: 'burgerking' },
  { name: 'Pepsi', slug: 'pepsi' },
  { name: 'Nike', slug: 'nike' },
  { name: 'Adidas', slug: 'adidas' },
  { name: 'Slack', slug: 'slack' },
  { name: 'Figma', slug: 'figma' },
  { name: 'Dropbox', slug: 'dropbox' },
  { name: 'Disney+', slug: 'disneyplus' },
  { name: 'Sony', slug: 'sony' },
  { name: 'Adobe', slug: 'adobe' },
  { name: 'Shopify', slug: 'shopify' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Canva', slug: 'canva' },
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeForLogo(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function shuffleArray(items) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}

function App() {
  const [view, setView] = useState('home');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pronunciationIndex, setPronunciationIndex] = useState(0);
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const [speechStatus, setSpeechStatus] = useState('Tap start, then say the word shown on screen. The game keeps listening.');
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [roundWords, setRoundWords] = useState(gameWords);
  const [wordFeedback, setWordFeedback] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [skippedIndices, setSkippedIndices] = useState(new Set());
  const [foundryRiddle, setFoundryRiddle] = useState(null);
  const [foundryAnswer, setFoundryAnswer] = useState('');
  const [foundryResult, setFoundryResult] = useState(null);
  const [foundryLoading, setFoundryLoading] = useState(false);
  const [foundryError, setFoundryError] = useState('');
  const [photoRound, setPhotoRound] = useState([]);
  const [photoRoundIndex, setPhotoRoundIndex] = useState(0);
  const [photoCameraState, setPhotoCameraState] = useState('prompt');
  const [photoCaptureBase64, setPhotoCaptureBase64] = useState(null);
  const [photoCaptureUrl, setPhotoCaptureUrl] = useState(null);
  const [photoResult, setPhotoResult] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoScore, setPhotoScore] = useState(0);
  const [photoStartTime, setPhotoStartTime] = useState(0);
  const [photoTimer, setPhotoTimer] = useState(0);
  const [photoElapsed, setPhotoElapsed] = useState(0);
  const [logoRound, setLogoRound] = useState([]);
  const [logoRoundIndex, setLogoRoundIndex] = useState(0);
  const [logoGuess, setLogoGuess] = useState('');
  const [logoFeedback, setLogoFeedback] = useState(null);
  const [logoScore, setLogoScore] = useState(0);
  const [logoGuesserState, setLogoGuesserState] = useState('playing');
  const [logoHint, setLogoHint] = useState(null);
  const [logoHintLoading, setLogoHintLoading] = useState(false);

  const pronunciationIndexRef = useRef(pronunciationIndex);
  const roundWordsRef = useRef(roundWords);
  const recognitionRef = useRef(null);
  const gameStartedRef = useRef(false);
  const gameCompletedRef = useRef(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const progressPercent = (pronunciationIndex / Math.max(roundWords.length, 1)) * 100;
  const currentChallenge = roundWords[pronunciationIndex];

  useEffect(() => {
    fetch(`${API_URL}/api/exams`)
      .then((res) => res.json())
      .then((data) => setExams(data.exams || []))
      .catch(() => setError('Unable to load exams right now.'));
  }, []);

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
    if (view !== 'pronunciationGame' || gameCompleted || !gameStarted) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [view, gameCompleted, gameStarted]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
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
    setSpeechSupported(true);

    return () => recognitionInstance.stop();
  }, []);

  useEffect(() => {
    if (photoCameraState === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [photoCameraState]);

  useEffect(() => {
    if (view !== 'photoQuiz' && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [view]);

  useEffect(() => {
    if (view !== 'photoQuiz' || photoCameraState === 'done' || !photoStartTime) return undefined;
    const id = window.setInterval(() => {
      setPhotoTimer(Math.floor((Date.now() - photoStartTime) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [view, photoCameraState, photoStartTime]);

  const normalizeQuestions = (examId, items) => items.map((question) => {
    if (examId === 'kids' && question.type !== 'text' && Array.isArray(question.options)) {
      return {
        ...question,
        type: 'text',
        answerText: question.options[question.answer] || '',
      };
    }
    return question;
  });

  const startExam = async (examId) => {
    setSelectedExam(examId);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setError('');
    setView('quiz');
    const response = await fetch(`${API_URL}/api/exams/${examId}/questions`);
    const data = await response.json();
    setQuestions(normalizeQuestions(examId, data.questions || []));
  };

  const startKidsQuiz = async () => {
    await startExam('kids');
  };

  const startPronunciationGame = () => {
    setView('pronunciationGame');
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

  const selectAnswer = (value) => {
    const next = [...answers];
    next[currentQuestion] = value;
    setAnswers(next);
  };

  const submitExam = async () => {
    const correct = questions.reduce((count, question, index) => {
      const selected = answers[index];
      const isTextQuestion = question.type === 'text' || selectedExam === 'kids';
      if (isTextQuestion) {
        return count + (normalizeText(selected) === normalizeText(question.answerText) ? 1 : 0);
      }
      return count + (selected === question.answer ? 1 : 0);
    }, 0);

    const percentage = Math.round((correct / questions.length) * 100);
    const review = questions.map((question, index) => {
      const selected = answers[index];
      const isTextQuestion = question.type === 'text' || selectedExam === 'kids';
      const isCorrect = isTextQuestion
        ? normalizeText(selected) === normalizeText(question.answerText)
        : selected === question.answer;
      return {
        ...question,
        selectedAnswer: selected,
        isCorrect,
      };
    });

    setResult({
      correct,
      total: questions.length,
      percentage,
      review,
    });
  };

  const startListening = async () => {
    if (!recognition) {
      setSpeechStatus('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      recognition.start();
    } catch (error) {
      setSpeechStatus('Microphone access is needed. Please allow it in your browser and try again.');
    }
  };

  const fetchFoundryRiddle = async (topic) => {
    setFoundryLoading(true);
    setFoundryError('');
    setFoundryAnswer('');
    setFoundryResult(null);
    setFoundryRiddle(null);
    const chosen = topic || FOUNDRY_TOPICS[Math.floor(Math.random() * FOUNDRY_TOPICS.length)];
    try {
      const res = await fetch(`${API_URL}/api/foundry/riddle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: chosen }),
      }).catch(() => { throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.'); });
      let data;
      try { data = await res.json(); } catch { throw new Error('Server returned an unexpected response. Check that the backend is running.'); }
      if (!res.ok) throw new Error(data.error || 'Failed to generate riddle.');
      setFoundryRiddle(data.riddle);
    } catch (err) {
      setFoundryError(err.message);
    } finally {
      setFoundryLoading(false);
    }
  };

  const submitFoundryAnswer = () => {
    if (!foundryRiddle || foundryResult !== null) return;
    setFoundryResult(normalizeText(foundryAnswer) === normalizeText(foundryRiddle.answerText));
  };

  const startFoundryRiddle = () => {
    setView('foundryRiddle');
    setFoundryRiddle(null);
    setFoundryAnswer('');
    setFoundryResult(null);
    setFoundryError('');
    fetchFoundryRiddle();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startPhotoRound = () => {
    stopCamera();
    const round = shuffleArray(photoQuizWords).slice(0, 5);
    const now = Date.now();
    setPhotoRound(round);
    setPhotoRoundIndex(0);
    setPhotoScore(0);
    setPhotoStartTime(now);
    setPhotoTimer(0);
    setPhotoElapsed(0);
    setPhotoCameraState('prompt');
    setPhotoCaptureBase64(null);
    setPhotoCaptureUrl(null);
    setPhotoResult(null);
    setPhotoError('');
    setPhotoLoading(false);
    setView('photoQuiz');
  };

  const openCamera = async () => {
    setPhotoError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setPhotoCameraState('camera');
    } catch {
      setPhotoError('Camera access denied. Please allow camera permission and try again.');
    }
  };

  const snapPhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setPhotoCaptureBase64(dataUrl.split(',')[1]);
    setPhotoCaptureUrl(dataUrl);
    setPhotoCameraState('preview');
  };

  const submitSnap = async () => {
    const expected = photoRound[photoRoundIndex]?.answer;
    if (!photoCaptureBase64 || !expected) return;
    setPhotoLoading(true);
    setPhotoError('');
    try {
      const res = await fetch(`${API_URL}/api/foundry/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: photoCaptureBase64, mimeType: 'image/jpeg', expectedAnswer: expected }),
      }).catch(() => { throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.'); });
      let data;
      try { data = await res.json(); } catch { throw new Error('Server returned an unexpected response.'); }
      if (!res.ok) throw new Error(data.error || 'Classification failed.');
      if (data.matches) setPhotoScore((prev) => prev + 1);
      setPhotoResult(data);
      setPhotoCameraState('result');
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoLoading(false);
    }
  };

  const nextPhotoChallenge = () => {
    const next = photoRoundIndex + 1;
    if (next >= photoRound.length) {
      setPhotoElapsed(Math.floor((Date.now() - photoStartTime) / 1000));
      setPhotoCameraState('done');
    } else {
      setPhotoRoundIndex(next);
      setPhotoCaptureBase64(null);
      setPhotoCaptureUrl(null);
      setPhotoResult(null);
      setPhotoError('');
      setPhotoCameraState('prompt');
    }
  };

  const startLogoGuesser = () => {
    const round = shuffleArray(logoQuizBrands).slice(0, 8);
    setLogoRound(round);
    setLogoRoundIndex(0);
    setLogoGuess('');
    setLogoFeedback(null);
    setLogoScore(0);
    setLogoHint(null);
    setLogoHintLoading(false);
    setLogoGuesserState('playing');
    setView('logoGuesser');
  };

  const submitLogoGuess = () => {
    const current = logoRound[logoRoundIndex];
    if (!current || !logoGuess.trim()) return;
    const isCorrect = normalizeForLogo(logoGuess) === normalizeForLogo(current.name);
    if (isCorrect) setLogoScore((prev) => prev + 1);
    setLogoFeedback(isCorrect ? 'correct' : 'wrong');
  };

  const nextLogo = () => {
    const next = logoRoundIndex + 1;
    if (next >= logoRound.length) {
      setLogoGuesserState('done');
    } else {
      setLogoRoundIndex(next);
      setLogoGuess('');
      setLogoFeedback(null);
      setLogoHint(null);
      setLogoHintLoading(false);
    }
  };

  const fetchLogoHint = async () => {
    const current = logoRound[logoRoundIndex];
    if (!current) return;
    setLogoHintLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/foundry/logo-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: current.name }),
      }).catch(() => { throw new Error('Cannot reach the server.'); });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get hint.');
      setLogoHint(data.hint);
    } catch {
      setLogoHint('Hint not available right now.');
    } finally {
      setLogoHintLoading(false);
    }
  };

  const resetFlow = () => {
    setView('home');
    setSelectedExam(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setError('');
  };

  const renderHome = () => (
    <div className="landing-shell">
      <header className="hero">
        <p className="eyebrow">No account required</p>
        <h1>Learn by taking fast quizzes and fun kids games.</h1>
        <p>Visit the site, choose your path, and start learning right away.</p>
      </header>
      <main className="landing-grid">
        <section className="card path-card">
          <div className="path-badge">Exams</div>
          <h2>Practice real exam questions</h2>
          <p>Try AWS, Azure, Kubernetes, and Docker practice rounds with reviews at the end.</p>
          <button className="primary-btn" onClick={() => setView('exams')}>Open exams</button>
        </section>
        <section className="card path-card">
          <div className="path-badge">Kids</div>
          <h2>Play a kid-friendly quiz and voice game</h2>
          <p>Enjoy simple riddles and a pronunciation obstacle game that uses your voice.</p>
          <button className="primary-btn" onClick={() => setView('kids')}>Open kids section</button>
        </section>
      </main>
    </div>
  );

  const renderExams = () => (
    <section className="card">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Exams</p>
          <h2>Choose a practice exam</h2>
        </div>
        <button className="secondary-btn" onClick={resetFlow}>Back home</button>
      </div>
      <div className="exam-grid">
        {exams.filter((exam) => exam.id !== 'kids').map((exam) => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <p className="small">50 questions • full review after submission</p>
            <button className="primary-btn" onClick={() => startExam(exam.id)}>Start</button>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );

  const renderKids = () => (
    <section className="card">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Kids</p>
          <h2>Fun learning for children</h2>
        </div>
        <button className="secondary-btn" onClick={resetFlow}>Back</button>
      </div>
      <div className="exam-grid">
        <div className="exam-card">
          <h3>Pronunciation obstacle game</h3>
          <p>Say the English word clearly to clear each obstacle.</p>
          <button className="primary-btn" onClick={startPronunciationGame}>Play game</button>
        </div>
        <div className="exam-card foundry-card">
          <div className="foundry-badge">✦ Foundry IQ</div>
          <h3>AI Riddle Challenge</h3>
          <p>Fresh riddles generated live by Azure AI Foundry. A new puzzle every time.</p>
          <button className="primary-btn" onClick={startFoundryRiddle}>Try an AI riddle</button>
        </div>
        <div className="exam-card foundry-card">
          <div className="foundry-badge">✦ Foundry IQ Vision</div>
          <h3>Photo Challenge</h3>
          <p>Find an everyday object, snap a photo, and let AI check if you got it right!</p>
          <button className="primary-btn" onClick={startPhotoRound}>Start photo quiz</button>
        </div>
        <div className="exam-card foundry-card">
          <div className="foundry-badge">✦ Foundry IQ</div>
          <h3>Logo Guesser</h3>
          <p>Look at a brand icon and guess the name. Get AI hints if you're stuck!</p>
          <button className="primary-btn" onClick={startLogoGuesser}>Play logo quiz</button>
        </div>
      </div>
    </section>
  );

  const renderFoundryRiddle = () => (
    <section className="card">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Kids • AI Riddle</p>
          <h2>Foundry IQ Riddle Challenge</h2>
        </div>
        <button className="secondary-btn" onClick={() => setView('kids')}>Back</button>
      </div>
      <div className="foundry-badge" style={{ marginBottom: 20 }}>✦ Powered by Azure AI Foundry — Foundry IQ</div>
      {foundryLoading && (
        <div className="foundry-loading">
          <div className="foundry-spinner" />
          <p className="small">Foundry IQ is generating your riddle...</p>
        </div>
      )}
      {foundryError && (
        <div className="game-card">
          <p className="error">{foundryError}</p>
          <p className="small" style={{ marginTop: 8 }}>
            To enable this feature, add <code>GITHUB_TOKEN=ghp_...</code> to <code>server/.env</code>.
          </p>
          <div className="actions">
            <button className="primary-btn" onClick={() => fetchFoundryRiddle()}>Try again</button>
          </div>
        </div>
      )}
      {foundryRiddle && !foundryLoading && (
        <div className="game-card">
          <div className="game-main">
            <p className="word-clue">Topic: {foundryRiddle.topic}</p>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.4, margin: '8px 0 20px' }}>
              {foundryRiddle.prompt}
            </h2>
            {foundryResult === null ? (
              <>
                <div className="form-group">
                  <label>Your answer</label>
                  <input
                    type="text"
                    value={foundryAnswer}
                    onChange={(e) => setFoundryAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitFoundryAnswer()}
                    placeholder="Type your answer..."
                    autoFocus
                  />
                </div>
                <div className="actions">
                  <button className="primary-btn" onClick={submitFoundryAnswer} disabled={!foundryAnswer.trim()}>Submit</button>
                </div>
              </>
            ) : (
              <div>
                <p className={foundryResult ? 'success' : 'warning'} style={{ fontSize: '1.1rem', marginBottom: 8 }}>
                  {foundryResult ? '✓ Correct!' : `✗ The answer was: ${foundryRiddle.answerText}`}
                </p>
                <p style={{ marginBottom: 4 }}>{foundryRiddle.explanation}</p>
                <p className="small foundry-source">Source: {foundryRiddle.source}</p>
                <div className="actions">
                  <button className="primary-btn" onClick={() => fetchFoundryRiddle()}>Next riddle</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );

  const renderPhotoQuiz = () => {
    const currentWord = photoRound[photoRoundIndex];
    return (
      <section className="card">
        <div className="page-topbar">
          <div>
            <p className="eyebrow">Kids • Photo Quiz</p>
            <h2>Photo Challenge</h2>
          </div>
          <button className="secondary-btn" onClick={() => { stopCamera(); setView('kids'); }}>Back</button>
        </div>
        <div className="foundry-badge" style={{ marginBottom: 16 }}>✦ Foundry IQ Vision</div>

        {photoCameraState !== 'done' && photoRound.length > 0 && (
          <div className="game-banner" style={{ marginBottom: 12 }}>
            <h3>Photo {photoRoundIndex + 1} of {photoRound.length}</h3>
            <span className="attempt-badge" style={{ background: 'rgba(69,211,191,0.12)', color: '#45d3bf', borderColor: 'rgba(69,211,191,0.3)' }}>
              {photoTimer}s
            </span>
          </div>
        )}

        {photoCameraState === 'done' ? (
          <div className="game-celebration">
            <span className="celebration-emoji">📸</span>
            <h2>Round complete!</h2>
            <p>You matched <strong>{photoScore} of {photoRound.length}</strong> objects correctly.</p>
            <p>Time: <strong>{photoElapsed} seconds</strong></p>
            <div className="actions">
              <button className="primary-btn" onClick={startPhotoRound}>Play again</button>
              <button className="secondary-btn" onClick={() => setView('kids')}>Back</button>
            </div>
          </div>
        ) : (
          <div className="game-card">
            <div className="game-main">
              <p className="word-clue">Your challenge:</p>
              <h2 style={{ fontSize: '1.6rem', margin: '4px 0 16px', lineHeight: 1.3 }}>{currentWord?.prompt}</h2>

              {photoCameraState === 'prompt' && (
                <div className="photo-prompt-area">
                  <span className="photo-icon">📷</span>
                  <p>Point your camera at a <strong>{currentWord?.answer}</strong> and snap the photo.</p>
                  {photoError && <p className="error" style={{ marginTop: 8 }}>{photoError}</p>}
                  <div className="actions" style={{ marginTop: 16 }}>
                    <button className="primary-btn" onClick={openCamera}>Open Camera</button>
                  </div>
                </div>
              )}

              {photoCameraState === 'camera' && (
                <div className="camera-wrapper">
                  <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
                  <div className="camera-actions">
                    <button className="snap-btn" onClick={snapPhoto}>📸 Snap!</button>
                    <button className="secondary-btn" onClick={() => { stopCamera(); setPhotoCameraState('prompt'); }}>Cancel</button>
                  </div>
                </div>
              )}

              {(photoCameraState === 'preview' || photoCameraState === 'result') && photoCaptureUrl && (
                <div className="photo-result">
                  <img src={photoCaptureUrl} alt="Your snap" className="photo-preview" />

                  {photoCameraState === 'preview' && (
                    <>
                      {photoError && <p className="error" style={{ marginTop: 8 }}>{photoError}</p>}
                      <div className="actions" style={{ marginTop: 12 }}>
                        {!photoLoading ? (
                          <>
                            <button className="primary-btn" onClick={submitSnap}>Check it</button>
                            <button className="secondary-btn" onClick={() => { setPhotoCaptureBase64(null); setPhotoCaptureUrl(null); setPhotoError(''); openCamera(); }}>Retake</button>
                          </>
                        ) : (
                          <div className="foundry-loading">
                            <div className="foundry-spinner" />
                            <p className="small">AI is checking your photo...</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {photoCameraState === 'result' && photoResult && (
                    <>
                      <div className={`photo-verdict ${photoResult.matches ? 'photo-verdict-correct' : 'photo-verdict-wrong'}`}>
                        <span className="photo-verdict-emoji">{photoResult.matches ? '✅' : '❌'}</span>
                        <div>
                          <p className="photo-verdict-text">
                            {photoResult.matches
                              ? `Correct! That's a ${photoResult.detected}.`
                              : `That looks like a ${photoResult.detected}.`}
                          </p>
                          <p className="small">Confidence: {photoResult.confidence}</p>
                        </div>
                      </div>
                      <p className="small foundry-source" style={{ marginTop: 10 }}>
                        Classified by GitHub Models (Azure AI infrastructure) — Foundry IQ Vision
                      </p>
                      <div className="actions" style={{ marginTop: 12 }}>
                        <button className="primary-btn" onClick={nextPhotoChallenge}>
                          {photoRoundIndex < photoRound.length - 1 ? 'Next challenge' : 'See results'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderLogoGuesser = () => {
    const current = logoRound[logoRoundIndex];
    return (
      <section className="card">
        <div className="page-topbar">
          <div>
            <p className="eyebrow">Kids • Logo Guesser</p>
            <h2>Can you name this logo?</h2>
          </div>
          <button className="secondary-btn" onClick={() => setView('kids')}>Back</button>
        </div>
        <div className="foundry-badge" style={{ marginBottom: 16 }}>✦ Foundry IQ</div>

        {logoGuesserState === 'done' ? (
          <div className="game-celebration">
            <span className="celebration-emoji">🏆</span>
            <h2>Nice job!</h2>
            <p>You got <strong>{logoScore} of {logoRound.length}</strong> logos right.</p>
            <div className="actions">
              <button className="primary-btn" onClick={startLogoGuesser}>Play again</button>
              <button className="secondary-btn" onClick={() => setView('kids')}>Back</button>
            </div>
          </div>
        ) : (
          <div className="game-card">
            <div className="game-banner">
              <h3>Logo {logoRoundIndex + 1} of {logoRound.length}</h3>
              <span className="attempt-badge" style={{ background: 'rgba(69,211,191,0.12)', color: '#45d3bf', borderColor: 'rgba(69,211,191,0.3)' }}>
                {logoScore} correct
              </span>
            </div>
            <div className="game-main">
              <div className="logo-display-card">
                <img
                  src={`https://cdn.simpleicons.org/${current?.slug}`}
                  alt="Brand logo"
                  className="logo-img"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>

              {logoFeedback === null ? (
                <>
                  {logoHintLoading && (
                    <div className="foundry-loading" style={{ padding: '12px 0' }}>
                      <div className="foundry-spinner" />
                      <p className="small">Getting a hint...</p>
                    </div>
                  )}
                  {logoHint && (
                    <div className="logo-hint-box">
                      <p className="small" style={{ margin: 0 }}>💡 {logoHint}</p>
                    </div>
                  )}
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label>What brand is this?</label>
                    <input
                      type="text"
                      value={logoGuess}
                      onChange={(e) => setLogoGuess(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && logoGuess.trim() && submitLogoGuess()}
                      placeholder="Type the brand name..."
                      autoFocus
                    />
                  </div>
                  <div className="actions">
                    <button className="primary-btn" onClick={submitLogoGuess} disabled={!logoGuess.trim()}>Guess!</button>
                    {!logoHint && !logoHintLoading && (
                      <button className="secondary-btn" onClick={fetchLogoHint}>Give me a hint</button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <p className={logoFeedback === 'correct' ? 'success' : 'warning'} style={{ fontSize: '1.1rem', marginBottom: 8 }}>
                    {logoFeedback === 'correct' ? `✓ Correct! It's ${current?.name}!` : `✗ It was ${current?.name}`}
                  </p>
                  <div className="actions">
                    <button className="primary-btn" onClick={nextLogo}>
                      {logoRoundIndex < logoRound.length - 1 ? 'Next logo' : 'See results'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderQuiz = () => (
    <section className="card">
      <div className="exam-topbar">
        <div>
          <p className="eyebrow">{selectedExam.toUpperCase()}</p>
          <h2>{questions[currentQuestion]?.prompt}</h2>
        </div>
        <p>{currentQuestion + 1}/{questions.length}</p>
      </div>
      {questions[currentQuestion]?.type === 'text' || selectedExam === 'kids' ? (
        <div className="form-group">
          <label>Your answer</label>
          <input
            type="text"
            value={answers[currentQuestion] || ''}
            onChange={(e) => selectAnswer(e.target.value)}
            placeholder="Type your answer here"
          />
        </div>
      ) : (
        <div className="options">
          {questions[currentQuestion]?.options.map((option, index) => (
            <button key={option} className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`} onClick={() => selectAnswer(index)}>
              {option}
            </button>
          ))}
        </div>
      )}
      <div className="actions">
        <button className="secondary-btn" onClick={() => setView('exams')}>Back</button>
        <button className="secondary-btn" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((prev) => prev - 1)}>Previous</button>
        {currentQuestion < questions.length - 1 && (
          <button className="primary-btn" onClick={() => setCurrentQuestion((prev) => prev + 1)}>Next</button>
        )}
        <button className="primary-btn" onClick={() => {
          const remaining = questions.length - currentQuestion - 1;
          if (remaining > 0 && !window.confirm(`${remaining} question${remaining === 1 ? '' : 's'} left. Are you sure you want to submit?`)) return;
          submitExam();
        }}>Submit</button>
      </div>
    </section>
  );

  const renderResults = () => (
    <section className="card">
      <h2>Great work!</h2>
      <p>You scored {result?.correct}/{result?.total} ({result?.percentage}%).</p>
      <p className="small">Review the answers below and try again anytime.</p>
      <div className="actions">
        <button className="primary-btn" onClick={() => startExam(selectedExam)}>Retry</button>
        <button className="secondary-btn" onClick={resetFlow}>Back home</button>
      </div>
      <div className="review-list">
        {result?.review?.map((item, index) => (
          <div key={`${item.prompt}-${index}`} className="review-item">
            <h3>{index + 1}. {item.prompt}</h3>
            <p><strong>Your answer:</strong> {item.type === 'text' || selectedExam === 'kids'
              ? (item.selectedAnswer === undefined || item.selectedAnswer === '' ? 'No answer entered' : item.selectedAnswer)
              : (item.selectedAnswer === undefined ? 'No answer selected' : item.options[item.selectedAnswer])}</p>
            <p><strong>Correct answer:</strong> {item.type === 'text' || selectedExam === 'kids' ? item.answerText : item.options[item.answer]}</p>
            <p className={item.isCorrect ? 'success' : 'warning'}>{item.isCorrect ? 'Correct' : 'Needs review'}</p>
            <p className="small">{item.explanation}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const renderPronunciationGame = () => (
    <section className="card">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Kids • Voice game</p>
          <h2>Pronunciation obstacle course</h2>
        </div>
        <button className="secondary-btn" onClick={() => setView('kids')}>Back</button>
      </div>
      {gameCompleted ? (
        <div className="game-celebration">
          <span className="celebration-emoji">🎉</span>
          <h2>You cleared the course!</h2>
          <p>You said <strong>{pronunciationScore} out of {roundWords.length}</strong> words correctly.</p>
          <p>Finished in <strong>{elapsedTime} seconds</strong>.</p>
          <div className="actions">
            <button className="primary-btn" onClick={startPronunciationGame}>Play again</button>
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

  return (
    <div className="app-shell">
      {view === 'home' && renderHome()}
      {view === 'exams' && renderExams()}
      {view === 'kids' && renderKids()}
      {view === 'quiz' && (result ? renderResults() : renderQuiz())}
      {view === 'pronunciationGame' && renderPronunciationGame()}
      {view === 'foundryRiddle' && renderFoundryRiddle()}
      {view === 'photoQuiz' && renderPhotoQuiz()}
      {view === 'logoGuesser' && renderLogoGuesser()}
    </div>
  );
}

export default App;
