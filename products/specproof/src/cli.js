const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const { generate, writeGenerated } = require('./generate');

const WORKFLOW_TEMPLATE = `name: specproof
on:
  pull_request:
  push:
    branches: [main]

jobs:
  contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      # Optionally spin up your API here (docker-compose / npm start)
      - name: Regenerate + drift gate
        run: npx -y specproof@latest drift --spec openapi.yaml --out specproof/contract.test.js
      - name: Run contract tests
        env:
          SPECPROOF_BASE_URL: \$\{{ secrets.SPECPROOF_BASE_URL }}
        run: node --test specproof/contract.test.js
`;

function parseArgs(argv) {
  const opt = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--spec' || a === '--out' || a === '--base-url') {
      opt[a.slice(2).replace(/-/g, '_')] = argv[++i];
    } else if (a === '--force') {
      opt.force = true;
    } else if (a === '--help' || a === '-h') {
      opt.help = true;
    } else if (a.startsWith('--')) {
      opt[a.slice(2).replace(/-/g, '_')] = true;
    } else {
      opt._.push(a);
    }
  }
  return opt;
}

const USAGE = `specproof — zero-config contract tests from your OpenAPI spec

Usage:
  specproof init   [--spec <file>] [--out <file>] [--base-url <url>] [--force]
  specproof test    [--spec <file>] [--out <file>] [--base-url <url>]
  specproof drift   [--spec <file>] [--out <file>] [--base-url <url>]

  init   Write the contract test suite (default out: specproof/contract.test.js)
         and emit .github/workflows/specproof.yml. Fails if out exists unless --force.
  test   Generate to a temp file and run it (node --test).
  drift  Exit non-zero if out is out of date with the spec. For CI.

Env: SPECPROOF_BASE_URL overrides the server url from the spec.
`;

function runNodeTest(file) {
  const r = spawnSync(process.execPath, ['--test', file], { stdio: 'inherit', env: process.env });
  return r.status === 0 ? 0 : 1;
}

async function main(argv) {
  const opt = parseArgs(argv);
  const cmd = opt._[0] || 'help';
  const spec = opt.spec || 'openapi.yaml';
  const out = opt.out || 'specproof/contract.test.js';

  if (cmd === 'help' || opt.help) return void console.log(USAGE);
  if (cmd === 'version') return void console.log(require('../package.json').version);

  if (cmd === 'init') {
    if (fs.existsSync(out) && !opt.force) {
      throw new Error(out + ' already exists. Use --force to overwrite.');
    }
    const gen = generate({ spec, out, baseUrl: opt.base_url });
    writeGenerated({ content: gen.content, out });
    fs.mkdirSync('.github/workflows', { recursive: true });
    fs.writeFileSync('.github/workflows/specproof.yml', WORKFLOW_TEMPLATE);
    console.log('[specproof] wrote', out, `(${gen.content.split('\n').filter((l) => l.trim()).length} lines, ${gen.spec.paths ? Object.keys(gen.spec.paths).length : 0} paths)`);
    console.log('[specproof] wrote .github/workflows/specproof.yml');
    return 0;
  }

  if (cmd === 'test') {
    const gen = generate({ spec, out, baseUrl: opt.base_url });
    const tmp = path.join(os.tmpdir(), 'specproof-contract.test.js');
    writeGenerated({ content: gen.content, out: tmp });
    console.log('[specproof] running', gen.content.split('\n').filter((l) => l.trim()).length, 'lines of tests');
    return runNodeTest(tmp);
  }

  if (cmd === 'drift') {
    if (!fs.existsSync(out)) {
      console.error('[specproof] missing', out, '— run `npx specproof init` first.');
      return 1;
    }
    const current = fs.readFileSync(out, 'utf8').trim();
    const fresh = generate({ spec, out, baseUrl: opt.base_url }).content.trim();
    if (current === fresh) {
      console.log('[specproof] OK — contract test suite is in sync with the spec.');
      return 0;
    }
    console.error('[specproof] DRIFT detected — the spec changed but', out, 'did not. Run `npx specproof init --force`.');
    return 1;
  }

  console.log(USAGE);
  return 1;
}

module.exports = { main, runNodeTest };