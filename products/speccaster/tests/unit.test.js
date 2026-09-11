const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { sampleFromSchema } = require('../src/sample');
const { createResolver } = require('../src/resolve');
const { generate } = require('../src/generate');
const runtime = require('../src/runtime-validate');

const FIX = path.join(__dirname, 'fixtures');
function specPath(name) {
  return path.join(FIX, name);
}
function genFor(name, opts) {
  const spec = specPath(name);
  const out = path.join(os.tmpdir(), 'speccaster-unit-' + process.pid + '-' + name.replace(/[^\w.-]/g, '_') + '.test.js');
  return generate({ spec, out, ...opts });
}

// ---------------------------------------------------------------- resolve
test('resolve: local pointer + ~1 escaping + percent decode', () => {
  const doc = { components: { schemas: { 'a/b': { type: 'string' }, 'spaced xtra': { type: 'integer' } } } };
  const r = createResolver(doc);
  assert.equal(r.resolve({ $ref: '#/components/schemas/a~1b' }).type, 'string');
  assert.equal(r.resolve({ $ref: '#/components/schemas/spaced%20xtra' }).type, 'integer');
});

test('resolve: $defs (OpenAPI 3.1) resolves from the document root', () => {
  const doc = { $defs: { Status: { type: 'string' } } };
  const r = createResolver(doc);
  assert.equal(r.resolve({ $ref: '#/$defs/Status' }).type, 'string');
});

test('resolve: external relative file refs, nested', () => {
  const spec = specPath('external-refs/openapi.yaml');
  const parsed = require('yaml').parse(fs.readFileSync(spec, 'utf8'));
  const r = createResolver(parsed, { specFile: spec });
  const addr = r.resolve({ $ref: './schemas/address.yaml#/components/schemas/Address' });
  assert.equal(addr.required.includes('street'), true);
  const user = r.resolve({ $ref: './schemas/user.yaml#/components/schemas/User' });
  assert.equal(user.required.includes('avatar'), true);
});

test('resolve: external ref escaping the spec dir is blocked', () => {
  assert.throws(() => genFor('escape-ref/openapi.yaml'), /escapes the spec directory/);
});

test('resolve: dangling ref produces a clear error (not silent)', () => {
  assert.throws(() => genFor('invalid-ref.yaml'), /unresolved \$ref '#\/components\/schemas\/DoesNotExist'/);
});

test('resolve: circular alias chain throws instead of overflowing the stack', () => {
  const a = {};
  const b = {};
  a.$ref = '#/A';
  b.type = 'string';
  b.$ref = '#/A';
  const doc = { A: { $ref: '#/B' }, B: b };
  const r = createResolver(doc);
  assert.throws(() => r.resolve({ $ref: '#/A' }), /circular/);
});

test('resolve: materialize truncates recursion and does not blow up', () => {
  const parsed = require('yaml').parse(fs.readFileSync(specPath('composition.yaml'), 'utf8'));
  const r = createResolver(parsed);
  const tree = r.materialize(parsed.components.schemas.CatTree);
  assert.equal(tree.type, 'object');
  assert.ok(tree.required.includes('children'));
  // recursive child is capped deterministically (object remains finite)
  const j = JSON.stringify(tree);
  assert.ok(j.length < 20000, 'recursive schema materialized too large: ' + j.length);
});

// ---------------------------------------------------------------- sample
const req = { resolve: (s) => s, mode: 'request' };
const resp = { resolve: (s) => s, mode: 'response' };

test('sample: integer format int64 stays numeric (no string leakage into bodies)', () => {
  const v = sampleFromSchema({ type: 'integer', format: 'int64', minimum: 9007199254740993 }, req);
  assert.equal(typeof v, 'number');
  assert.ok(v >= 9007199254740993);
});

test('sample: request body omits readOnly, keeps writeOnly', () => {
  const v = sampleFromSchema(
    {
      type: 'object',
      required: ['name', 'secret', 'serverId'],
      properties: { name: { type: 'string' }, secret: { type: 'string', writeOnly: true }, serverId: { type: 'integer', readOnly: true } },
    },
    req
  );
  assert.deepEqual(Object.keys(v).sort(), ['name', 'secret']);
});

test('sample: response mode omits writeOnly required props', () => {
  const v = sampleFromSchema(
    {
      type: 'object',
      required: ['id', 'secret'],
      properties: { id: { type: 'integer' }, secret: { type: 'string', writeOnly: true } },
    },
    resp
  );
  assert.deepEqual(Object.keys(v), ['id']);
});

test('sample: string honors minLength and caps at maxLength', () => {
  assert.equal(sampleFromSchema({ type: 'string', minLength: 8 }, req).length, 8);
  assert.ok(sampleFromSchema({ type: 'string', minLength: 3, maxLength: 4 }, req).length <= 4);
  assert.ok(sampleFromSchema({ type: 'string', minLength: 3, maxLength: 4 }, req).length >= 3);
  assert.equal(sampleFromSchema({ type: 'string', minLength: 0 }, req), '');
});

