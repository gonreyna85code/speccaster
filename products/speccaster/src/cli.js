const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const { generate, writeGenerated } = require('./generate');
const { runDemo } = require('./demo');

const VERSION = require('../package.json').version;

const WORKFLOW_TEMPLATE = `name: speccaster
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
        run: npx -y speccaster@${VERSION} drift --spec openapi.yaml --out speccaster/contract.test.js
      - name: Run contract tests
        env:
          SPECCASTER_BASE_URL: \$\{{ secrets.SPECCASTER_BASE_URL }}
        run: node --test speccaster/contract.test.js
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
    } else if (a === '--version' || a === '-V') {
      opt.version = true;
    } else if (a.startsWith('--')) {
      opt[a.slice(2).replace(/-/g, '_')] = true;
    } else {
      opt._.push(a);
    }
  }
  return opt;
}

const USAGE = `speccaster — zero-config contract tests from your OpenAPI spec

Usage:
  speccaster init   [--spec <file>] [--out <file>] [--base-url <url>] [--force]
  speccaster test    [--spec <file>] [--out <file>] [--base-url <url>]
  speccaster drift   [--spec <file>] [--out <file>] [--base-url <url>]
  speccaster demo

  init   Write the contract test suite (default out: speccaster/contract.test.js)
         and emit .github/workflows/speccaster.yml. Fails if out exists unless --force.
  test   Generate to a temp file and run it (node --test).
  drift  Exit non-zero if out is out of date with the spec. For CI.
  demo   See it work in seconds: ephemeral API + generated suite + drift, no files kept.

Env: SPECCASTER_BASE_URL overrides the server url from the spec.
`;

function runNodeTest(file) {
  const r = spawnSync(process.execPath, ['--test', file], { stdio: 'inherit', env: process.env });
  return r.status === 0 ? 0 : 1;
}

async function main(argv) {
  const opt = parseArgs(argv);
  const cmd = opt._[0] || 'help';
  const spec = opt.spec || 'openapi.yaml';
  const out = opt.out || 'speccaster/contract.test.js';

  if (opt.version || cmd === 'version') return void console.log(require('../package.json').version);
  if (cmd === 'help' || opt.help) return void console.log(USAGE);

  if (cmd === 'init') {
    if (fs.existsSync(out) && !opt.force) {
      throw new Error(out + ' already exists. Use --force to overwrite.');
    }
    const gen = generate({ spec, out, baseUrl: opt.base_url });
    writeGenerated({ content: gen.content, validateSource: gen.validateSource, out });
    const wf = '.github/workflows/speccaster.yml';
    if (fs.existsSync(wf) && !opt.force) {
      console.log('[speccaster] left', wf, 'in place (use --force to refresh it, e.g. to bump the pinned version)');
    } else {
      fs.mkdirSync(path.dirname(wf), { recursive: true });
      fs.writeFileSync(wf, WORKFLOW_TEMPLATE);
      console.log('[speccaster] wrote', wf);
    }
    console.log('[speccaster] wrote', out, `(${gen.content.split('\n').filter((l) => l.trim()).length} lines, ${gen.spec.paths ? Object.keys(gen.spec.paths).length : 0} paths)`);
    console.log('[speccaster] wrote', path.join(path.dirname(out), 'validate.js'), '(the self-contained runtime used by the suite)');
    return 0;
  }

  if (cmd === 'test') {
    const gen = generate({ spec, out, baseUrl: opt.base_url });
    const tmp = path.join(os.tmpdir(), 'speccaster-contract-' + process.pid + '.test.js');
    writeGenerated({ content: gen.content, validateSource: gen.validateSource, out: tmp });
    console.log('[speccaster] running', gen.content.split('\n').filter((l) => l.trim()).length, 'lines of tests');
    return runNodeTest(tmp);
  }

  if (cmd === 'demo') {
    return runDemo();
  }

  if (cmd === 'drift') {
    if (!fs.existsSync(out)) {
      console.error('[speccaster] missing', out, '— run `npx speccaster init` first.');
      return 1;
    }
    const current = fs.readFileSync(out, 'utf8').trim();
    const fresh = generate({ spec, out, baseUrl: opt.base_url }).content.trim();
    if (current === fresh) {
      console.log('[speccaster] OK — contract test suite is in sync with the spec.');
      return 0;
    }
    console.error('[speccaster] DRIFT detected — the spec changed but', out, 'did not. Run `npx speccaster init --force`.');
    return 1;
  }

  console.log(USAGE);
  return 1;
}

module.exports = { main, runNodeTest };