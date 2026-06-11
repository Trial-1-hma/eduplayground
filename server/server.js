import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { questionTemplates } from './data/questions.js';
import { isFoundryConfigured, generateRiddle, randomTopic, classifyImage, generateLogoHint } from './services/foundry.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const useInMemoryStore = !process.env.DATABASE_URL;
const memoryUsers = [];

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  if (useInMemoryStore) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function getUserByEmail(email) {
  if (useInMemoryStore) {
    return memoryUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function createUser(name, email, passwordHash) {
  if (useInMemoryStore) {
    const user = { id: Date.now(), name, email, password_hash: passwordHash, attempts: [] };
    memoryUsers.push(user);
    return user;
  }

  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, passwordHash]
  );
  return result.rows[0];
}

async function getUserById(userId) {
  if (useInMemoryStore) {
    return memoryUsers.find((user) => user.id === Number(userId));
  }

  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

await initDb();

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'Server running', foundryIq: isFoundryConfigured() });
});

app.post('/api/foundry/riddle', async (req, res) => {
  if (!isFoundryConfigured()) {
    return res.status(503).json({
      error: 'Foundry IQ is not configured.',
      hint: 'Add AZURE_AI_FOUNDRY_ENDPOINT, AZURE_AI_API_KEY, and AZURE_DEPLOYMENT_NAME to server/.env',
    });
  }
  const topic = req.body?.topic || randomTopic();
  try {
    const riddle = await generateRiddle(topic);
    res.json({ riddle });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate riddle. Check your Foundry configuration.' });
  }
});

app.post('/api/foundry/classify', async (req, res) => {
  if (!isFoundryConfigured()) {
    return res.status(503).json({
      error: 'Foundry IQ is not configured.',
      hint: 'Add GITHUB_TOKEN to server/.env',
    });
  }
  const { imageBase64, mimeType, expectedAnswer } = req.body;
  if (!imageBase64 || !expectedAnswer) {
    return res.status(400).json({ error: 'imageBase64 and expectedAnswer are required.' });
  }
  try {
    const result = await classifyImage(imageBase64, mimeType || 'image/jpeg', expectedAnswer);
    res.json(result);
  } catch (err) {
    console.error('classifyImage error:', err.message);
    res.status(500).json({ error: 'Image classification failed. Please try again.' });
  }
});

app.post('/api/foundry/logo-hint', async (req, res) => {
  if (!isFoundryConfigured()) {
    return res.status(503).json({ error: 'Foundry IQ is not configured. Add GITHUB_TOKEN to server/.env' });
  }
  const { brandName } = req.body;
  if (!brandName) return res.status(400).json({ error: 'brandName is required.' });
  try {
    const hint = await generateLogoHint(brandName);
    res.json({ hint });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate hint. Please try again.' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, passwordHash);
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/exams', (_req, res) => {
  res.json({
    exams: [
      { id: 'aws', title: 'AWS Cloud Practitioner', description: 'Core AWS services, security, pricing, and architecture.' },
      { id: 'azure', title: 'Azure Fundamentals', description: 'Core Azure services, governance, and security.' },
      { id: 'kubernetes', title: 'Kubernetes Basics', description: 'Pods, deployments, services, and networking.' },
      { id: 'docker', title: 'Docker Essentials', description: 'Containers, images, networking, and volumes.' },
      { id: 'kids', title: 'Kids Riddle Quiz', description: 'Fun 10-question riddles with simple clues and answers for children.' },
    ],
  });
});

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildQuestionSet(examId) {
  const baseQuestions = questionTemplates[examId] || [];
  if (!baseQuestions.length) return [];

  const questionPool = Array.from({ length: 50 }, (_, index) => {
    const base = baseQuestions[index % baseQuestions.length];
    return {
      ...base,
      prompt: base.prompt,
      explanation: base.explanation,
    };
  });

  return shuffleArray(questionPool);
}

app.get('/api/exams/:examId/questions', (req, res) => {
  const { examId } = req.params;
  const questions = buildQuestionSet(examId);
  const limited = examId === 'kids' ? questions.slice(0, 10) : questions;
  res.json({ questions: limited });
});

app.get('/api/users/:userId/records', async (req, res) => {
  const user = await getUserById(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ records: user.attempts || [] });
});

app.post('/api/exams/:examId/submit', async (req, res) => {
  const { examId } = req.params;
  const { userId, score, total, percentage, review } = req.body;
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const attempt = {
    id: Date.now(),
    examId,
    score,
    total,
    percentage,
    completedAt: new Date().toISOString(),
    review,
  };

  user.attempts = user.attempts || [];
  user.attempts.push(attempt);

  res.json({ success: true, records: user.attempts });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