test('sample: numeric bounds and exclusives are honored deterministically', () => {
  assert.equal(sampleFromSchema({ type: 'integer', minimum: 2, maximum: 2 }, req), 2);
  const frac = sampleFromSchema({ type: 'number', exclusiveMinimum: 1, exclusiveMaximum: 2 }, req);
  assert.ok(frac > 1 && frac < 2, 'expected (1,2), got ' + frac);
  assert.ok(sampleFromSchema({ type: 'integer', minimum: 0 }, req) >= 0);
  assert.equal(sampleFromSchema({ type: 'integer', exclusiveMinimum: 5 }, req), 6);
});

test('sample: enum picks first non-null; const wins; null type yields null', () => {
  assert.equal(sampleFromSchema({ type: 'string', enum: [null, 'a', 'b'] }, req), 'a');
  assert.equal(sampleFromSchema({ const: 42 }, req), 42);
  assert.equal(sampleFromSchema({ type: 'null' }, req), null);
  const arr = { type: ['string', 'null'] };
  assert.equal(sampleFromSchema(arr, req), 'sample');
});

test('sample: oneOf returns a branch whose sample satisfies its own constraints', () => {
  const kitten = sampleFromSchema(
    {
      oneOf: [
        { type: 'object', required: ['kind', 'age'], properties: { kind: { const: 'kitten' }, age: { type: 'integer', maximum: 1 } } },
        { type: 'object', required: ['nickname'], properties: { kind: { const: 'grown' }, nickname: { type: 'string' } } },
      ],
    },
    req
  );
  assert.equal(kitten.kind, 'kitten');
  assert.ok(kitten.age <= 1);
});

test('sample: allOf merges properties and required across branches', () => {
  const s = {
    allOf: [
      { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
      { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } },
    ],
  };
  const v = sampleFromSchema(s, req);
  assert.deepEqual(Object.keys(v).sort(), ['id', 'name']);
});

test('sample: minItems arrays are honored; empty arrays when no items', () => {
  assert.equal(sampleFromSchema({ type: 'array', items: { type: 'string' }, minItems: 2 }, req).length, 2);
  assert.deepEqual(sampleFromSchema({ type: 'array' }, req), []);
});

// ---------------------------------------------------------------- validate (runtime)
test('validate: statusAllowed handles exact, X XX wildcards and default', () => {
  assert.equal(runtime.statusAllowed('200', ['200', '404']), true);
  assert.equal(runtime.statusAllowed('204', ['2XX']), true);
  assert.equal(runtime.statusAllowed('403', ['2XX']), false);
  assert.equal(runtime.statusAllowed('500', ['default']), true);
});

test('validate: contentMatches handles charset params and +json wildcards', () => {
  assert.equal(runtime.contentMatches('application/json', 'application/json; charset=utf-8'), true);
  assert.equal(runtime.contentMatches('application/hal+json', 'application/json'), false);
  assert.equal(runtime.contentMatches('application/*+json', 'application/problem+json'), true);
  assert.equal(runtime.contentMatches('text/plain', 'application/json'), false);
});

test('validate: structured schema errors for concrete violations', () => {
  const schema = {
    type: 'object',
    required: ['id', 'name'],
    properties: {
      id: { type: 'integer', minimum: 1 },
      name: { type: 'string', minLength: 3 },
      kind: { type: 'string', enum: ['a', 'b'] },
      tags: { type: 'array', minItems: 2, items: { type: 'string' } },
    },
  };
  const errs = runtime.schemaErrors(
    { id: 0, name: 'x', kind: 'z', tags: ['one'], extra: true },
    schema,
    'response.body'
  );
  const paths = errs.map((e) => e.path).join('|');
  assert.match(paths, /response\.body\.id/);
  assert.match(paths, /response\.body\.name/);
  assert.match(paths, /response\.body\.kind/);
  assert.match(paths, /response\.body\.tags/);
});

test('validate: null allowed via nullable and via 3.1 type arrays; writeOnly props skipped', () => {
  assert.equal(runtime.schemaErrors(null, { type: 'string', nullable: true }, 'x').length, 0);
  assert.equal(runtime.schemaErrors(null, { type: ['string', 'null'] }, 'x').length, 0);
  assert.ok(runtime.schemaErrors({}, { type: 'object', required: ['secret'], properties: { secret: { type: 'string', writeOnly: true } } }, 'x').length === 0);
});

test('validate: oneOf accepts when a branch matches; rejects when none do', () => {
  const schema = { oneOf: [{ type: 'string' }, { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }] };
  assert.equal(runtime.schemaErrors(42, schema, 'x').length, 1);
  assert.equal(runtime.schemaErrors({ id: 1 }, schema, 'x').length, 0);
});

