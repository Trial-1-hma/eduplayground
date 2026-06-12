import { randomUUID } from 'crypto';

// Well-known songs (moderately popular or above) across decades and genres.
const SONGS = [
  { title: 'Shape of You', artist: 'Ed Sheeran' },
  { title: 'Perfect', artist: 'Ed Sheeran' },
  { title: 'Photograph', artist: 'Ed Sheeran' },
  { title: 'Thinking Out Loud', artist: 'Ed Sheeran' },
  { title: 'Blinding Lights', artist: 'The Weeknd' },
  { title: 'Bohemian Rhapsody', artist: 'Queen' },
  { title: 'We Will Rock You', artist: 'Queen' },
  { title: 'Billie Jean', artist: 'Michael Jackson' },
  { title: 'Beat It', artist: 'Michael Jackson' },
  { title: 'Rolling in the Deep', artist: 'Adele' },
  { title: 'Someone Like You', artist: 'Adele' },
  { title: 'Hello', artist: 'Adele' },
  { title: 'Uptown Funk', artist: 'Mark Ronson Bruno Mars' },
  { title: 'Happy', artist: 'Pharrell Williams' },
  { title: 'Shake It Off', artist: 'Taylor Swift' },
  { title: 'Blank Space', artist: 'Taylor Swift' },
  { title: 'Bad Guy', artist: 'Billie Eilish' },
  { title: 'Despacito', artist: 'Luis Fonsi' },
  { title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
  { title: 'Sweet Child O Mine', artist: 'Guns N Roses' },
  { title: 'Hotel California', artist: 'Eagles' },
  { title: 'Imagine', artist: 'John Lennon' },
  { title: 'Let It Be', artist: 'The Beatles' },
  { title: 'Hey Jude', artist: 'The Beatles' },
  { title: 'Dancing Queen', artist: 'ABBA' },
  { title: 'Mamma Mia', artist: 'ABBA' },
  { title: 'Wonderwall', artist: 'Oasis' },
  { title: 'Viva La Vida', artist: 'Coldplay' },
  { title: 'Fix You', artist: 'Coldplay' },
  { title: 'Counting Stars', artist: 'OneRepublic' },
  { title: 'Radioactive', artist: 'Imagine Dragons' },
  { title: 'Believer', artist: 'Imagine Dragons' },
  { title: 'Thunder', artist: 'Imagine Dragons' },
  { title: 'Stay With Me', artist: 'Sam Smith' },
  { title: 'All of Me', artist: 'John Legend' },
  { title: 'Roar', artist: 'Katy Perry' },
  { title: 'Firework', artist: 'Katy Perry' },
  { title: 'Call Me Maybe', artist: 'Carly Rae Jepsen' },
  { title: 'Poker Face', artist: 'Lady Gaga' },
  { title: 'Bad Romance', artist: 'Lady Gaga' },
  { title: 'Halo', artist: 'Beyonce' },
  { title: 'Umbrella', artist: 'Rihanna' },
  { title: 'Diamonds', artist: 'Rihanna' },
  { title: 'Senorita', artist: 'Shawn Mendes Camila Cabello' },
  { title: 'Havana', artist: 'Camila Cabello' },
  { title: 'Levitating', artist: 'Dua Lipa' },
  { title: 'Dont Start Now', artist: 'Dua Lipa' },
  { title: 'Watermelon Sugar', artist: 'Harry Styles' },
  { title: 'As It Was', artist: 'Harry Styles' },
  { title: 'drivers license', artist: 'Olivia Rodrigo' },
  { title: 'good 4 u', artist: 'Olivia Rodrigo' },
  { title: 'Stay', artist: 'The Kid LAROI Justin Bieber' },
  { title: 'Sorry', artist: 'Justin Bieber' },
  { title: 'Love Yourself', artist: 'Justin Bieber' },
  { title: 'Dynamite', artist: 'BTS' },
  { title: 'Butter', artist: 'BTS' },
  { title: 'Gangnam Style', artist: 'PSY' },
  { title: 'Faded', artist: 'Alan Walker' },
  { title: 'Closer', artist: 'The Chainsmokers' },
  { title: 'Cheap Thrills', artist: 'Sia' },
  { title: 'Chandelier', artist: 'Sia' },
  { title: 'Lose Yourself', artist: 'Eminem' },
  { title: 'Take On Me', artist: 'a-ha' },
  { title: 'I Will Always Love You', artist: 'Whitney Houston' },
  { title: 'My Heart Will Go On', artist: 'Celine Dion' },
  { title: 'Girls Like You', artist: 'Maroon 5' },
  { title: 'Sugar', artist: 'Maroon 5' },
  { title: 'Memories', artist: 'Maroon 5' },
  { title: 'Flowers', artist: 'Miley Cyrus' },
  { title: 'Wrecking Ball', artist: 'Miley Cyrus' },
  { title: 'See You Again', artist: 'Wiz Khalifa Charlie Puth' },
  { title: 'Old Town Road', artist: 'Lil Nas X' },
  { title: 'Let Her Go', artist: 'Passenger' },
  { title: 'Titanium', artist: 'David Guetta Sia' },
  { title: 'Hips Dont Lie', artist: 'Shakira' },
  { title: 'Waka Waka', artist: 'Shakira' },
];

const ROUND_TTL_MS = 30 * 60 * 1000;
const rounds = new Map(); // roundId -> { title, artist, artwork, createdAt }

function normalizeForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\bfeat\..*$/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function pruneRounds() {
  const cutoff = Date.now() - ROUND_TTL_MS;
  for (const [id, round] of rounds) {
    if (round.createdAt < cutoff) rounds.delete(id);
  }
}

async function lookupPreview(song) {
  const term = encodeURIComponent(`${song.title} ${song.artist}`);
  const res = await fetch(`https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`);
  if (!res.ok) throw new Error(`iTunes lookup failed (${res.status})`);
  const data = await res.json();
  const match = (data.results || []).find((r) => r.previewUrl);
  if (!match) throw new Error(`No preview found for ${song.title}`);
  return match;
}

export async function createKaraokeRound(excludeTitles = []) {
  const excluded = new Set(excludeTitles.map(normalizeForMatch));
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const song = SONGS[Math.floor(Math.random() * SONGS.length)];
    if (excluded.has(normalizeForMatch(song.title))) continue;
    try {
      const track = await lookupPreview(song);
      const roundId = randomUUID();
      rounds.set(roundId, {
        title: song.title,
        artist: track.artistName || song.artist,
        artwork: (track.artworkUrl100 || '').replace('100x100', '300x300'),
        createdAt: Date.now(),
      });
      pruneRounds();
      return { roundId, previewUrl: track.previewUrl };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Could not pick a song.');
}

function revealOf(round) {
  return { title: round.title, artist: round.artist, artwork: round.artwork };
}

export function checkKaraokeGuess(roundId, guess) {
  const round = rounds.get(roundId);
  if (!round) return null;
  const target = normalizeForMatch(round.title);
  const attempt = normalizeForMatch(guess);
  const correct = attempt.length > 0 && (
    attempt === target
    || (attempt.length >= 4 && target.includes(attempt) && attempt.length >= target.length * 0.6)
    || (target.length >= 4 && attempt.includes(target))
  );
  return correct ? { correct: true, ...revealOf(round) } : { correct: false };
}

export function revealKaraokeRound(roundId) {
  const round = rounds.get(roundId);
  return round ? revealOf(round) : null;
}
