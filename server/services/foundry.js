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

export async function generateLogoHint(brandName) {
  const client = getClient();
  if (!client) throw new Error('GitHub token not configured. Add GITHUB_TOKEN to server/.env');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You give child-friendly hints about a brand's logo without naming the brand.
Describe the logo's colors, shape or symbol, and what the company does in 2-3 short sentences.
Never say the brand name. Keep it fun and simple for kids aged 5-12.
Respond with JSON only: { "hint": "..." }`,
      },
      { role: 'user', content: `Give a hint for the brand: ${brandName}` },
    ],
    max_tokens: 150,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  return parsed.hint;
}

const STORY_SYSTEM_PROMPT = `You are a gentle bedtime storyteller for children aged 4-9.
You write soothing bedtime stories in parts. Every paragraph MUST be 70 to 90 words long — this is required so the story is long enough to read aloud.
Rules:
- Simple, warm language a young child understands. Short sentences.
- A gentle adventure with no scary moments, no villains who stay mean, and nothing sad.
Respond ONLY with valid JSON — no extra text.`;

export async function generateBedtimeStory(choices) {
  const client = getClient();
  if (!client) throw new Error('GitHub token not configured. Add GITHUB_TOKEN to server/.env');

  const { hero, trait, place, friend, magic } = choices;

  const setupMessage = `Tonight's story uses these choices the child picked:
- The hero is: ${hero}
- The hero's personality is: ${trait}
- The story happens in: ${place}
- The hero's best friend is: ${friend}
- The magical thing in the story is: ${magic}

Write the FIRST HALF of the story: exactly 8 paragraphs of 70-90 words each.
Introduce the hero and friend, begin a gentle adventure, and stop in the middle of the adventure (do not wrap up).
Respond with JSON: { "title": "a short magical story title", "paragraphs": ["...", ... 8 paragraphs] }`;

  const firstCompletion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: STORY_SYSTEM_PROMPT },
      { role: 'user', content: setupMessage },
    ],
    temperature: 0.9,
    max_tokens: 2500,
    response_format: { type: 'json_object' },
  });

  const firstPart = JSON.parse(firstCompletion.choices[0].message.content);
  if (!firstPart.title || !Array.isArray(firstPart.paragraphs) || firstPart.paragraphs.length === 0) {
    throw new Error('Model returned unexpected story format.');
  }

  const secondCompletion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: STORY_SYSTEM_PROMPT },
      { role: 'user', content: setupMessage },
      { role: 'assistant', content: JSON.stringify(firstPart) },
      {
        role: 'user',
        content: `Now write the SECOND HALF: exactly 8 more paragraphs of 70-90 words each, continuing right where the story stopped.
Finish the adventure happily, then make the last 3 paragraphs calmer and sleepier, ending with the hero falling asleep safe and cozy.
Respond with JSON: { "paragraphs": ["...", ... 8 paragraphs] }`,
      },
    ],
    temperature: 0.9,
    max_tokens: 2500,
    response_format: { type: 'json_object' },
  });

  const secondPart = JSON.parse(secondCompletion.choices[0].message.content);
  if (!Array.isArray(secondPart.paragraphs) || secondPart.paragraphs.length === 0) {
    throw new Error('Model returned unexpected story format.');
  }

  return {
    title: firstPart.title,
    paragraphs: [...firstPart.paragraphs, ...secondPart.paragraphs],
    source: 'GitHub Models (Azure AI infrastructure) — Foundry IQ',
    model: firstCompletion.model,
  };
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