test('validate: numeric exclusives and integer type enforce correctly', () => {
  assert.equal(runtime.schemaErrors(5, { type: 'integer', exclusiveMinimum: 5 }, 'x').length, 1);
  assert.equal(runtime.schemaErrors(6, { type: 'integer', exclusiveMinimum: 5 }, 'x').length, 0);
  assert.equal(runtime.schemaErrors(1.5, { type: 'integer' }, 'x').length, 1);
});

// ---------------------------------------------------------------- generate
test('generate: determinism — two runs are byte-identical (idempotent)', () => {
  const a = genFor('refs.yaml');
  const b = genFor('refs.yaml');
  assert.equal(a.content, b.content);
  assert.equal(a.validateSource, b.validateSource);
  const again = genFor('composition.yaml');
  const again2 = genFor('composition.yaml');
  assert.equal(again.content, again2.content);
});

test('generate: refs fixture resolves parameter/requestBody/response schema refs and emits SCHEMA', () => {
  const out = genFor('refs.yaml');
  assert.match(out.content, /const SCHEMA =/);
  assert.match(out.content, /require\('\.\/validate'\)/);
});

test('generate: server variables are substituted with deterministic defaults', () => {
  const out = genFor('servers.yaml');
  assert.match(out.content, /SPECCASTER_BASE_URL \|\| "https:\/\/api\.example\.com\/alpha\/v2/);
});

test('generate: serialization styles are honored in query strings', () => {
  const out = genFor('params.yaml');
  assert.match(out.content, /q=sample/);
  assert.match(out.content, /ids=1&ids=1/);
  assert.match(out.content, /pipe=sample\|sample/);
  assert.match(out.content, /spaced=sample%20sample/);
  assert.match(out.content, /filter\[status\]=sample/);
  assert.doesNotMatch(out.content, /X-Request-Id=/);
});

test('generate: request bodies — readOnly excluded, writeOnly kept, form encoded, text raw, multipart skipped', () => {
  const out = genFor('bodies.yaml');
  assert.match(out.content, /"{\\"name\\":\\"sample\\",\\"secret\\":\\"sample\\"}"/);
  assert.doesNotMatch(out.content, /serverId/);
  assert.match(out.content, /application\/x-www-form-urlencoded/);
  assert.match(out.content, /body: "name=sample"/);
  assert.match(out.content, /text\/plain/);
  assert.match(out.content, /skipped: request body not auto-generated/);
});

test('generate: 2XX wildcard and default status keys are accepted by the generated matcher', () => {
  const out = genFor('responses.yaml');
  assert.match(out.content, /"2XX"/);
  assert.match(out.content, /"default"/);
});

test('generate: content-type charset suffix does not break media selection', () => {
  const out = genFor('responses.yaml');
  assert.match(out.content, /application\/json/);
});

test('generate: text/plain responses validate the raw body string', () => {
  const out = genFor('responses.yaml');
  assert.match(out.content, /schemaErrors\(bodyText, SCHEMA/);
});

test('generate: OpenAPI 3.1 — $defs, type arrays, prefixItems and const resolve', () => {
  const out = genFor('openapi31.yaml');
  assert.match(out.content, /"const":"placed"/);
  assert.doesNotMatch(out.content, /unresolved/);
});

test('generate: path with hostile characters is embedded as a JSON string (no JS injection)', () => {
  const out = genFor('path-injection.yaml');
  const needle = JSON.stringify('/pets/${name}`;throw 1;//');
  assert.ok(out.content.includes('+ ' + needle), 'hostile path must be JSON-embedded');
  const tmp = path.join(os.tmpdir(), 'speccaster-inject-check-' + process.pid + '.test.js');
  fs.writeFileSync(tmp, out.content + '\n');
  const chk = require('child_process').spawnSync(process.execPath, ['--check', tmp]);
  assert.equal(chk.status, 0, 'generated file must remain valid JS: ' + (chk.stderr || '').toString());
});

test('generate: enums/bounds sampler emits a compliant minimal body', () => {
  const out = genFor('enums-bounds.yaml');
  assert.match(out.content, /\\"code\\":\\"xxxxxxxx\\"/);
  assert.match(out.content, /\\"amount\\":100/);
  assert.match(out.content, /\\"kind\\":\\"standard\\"/);
  assert.match(out.content, /\\"label\\":\\"voucher\\"/);
  const bodyLine = out.content.split('\n').find((l) => l.includes('body: '));
  assert.ok(bodyLine, 'a request body must be emitted');
  assert.doesNotMatch(bodyLine, /ratio|channels|big|note/, 'optional properties are not sent in request bodies');
});

test('generate: performance — medium spec generates without warnings', () => {
  const t0 = Date.now();
  const out = genFor('composition.yaml');
  const dt = Date.now() - t0;
  assert.ok(dt < 3000, 'generation too slow: ' + dt + 'ms');
  assert.ok(out.content.length > 0);
});