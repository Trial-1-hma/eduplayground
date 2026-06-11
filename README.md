# Agent League — AI-Powered Learning Platform

> **Microsoft Agents League @ AISF 2026 — Battle #1: Creative Apps with GitHub Copilot**
> Submitted by Htet-Myark · License: MIT

An interactive education platform that combines real certification exam practice with four AI-powered kids learning games — no account required, works instantly in the browser.

---

## Features

### Exams
Practice real certification questions with 50 randomised questions per session. Submit at any point mid-exam, or finish all questions — a full answer review with explanations is shown after every submission.

| Exam | Topics Covered |
|---|---|
| AWS Cloud Practitioner | EC2, S3, IAM, pricing, architecture |
| Azure Fundamentals | Core services, governance, security |
| Kubernetes Basics | Pods, deployments, services, networking |
| Docker Essentials | Containers, images, networking, volumes |

### Kids Section — Four AI-Powered Games

#### Pronunciation Obstacle Course
A 10-word voice game powered by the Web Speech API. The browser listens continuously — say the word shown on screen clearly to clear the obstacle and move the runner forward. Skip after 3 wrong attempts. Words are drawn from a 112-word pool, shuffled each round.

#### AI Riddle Challenge ✦ Foundry IQ
Fresh riddles generated live by **Azure AI Foundry** on every play. Pick any topic — animals, space, food, weather — and the model produces a unique riddle with an answer and child-friendly explanation. Never the same puzzle twice.

#### Photo Challenge ✦ Foundry IQ Vision
The game gives a challenge (e.g. *"Find and photograph a mirror"*). The player uses their device camera to snap a photo, which is sent to **gpt-4o-mini vision** via Foundry IQ. The model decides whether the object in the photo matches the challenge, returning a match result and confidence level.

#### Logo Guesser ✦ Foundry IQ
50 real brand logos displayed as icons. Kids type the brand name to score a point. Common shortcuts are accepted — `snap`, `insta`, `chrome`, `coke`, `twitter`, `ps`, `yt` all count as correct answers. Logos are drawn from a verified pool and shuffled 8 per round.

---

## Microsoft Foundry IQ Integration

All AI features connect to **Foundry IQ** — Azure AI Foundry accessed via the GitHub Models endpoint — through a single shared client in `server/services/foundry.js`.

```js
const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});
```

### Three distinct AI capabilities

| Endpoint | Model | What it does |
|---|---|---|
| `POST /api/foundry/riddle` | `gpt-4o-mini` | Generates a structured riddle (prompt, answer, explanation) on a given topic |
| `POST /api/foundry/classify` | `gpt-4o-mini` (vision) | Classifies a base64 camera image against an expected object — returns match + confidence |
| `POST /api/foundry/logo-hint` | `gpt-4o-mini` | Describes a brand logo visually without naming the brand, for use as an in-game hint |

All non-AI features (exams, pronunciation game) work without a token configured.

---

## MCP Server — GitHub Copilot Integration

Agent League ships an **MCP (Model Context Protocol) server** that connects the platform's Foundry IQ features directly into GitHub Copilot Chat inside VS Code.

### Tools exposed to Copilot

| Tool | What you can ask |
|---|---|
| `generate_riddle` | *"Generate a riddle about space"* |
| `generate_logo_hint` | *"Give me a logo hint for Nike"* |
| `list_exams` | *"What exams are available?"* |
| `foundry_status` | *"Is Foundry IQ configured?"* |

### How it works

The `.vscode/mcp.json` file registers the MCP server automatically when the project is opened in VS Code:

```json
{
  "servers": {
    "agent-league": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/server.js"]
    }
  }
}
```

Copilot Chat can then call Foundry IQ tools without leaving the editor.

---

## Architecture

