import { chromium } from 'playwright';
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
let lastRoundId = null;
page.on('response', async (r) => {
  if (r.url().endsWith('/api/karaoke/round') && r.status() === 200) {
    try { lastRoundId = (await r.json()).roundId; } catch {}
  }
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto('http://localhost:3000');
await page.getByRole('button', { name: 'Play Blind Karaoke' }).click();
const intro = await page.locator('.game-main p').first().innerText();
console.log(`intro mentions 10s clip: ${intro.includes('10-second')}`);
await page.getByRole('button', { name: '🎵 Start guessing' }).click();
await page.waitForSelector('.karaoke-disc', { timeout: 30000 });
const btn = await page.getByRole('button', { name: /Play 10-second clip/ }).count();
const timerChip = await page.locator('text=/⏱/').count();
console.log(`playing view: 10s button=${btn === 1}, live timer chip=${timerChip === 1}`);

// wrong guess: no stage system, just retry feedback
await page.getByPlaceholder('What song is this?').fill('wrong song');
await page.getByRole('button', { name: 'Guess', exact: true }).click();
await page.waitForSelector('text=/Not it — listen again/');
console.log('wrong guess: retry feedback shown, no stage change');

// finish 5 rounds: round 1 correct (via server reveal), rest give up
const res = await fetch('http://localhost:5000/api/karaoke/reveal', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roundId: lastRoundId }),
});
const answer = (await res.json()).title;
await page.getByPlaceholder('What song is this?').fill(answer);
await page.getByRole('button', { name: 'Guess', exact: true }).click();
await page.waitForSelector('text=/Correct! \+1 point/');
console.log('correct guess: +1 point');

for (let round = 2; round <= 5; round += 1) {
  await page.getByRole('button', { name: 'Next song' }).click();
  await page.waitForSelector('.karaoke-disc', { timeout: 30000 });
  await page.getByPlaceholder('What song is this?').fill('nope');
  await page.getByRole('button', { name: 'Guess', exact: true }).click();
  await page.getByRole('button', { name: '🏳️ Give up & reveal' }).click();
  await page.waitForSelector('text=Better luck on the next one!');
}
await page.getByRole('button', { name: 'See results' }).click();
await page.waitForSelector('text=Game over!');
const lines = await page.locator('.game-celebration p').allInnerTexts();
console.log(`game over: ${JSON.stringify(lines)}`);
await page.screenshot({ path: 'verify-shots/10-karaoke-results.png' });

// record persists: back to intro shows the saved best
await page.getByRole('button', { name: 'Back home' }).click();
await page.getByRole('button', { name: 'Play Blind Karaoke' }).click();
const recordLine = await page.locator('text=/Your record:/').innerText();
console.log(`record persisted on intro: "${recordLine}"`);

console.log(`ERRORS: ${errors.length === 0 ? 'none' : '\n' + errors.join('\n')}`);
await browser.close();
