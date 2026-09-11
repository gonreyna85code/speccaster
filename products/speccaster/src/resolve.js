const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Deterministic $ref resolution for OpenAPI documents.
//
// Supports:
//   - local pointers:  #/components/schemas/Pet, #/$defs/Address (3.1), ~0/~1 escaping
//   - local external:  ./schemas/user.yaml#/components/schemas/User (relative to spec)
//
// Deliberately NOT supported (reproducibility + security):
//   - remote URLs (https://, http://) — resolved at generation time only
//   - external refs that escape the spec directory (path traversal)
//
// Unresolvable refs throw an actionable error; nothing is silently ignored.

const MAX_MATERIALIZE_DEPTH = 32;
const EXTERNAL_RE = /^\.{0,2}\//;
const YAML_RE = /\.ya?ml$/i;
const JSON_RE = /\.json$/i;

function pointerGet(root, refString, where) {
  const ptr = refString.replace(/^#/, '');
  if (!ptr || ptr === '/') return root;
  const parts = ptr
    .split('/')
    .filter((p) => p !== '')
    .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
  let node = root;
  for (const p of parts) {
    if (node && typeof node === 'object' && p in node) node = node[p];
    else {
      throw new Error(
        `unresolved $ref '${refString}' in ${where} — pointer segment '/${p}' does not exist`
      );
    }
  }
  return node;
}

function createResolver(specDoc, opts = {}) {
  const specFile = opts.specFile || null;
  const specDir = specFile ? path.resolve(path.dirname(specFile)) : null;
  const loaded = new Map();

  function loadExternal(filePart) {
    if (!specDir) {
      throw new Error(
        `external $ref '${filePart}' requires a --spec path on disk (cannot load external files)`
      );
    }
    if (!EXTERNAL_RE.test(filePart)) {
      throw new Error(
        `unsupported external $ref '${filePart}' — only relative local files (./x.yaml, ./x.json) are supported`
      );
    }
    const resolved = path.resolve(specDir, filePart);
    const rel = path.relative(specDir, resolved);
    if (rel.startsWith('..')) {
      throw new Error(
        `external $ref '${filePart}' escapes the spec directory — blocked (path safety)`
      );
    }
    if (!(YAML_RE.test(resolved) || JSON_RE.test(resolved))) {
      throw new Error(
        `external $ref '${filePart}' — only .json/.yaml/.yml files are supported`
      );
    }
    if (loaded.has(resolved)) return loaded.get(resolved);
    const raw = fs.readFileSync(resolved, 'utf8'); // may throw ENOENT -> wrapped below
    let doc;
    try {
      doc = YAML_RE.test(resolved) ? yaml.parse(raw) : JSON.parse(raw);
    } catch (e) {
      throw new Error(`external $ref '${filePart}' — could not parse: ${e.message}`);
    }
    loaded.set(resolved, doc);
    return doc;
  }

  function resolveRefStr(refStr) {
    const hash = refStr.indexOf('#');
    const filePart = hash === -1 ? refStr : refStr.slice(0, hash);
    let frag = hash === -1 ? '' : refStr.slice(hash + 1);
    try {
      frag = decodeURIComponent(frag);
    } catch {}
    if (filePart) {
      const doc = loadExternal(filePart);
      return pointerGet(doc, '#' + frag, filePart);
    }
    return pointerGet(specDoc, '#' + frag, 'the spec');
  }

  // Fully dereference the top-level $ref chain of `node` (one "hop" for the
  // sampler, which recurses on its own). Cycle-safe.
  function resolve(node) {
    let cur = node;
    const seen = new Set();
    while (cur && typeof cur === 'object' && typeof cur.$ref === 'string') {
      if (seen.has(cur)) {
        throw new Error(`circular $ref chain detected at '${cur.$ref}'`);
      }
      seen.add(cur);
      cur = resolveRefStr(cur.$ref);
    }
    return cur;
  }

  // Deep, fully-dereferenced copy of a schema for embedding into generated
  // output. Recursive references truncate at the second occurrence on the
  // same branch (deterministic), which also prevents exponential blowup on
  // recursive schemas.
  function materialize(node, depth, ancestry) {
    if (node == null || typeof node !== 'object') return node;
    if (depth >= MAX_MATERIALIZE_DEPTH) return {};
    let cur = node;
    const chain = new Set();
    while (cur && typeof cur === 'object' && typeof cur.$ref === 'string') {
      if (chain.has(cur)) return {};
      chain.add(cur);
      cur = resolveRefStr(cur.$ref);
    }
    if (cur == null || typeof cur !== 'object') return cur;
    if (ancestry && ancestry.has(cur)) return {};
    const next = new Set(ancestry || []);
    next.add(cur);
    if (Array.isArray(cur)) {
      return cur.map((x) => materialize(x, depth + 1, next));
    }
    const out = {};
    for (const k of Object.keys(cur)) {
      const v = cur[k];
      out[k] = v && typeof v === 'object' ? materialize(v, depth + 1, next) : v;
    }
    return out;
  }

  return { resolve, materialize, resolveRefStr };
}

module.exports = { createResolver, pointerGet };