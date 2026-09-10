const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'specproof.js');
const SPEC = path.join(ROOT, 'test', 'fixtures', 'petstore.yaml');
const OUT = path.join(os.tmpdir(), 'specproof-e2e-' + process.pid + '-contract.test.js');
const PORT = 39000 + Math.floor(Math.random() * 900);
const BASE_URL = 'http://localhost:' + PORT + '/v1';

const { spawn } = require('child_process');
const serverChild = spawn(process.execPath, [path.join(ROOT, 'test', 'fixtures', 'standalone-server.js')], {
  stdio: ['ignore', 'pipe', 'inherit'],
  env: { ...process.env, PORT: PORT },
});

let failures = 0;
function step(name, fn) {
  try {
    fn();
    console.log('  ok   ' + name);
  } catch (e) {
    failures++;
    console.error('  FAIL ' + name + ' — ' + e.message);
  }
}

function cli(args, env) {
  const r = spawnSync(process.execPath, [BIN].concat(args), { encoding: 'utf8', env: { ...process.env, ...env } });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

setTimeout(() => {
  step('init writes generated suite', () => {
    const r = cli(['init', '--spec', SPEC, '--out', OUT, '--base-url', 'http://localhost:' + PORT + '/v1'], {});
    if (r.status !== 0) throw new Error('non-zero exit\n' + r.stderr);
    if (!fs.existsSync(OUT)) throw new Error('output file missing');
  });

  step('init refuses to overwrite without --force', () => {
    const r = cli(['init', '--spec', SPEC, '--out', OUT, '--base-url', 'http://localhost:' + PORT + '/v1'], {});
    if (r.status === 0) throw new Error('expected failure on existing file');
  });

  step('test command passes against live server', () => {
    const r = cli(['test', '--spec', SPEC, '--base-url', 'http://localhost:' + PORT + '/v1'], {});
    if (r.status !== 0) throw new Error('verify run failed\n' + r.stdout + r.stderr);
  });

  step('drift passes when in sync', () => {
    const r = cli(['drift', '--spec', SPEC, '--out', OUT, '--base-url', 'http://localhost:' + PORT + '/v1'], {});
    if (r.status !== 0) throw new Error('drift false positive\n' + r.stderr);
  });

  step('drift detects spec changes', () => {
    const shifted = fs.readFileSync(SPEC, 'utf8').replace(
      '      operationId: listPets',
      '      tags:\n          - core\n      operationId: listPets'
    );
    const tmpSpec = path.join(os.tmpdir(), 'specproof-drift-' + process.pid + '.yaml');
    fs.writeFileSync(tmpSpec, shifted);
    const r = cli(['drift', '--spec', tmpSpec, '--out', OUT, '--base-url', 'http://localhost:' + PORT + '/v1'], {});
    if (r.status === 0) throw new Error('drift not detected');
  });

  serverChild.kill();
  try {
    fs.unlinkSync(OUT);
  } catch {}
  console.log(failures ? `\nE2E: ${failures} failure(s)` : '\nE2E: all green');
  process.exit(failures ? 1 : 0);
}, 600);