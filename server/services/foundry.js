import OpenAI from 'openai';

export function isFoundryConfigured() {
  return Boolean(process.env.GITHUB_TOKEN);
}

function getClient() {
  if (!process.env.GITHUB_TOKEN) return null;
  return new OpenAI({
    baseURL: 'https://models.inference.ai.azure.com',
    apiKey: process.env.GITHUB_TOKEN,
  });
}

const RIDDLE_TOPICS = [
  'animals', 'nature', 'food and fruit', 'vehicles and transport',
  'weather and sky', 'plants and trees', 'space and planets',
  'everyday household objects', 'school supplies', 'sports and games',
];

export function randomTopic() {
  return RIDDLE_TOPICS[Math.floor(Math.random() * RIDDLE_TOPICS.length)];
}

export async function classifyImage(imageBase64, mimeType, expectedAnswer) {
  const client = getClient();
  if (!client) throw new Error('GitHub token not configured. Add GITHUB_TOKEN to server/.env');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
          {
            type: 'text',
            text: `Look at this image. Does it show a "${expectedAnswer}"?
Respond with valid JSON only — no extra text:
{
  "detected": "describe the main subject in 2-4 words",
  "matches": true or false,
  "confidence": "high", "medium", or "low"
}`,
          },
        ],
      },
    ],
    max_tokens: 120,
  });

  const text = completion.choices[0].message.content.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Model returned unexpected format.');
  return JSON.parse(jsonMatch[0]);
}

export async function generateRiddle(topic = 'everyday objects') {
  const client = getClient();
  if (!client) throw new Error('GitHub token not configured. Add GITHUB_TOKEN to server/.env');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a creative educator generating child-friendly riddles for kids aged 5-10.
Respond ONLY with valid JSON using exactly these fields — no extra text:
{
  "prompt": "the riddle as a fun, engaging question",
  "answerText": "one or two word answer",
  "explanation": "one friendly sentence a child would understand",
  "topic": "the subject area of this riddle"
}
Rules: factually accurate, age-appropriate, short answer, fun phrasing.`,
      },
      {
        role: 'user',
        content: `Generate one riddle about: ${topic}`,
      },
    ],
    temperature: 0.85,
    max_tokens: 256,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  return {
    ...parsed,
    type: 'text',
    source: 'GitHub Models (Azure AI infrastructure) — Foundry IQ',
    model: completion.model,
  };
}
