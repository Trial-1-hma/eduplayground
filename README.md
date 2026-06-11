# Agent League — AI-Powered Learning Platform

> **Microsoft Agents League @ AISF 2026 — Creative Apps Track**
> Submitted by Htet-Myark · License: MIT

An interactive learning platform for kids and certification seekers. Kids use their **voice** to play a pronunciation obstacle game powered by the Web Speech API, while learners practice AWS, Azure, Kubernetes, and Docker exam questions with instant review.

---

## Features

### Kids section
- **Pronunciation obstacle game** — 100-word pool, 10 random words per round. Say each word out loud; the game listens continuously, animates correct/wrong/skip feedback, and the runner slides along the progress track as you clear each obstacle.
- **Kids riddle quiz** — 10 riddle-style questions answered in plain text with full explanations after submission.

### Exam prep
- Practice exams for AWS Cloud Practitioner, Azure Fundamentals, Kubernetes, and Docker.
- 50 shuffled questions per session drawn from a curated question bank.
- Full answer review with explanations after submission.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              React Frontend (Vite)           │
│  ┌──────────────┐   ┌──────────────────────┐ │
│  │  Exam quizzes│   │  Voice game          │ │
│  │  Kids quiz   │   │  Web Speech API      │ │
│  └──────┬───────┘   └──────────────────────┘ │
└─────────┼───────────────────────────────────┘
          │ REST API (fetch)
┌─────────▼───────────────────────────────────┐
│           Node.js + Express Server           │
│  /api/exams        — exam list               │
│  /api/exams/:id/questions — question bank    │
│  /api/register, /api/login — auth            │
│  ┌──────────────────────────────────────┐    │
│  │  server/data/questions.js            │    │
│  │  (kids, aws, azure, k8s, docker)     │    │
│  └──────────────────────────────────────┘    │
│  PostgreSQL (prod) / in-memory (dev)         │
└─────────────────────────────────────────────┘

Microsoft IQ Layer (Foundry IQ — active):
  POST /api/foundry/riddle  →  AzureOpenAI (Foundry endpoint)
    system prompt grounds the model on factual accuracy
    returns riddle + answer + explanation + source citation
  UI: Kids section → AI Riddle Challenge card
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Node.js, Express |
| Speech | Web Speech API (browser-native) |
| Database | PostgreSQL via `pg` (in-memory fallback for dev) |
| Auth | bcryptjs password hashing |
| Hosting target | Vercel (frontend) + Railway/Render (server) |

---

## Local setup

```bash
# 1. Install root and client dependencies
npm install
cd client && npm install && cd ..

# 2. Create server/.env
echo "PORT=5000" > server/.env
# Optional: add DATABASE_URL=postgresql://... for persistent storage

# 3. Start backend (port 5000)
cd server && node server.js &

# 4. Start frontend (port 5173)
cd client && npm run dev
```

Open `http://localhost:5173` in Chrome (required for Web Speech API).

---

## Foundry IQ setup

The **AI Riddle Challenge** feature calls Azure AI Foundry to generate grounded, cited riddles on demand.

1. Go to [ai.azure.com](https://ai.azure.com) and create a project.
2. Deploy a model (e.g. `gpt-4o` or `gpt-35-turbo`).
3. Copy the endpoint, API key, and deployment name.
4. Create `server/.env` from the example file:

```bash
cp server/.env.example server/.env
# fill in the three AZURE_* values
```

The feature shows a configuration error message if the env vars are missing — all other features work without Azure.

---

## Contest compliance

| Requirement | Status |
|---|---|
| Public GitHub repository | ✅ |
| MIT License | ✅ |
| README with project description | ✅ |
| Architecture diagram | ✅ (above) |
| Demo video | link TBD |
| Microsoft IQ integration | ✅ Foundry IQ — AI Riddle Challenge (`/api/foundry/riddle`) |
| Track | Creative Apps |

---

## License

MIT — see [LICENSE](LICENSE) for full text.
