// Lightweight corpus-driven robustness sweep (P0/P5). Not part of `npm test`:
// it needs network access to download public OpenAPI specs.
//
// Usage:
//   node scripts/robustness.js            # download + generate each corpus spec
//   node scripts/robustness.js --offline  # use files already in tests/spec-corpus/tmp
//
// On any spec that fails to generate, it prompts you to create a minimal
// regression fixture under tests/spec-corpus/fixtures/ (and to add it to
// scripts/e2e.js). Every failure is a permanent regression test, not noise.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { generate, writeGenerated } = require('../src/generate');

async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tests', 'spec-corpus', 'manifest.json'), 'utf8'));
  const tmp = path.join(__dirname, '..', 'tests', 'spec-corpus', 'tmp');
  fs.mkdirSync(tmp, { recursive: true });
  const offline = process.argv.includes('--offline');
  let failures = 0;
  for (const s of manifest) {
    const file = path.join(tmp, s.id + '.json');
    if (!offline || !fs.existsSync(file)) {
      try {
        const r = await fetch(s.url, { redirect: 'follow' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        fs.writeFileSync(file, await r.text());
      } catch (e) {
        console.log('  SKIP ' + s.id + ' (download failed: ' + e.message + ')');
        continue;
      }
    }
    const outFile = path.join(tmp, s.id + '.test.js');
    try {
      const gen = generate({ spec: file, out: outFile });
      writeGenerated({ content: gen.content, out: outFile });
      const ops = (gen.content.match(/^test\(/gm) || []).length;
      console.log('  ok   ' + s.id + ' — ' + s.paths + ' paths, ' + ops + ' operations generated, ' + gen.content.split('\n').filter((l) => l.trim()).length + ' lines');
    } catch (e) {
      failures++;
      console.error('  FAIL ' + s.id + ' — ' + e.message);
    }
  }
  console.log(failures ? 'ROBUSTNESS: ' + failures + ' failure(s) — create minimal fixtures from the failing spec' : 'ROBUSTNESS: all corpus specs generate clean');
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });