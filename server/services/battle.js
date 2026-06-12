import { WebSocketServer } from 'ws';
import { battleWords } from '../data/battleWords.js';

const MAX_HP = 100;
const HIT_DAMAGE = 10;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O to avoid confusion

const rooms = new Map(); // code -> { code, players: [player, player] }

function normalize(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function randomWord() {
  return battleWords[Math.floor(Math.random() * battleWords.length)];
}

function randomCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function send(ws, type, payload = {}) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

function opponentOf(room, player) {
  return room.players.find((p) => p !== player);
}

function startRound(room) {
  room.players.forEach((player) => {
    player.hp = MAX_HP;
    player.word = randomWord();
    player.wantsRematch = false;
  });
  room.players.forEach((player) => {
    const opponent = opponentOf(room, player);
    send(player.ws, 'start', {
      opponentName: opponent.name,
      clue: player.word.clue,
      myHp: player.hp,
      oppHp: opponent.hp,
    });
  });
}

function leaveRoom(ws) {
  const room = ws.battleRoom;
  if (!room) return;
  const player = room.players.find((p) => p.ws === ws);
  room.players = room.players.filter((p) => p.ws !== ws);
  ws.battleRoom = null;
  if (room.players.length === 0) {
    rooms.delete(room.code);
  } else if (player) {
    room.players.forEach((p) => send(p.ws, 'opponentLeft'));
  }
}

export function setupBattleServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/battle' });

  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      const room = ws.battleRoom;
      const player = room?.players.find((p) => p.ws === ws);

      if (msg.type === 'create') {
        if (room) leaveRoom(ws);
        const code = randomCode();
        const newRoom = { code, players: [{ ws, name: String(msg.name || 'Player 1').slice(0, 20), hp: MAX_HP, word: null, wantsRematch: false }] };
        rooms.set(code, newRoom);
        ws.battleRoom = newRoom;
        send(ws, 'created', { code });
        return;
      }

      if (msg.type === 'join') {
        if (room) leaveRoom(ws);
        const code = String(msg.code || '').trim().toUpperCase();
        const target = rooms.get(code);
        if (!target) {
          send(ws, 'error', { message: 'Room not found. Check the code and try again.' });
          return;
        }
        if (target.players.length >= 2) {
          send(ws, 'error', { message: 'That room is already full.' });
          return;
        }
        target.players.push({ ws, name: String(msg.name || 'Player 2').slice(0, 20), hp: MAX_HP, word: null, wantsRematch: false });
        ws.battleRoom = target;
        startRound(target);
        return;
      }

      if (!room || !player) return;
      const opponent = opponentOf(room, player);

      if (msg.type === 'answer') {
        if (!player.word || !opponent || player.hp <= 0 || opponent.hp <= 0) return;
        if (normalize(msg.text) === normalize(player.word.word)) {
          opponent.hp = Math.max(0, opponent.hp - HIT_DAMAGE);
          const finished = opponent.hp <= 0;
          const hitWord = player.word.word;
          player.word = randomWord();
          send(player.ws, 'hit', {
            word: hitWord,
            myHp: player.hp,
            oppHp: opponent.hp,
            clue: player.word.clue,
            won: finished,
          });
          send(opponent.ws, 'gotHit', {
            word: hitWord,
            byName: player.name,
            myHp: opponent.hp,
            oppHp: player.hp,
            lost: finished,
          });
        } else {
          send(player.ws, 'miss', { guess: String(msg.text || '') });
        }
        return;
      }

      if (msg.type === 'rematch') {
        if (!opponent) return;
        player.wantsRematch = true;
        send(opponent.ws, 'rematchRequested');
        if (opponent.wantsRematch) {
          startRound(room);
        }
        return;
      }
    });

    ws.on('close', () => leaveRoom(ws));
  });

  return wss;
}