```
┌───────────────────────────────────────────────────┐
│                React Frontend (Vite)               │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌───────┐ │
│  │  Exams   │ │ Voice    │ │ Photo   │ │ Logo  │ │
│  │  (4 tracks)│ │ Game    │ │Challenge│ │Guesser│ │
│  └────┬─────┘ └────┬─────┘ └────┬────┘ └───┬───┘ │
└───────┼────────────┼────────────┼───────────┼─────┘
        │            │ Web        │ Camera    │ CDN
        │ REST API   │ Speech API │ (base64)  │ icons
┌───────▼────────────▼────────────▼───────────┘
│           Node.js + Express Server            │
│                                               │
│  /api/exams/:id/questions                     │
│  /api/foundry/riddle                          │
│  /api/foundry/classify                        │
│  /api/foundry/logo-hint                       │
│                                               │
│  server/services/foundry.js                   │
│  ├── generateRiddle()                         │
│  ├── classifyImage()                          │
│  └── generateLogoHint()                       │
└───────────────────┬───────────────────────────┘
                    │ GITHUB_TOKEN
┌───────────────────▼───────────────────────────┐
│      Azure AI Foundry — Foundry IQ            │
│      models.inference.ai.azure.com            │
│      gpt-4o-mini  (text + vision)             │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│    MCP Server  (mcp/server.js)                │
│    GitHub Copilot Chat ↔ Foundry IQ tools     │
└───────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Node.js, Express |
| AI | Azure AI Foundry (GitHub Models) — `gpt-4o-mini` text + vision |
| MCP | `@modelcontextprotocol/sdk` |
| Speech | Web Speech API (browser-native) |
| Auth / DB | bcryptjs · PostgreSQL (optional, in-memory fallback) |

---

## GitHub Copilot Usage

GitHub Copilot was used throughout the development of this project:

- **Game logic** — Copilot completed the speech recognition continuous-restart loop (`onend` handler), the photo capture canvas pipeline, and the pronunciation game state machine
- **Foundry IQ prompts** — Copilot suggested the system prompt structure for the riddle generator and image classifier, and helped shape the JSON response schemas to be reliably parseable
- **MCP server** — Copilot generated the Zod input schemas and tool handler boilerplate for each of the four MCP tools
- **Debugging** — Copilot Chat identified the root cause of the SVG logo rendering issue (CSS `filter: brightness(0) invert(1)` fix) and the speech recognition permission error handling
- **CSS animations** — Copilot completed the `@keyframes` for `flashCorrect`, `flashWrong`, `celebPop`, and `micPulse` from short descriptions
- **API design** — Copilot proposed the REST endpoint structure for the Foundry IQ features, including the base64 image payload format for the vision endpoint

---

## Local Setup

### Prerequisites
- Node.js 18+
- A GitHub Personal Access Token (classic) with access to GitHub Models

### 1. Clone and install
```bash
git clone <your-repo-url>
cd agent-league
npm install        # installs client, server, and mcp workspaces
```

### 2. Configure Foundry IQ
```bash
# Create server/.env
echo "GITHUB_TOKEN=ghp_your_token_here" > server/.env
```

Get a token at [github.com/settings/tokens](https://github.com/settings/tokens). GitHub Models access is included on free accounts.

### 3. Run
```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

> Use Chrome or Edge for the Pronunciation Game — the Web Speech API requires a Chromium browser.

### 4. MCP Server
Open the project folder in VS Code with GitHub Copilot installed. The MCP server connects automatically via `.vscode/mcp.json`.

To test the MCP server from the terminal:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp/server.js
```

---

## Project Structure

```
agent-league/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── App.jsx          # All views, game logic, state
│       └── styles.css       # Dark-theme design system
├── server/                  # Express.js API server
│   ├── server.js            # Routes
│   ├── services/
│   │   └── foundry.js       # Foundry IQ client (riddle · vision · hint)
│   └── data/
│       └── questions.js     # Exam question bank (AWS · Azure · K8s · Docker)
├── mcp/                     # MCP server for GitHub Copilot
│   └── server.js
├── .vscode/
│   └── mcp.json             # Copilot MCP registration
└── README.md
```

---

## Contest Compliance

| Requirement | Status |
|---|---|
| Public GitHub repository | ✅ |
| MIT License | ✅ |
| README with architecture | ✅ |
| GitHub Copilot usage documented | ✅ |
| Microsoft IQ — Foundry IQ | ✅ Riddle generation · Vision classification · Logo hints |
| MCP Server for Copilot | ✅ 4 tools registered via `.vscode/mcp.json` |
| Creative application | ✅ AI-powered kids games + certification exam practice |
| Track | Battle #1 — Creative Apps |

---

## Security

- `GITHUB_TOKEN` is stored in `server/.env` and never sent to the client
- `.env` is listed in `.gitignore`
- No user data is logged or persisted beyond the session unless a database is configured
- All Foundry IQ calls are made server-side

---

## License

MIT — see [LICENSE](LICENSE) for full text.
