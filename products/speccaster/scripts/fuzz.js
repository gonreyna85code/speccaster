// Lightweight mutation fuzz around known schema structures (P0-fuzz, offline).
// Not part of `npm test` (slow by design): it runs hundreds of deterministic
// variants to smoke out generator crashes and non-determinism.
//
//   node scripts/fuzz.js [N]   # N = variants per base (default 24)

const { generate } = require('../src/generate');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ATOMS = {
  str: { type: 'string' },
  strMin: { type: 'string', minLength: 3, maxLength: 10 },
  strEnum: { type: 'string', enum: ['a', 'b', 'c'] },
  int: { type: 'integer', minimum: 1, maximum: 9 },
  int64: { type: 'integer', format: 'int64', minimum: 1 },
  num: { type: 'number', exclusiveMinimum: 0 },
  bool: { type: 'boolean' },
  nul: { type: ['string', 'null'] },
  objReq: { type: 'object', required: ['a', 'b'], properties: { a: { type: 'string' }, b: { type: 'integer' } } },
  arr: { type: 'array', items: { type: 'string' } },
  arrMin: { type: 'array', items: { type: 'integer' }, minItems: 2 },
  constv: { const: 'fixed' },
  oneOf: { oneOf: [{ type: 'string' }, { type: 'integer', minimum: 5 }] },
  anyOf: { anyOf: [{ type: 'string' }, { type: 'boolean' }] },
  allOf: { allOf: [{ type: 'object', required: ['x'], properties: { x: { type: 'string' } } }, { type: 'object', required: ['y'], properties: { y: { type: 'integer' } } }] },
};

let seed = 20260911;
function rnd(n) {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed % n;
}

function buildSchema(depth) {
  const keys = Object.keys(ATOMS);
  if (depth >= 3) {
    return ATOMS[keys[rnd(keys.length)]];
  }
  const atoms = [ATOMS[keys[rnd(keys.length)]], ATOMS[keys[rnd(keys.length)]], ATOMS[keys[rnd(keys.length)]]];
  const kind = rnd(4);
  if (kind === 0) return { type: 'object', required: ['a'], properties: { a: atoms[0], b: atoms[1] } };
  if (kind === 1) return { type: 'array', items: atoms[0], minItems: 1 };
  if (kind === 2) return { oneOf: atoms.slice(0, 2) };
  return { allOf: atoms.slice(0, 2) };
}

function buildSpec(schema) {
  return {
    openapi: '3.0.3',
    info: { title: 'fuzz', version: '1' },
    paths: {
      '/data': {
        get: {
          operationId: 'getData',
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'ok', content: { 'application/json': { schema } } } },
        },
        post: {
          operationId: 'postData',
          requestBody: { content: { 'application/json': { schema } } },
          responses: { '201': { description: 'created', content: { 'application/json': { schema } } } },
        },
      },
    },
  };
}

async function main() {
  const N = Number(process.argv[2] || 24);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'speccaster-fuzz-'));
  let crashes = 0;
  let nondeterminism = 0;
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const specFile = path.join(dir, i + '.json');
    fs.writeFileSync(specFile, JSON.stringify(buildSpec(buildSchema(0))));
    try {
      const a = generate({ spec: specFile, out: path.join(dir, i + '.test.js') });
      const b = generate({ spec: specFile, out: path.join(dir, i + '.test.js') });
      if (a.content !== b.content) nondeterminism++;
    } catch (e) {
      crashes++;
      console.error('  CRASH variant ' + i + ' — ' + e.message);
    }
  }
  console.log(
    `FUZZ: ${N} deterministic variants in ${Date.now() - t0}ms — crashes ${crashes}, non-deterministic ${nondeterminism}`
  );
  process.exit(crashes || nondeterminism ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });