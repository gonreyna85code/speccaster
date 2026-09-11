const { schemaErrors } = require('./runtime-validate');

const MAX_DEPTH = 8;

function derefNode(schema, opts) {
  if (opts && typeof opts.resolve === 'function') return opts.resolve(schema);
  return schema && typeof schema === 'object' && schema.$ref ? null : schema;
}

function firstNonNullType(schema) {
  const t = schema.type;
  if (Array.isArray(t)) {
    const nn = t.find((x) => x !== 'null');
    return nn || 'null';
  }
  if (t === 'null') return 'null';
  return t || (schema.properties ? 'object' : 'string');
}

function stringSample(schema) {
  if (schema.format === 'date-time') return '2026-05-06T12:00:00Z';
  if (schema.format === 'date') return '2026-05-06';
  if (schema.format === 'time') return '12:00:00Z';
  if (schema.format === 'uuid') return '3f2b0d9a-1c44-4a7b-9b0e-2e1d8f7a6c5d';
  if (schema.format === 'email') return 'user@example.com';
  if (schema.format === 'hostname') return 'example.com';
  if (schema.format === 'uri' || schema.format === 'url') return 'https://example.com/resource';
  if (schema.format === 'uri-reference') return '/resource';
  if (schema.format === 'ipv4') return '192.0.2.1';
  if (schema.format === 'ipv6') return '2001:db8::1';
  let len = typeof schema.minLength === 'number' ? schema.minLength : 6;
  if (typeof schema.maxLength === 'number') len = Math.min(len, Math.max(schema.maxLength, 0));
  if (len > 6) return 'x'.repeat(len);
  return 'sample'.slice(0, len);
}

function numberSample(schema, type) {
  let lo = -Infinity;
  let hi = Infinity;
  const delta = type === 'integer' ? 1 : 1e-9;
  if (typeof schema.minimum === 'number') lo = Math.max(lo, schema.minimum);
  if (schema.exclusiveMinimum === true && typeof schema.minimum === 'number') lo = Math.max(lo, schema.minimum + delta);
  if (typeof schema.exclusiveMinimum === 'number') lo = Math.max(lo, (type === 'integer' ? Math.ceil(schema.exclusiveMinimum) : schema.exclusiveMinimum) + delta);
  if (typeof schema.maximum === 'number') hi = Math.min(hi, schema.maximum);
  if (typeof schema.exclusiveMaximum === 'number') hi = Math.min(hi, schema.exclusiveMaximum - delta);
  let v = Number.isFinite(lo) ? lo : Number.isFinite(hi) ? hi : 1;
  if (v < lo) v = lo;
  if (v > hi) v = hi;
  if (type === 'integer') v = Math.ceil(v);
  return v;
}

function arraySample(schema, opts) {
  const itemSchema = schema.items || (Array.isArray(schema.prefixItems) && schema.prefixItems[0]);
  if (!itemSchema) return [];
  const item = itemSample(itemSchema, opts);
  if (item === null || item === undefined) return [];
  let n = typeof schema.minItems === 'number' ? schema.minItems : 1;
  if (typeof schema.maxItems === 'number' && schema.maxItems < n) n = schema.maxItems;
  return Array.from({ length: n }, () => item);
}

function itemSample(schema, opts) {
  return sampleFromSchema(schema, { ...opts, depth: (opts.depth || 0) + 1 });
}

function objectSample(schema, opts) {
  const props = schema.properties || {};
  const required = Array.isArray(schema.required) ? schema.required : [];
  let keys;
  if (opts.mode === 'request') {
    keys = required.filter((k) => !(props[k] && props[k].readOnly === true));
  } else {
    keys = required.filter((k) => !(props[k] && props[k].writeOnly === true));
  }
  if (!keys.length) keys = required.slice();
  const out = {};
  for (const key of keys) {
    if (!props[key]) continue;
    const val = sampleFromSchema(props[key], { ...opts, depth: (opts.depth || 0) + 1 });
    if (val !== null && val !== undefined) out[key] = val;
  }
  return out;
}

function findFirstOneOf(schema, opts) {
  const branches = schema.oneOf || schema.anyOf || [];
  for (const b of branches) {
    const candidate = sampleFromSchema(b, { ...opts, depth: (opts.depth || 0) + 1 });
    if (candidate === null || candidate === undefined) continue;
    const errs = [];
    schemaErrors(candidate, b, 'sample', errs);
    if (errs.length === 0) return candidate;
  }
  return null;
}

function mergeAllOf(schema) {
  const merged = { type: schema.type, properties: {}, required: [] };
  let anyProps = false;
  for (const sub of schema.allOf) {
    if (!sub || typeof sub !== 'object') continue;
    if (sub.properties) {
      anyProps = true;
      Object.assign(merged.properties, sub.properties);
    }
    if (Array.isArray(sub.required)) {
      for (const r of sub.required) if (!merged.required.includes(r)) merged.required.push(r);
    }
    for (const k of ['type', 'enum', 'const', 'format', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength', 'minItems', 'maxItems']) {
      if (sub[k] !== undefined) merged[k] = sub[k];
    }
  }
  if (!merged.type && anyProps) merged.type = 'object';
  return merged;
}

function clone(v) {
  if (v === undefined) return v;
  return JSON.parse(JSON.stringify(v));
}

function sampleFromSchema(schema, opts) {
  opts = opts || {};
  const depth = opts.depth || 0;
  if (!schema || typeof schema !== 'object') return null;
  if (depth > MAX_DEPTH) return null;

  const s = derefNode(schema, opts);
  if (s === null || s === undefined || typeof s !== 'object' || Object.keys(s).length === 0) return null;

  if (s.example !== undefined) return clone(s.example);
  if (s.default !== undefined) return clone(s.default);
  if (Array.isArray(s.enum) && s.enum.length) {
    const first = s.enum.find((e) => e !== null);
    return first === undefined ? clone(s.enum[0]) : clone(first);
  }
  if (s.const !== undefined) return clone(s.const);

  if (Array.isArray(s.oneOf) && s.oneOf.length) {
    const pick = findFirstOneOf(s, opts);
    if (pick !== null) return pick;
  }
  if (Array.isArray(s.anyOf) && s.anyOf.length) {
    const pick = findFirstOneOf(s, opts);
    if (pick !== null) return pick;
  }
  if (Array.isArray(s.allOf) && s.allOf.length) {
    return sampleFromSchema(mergeAllOf(s), { ...opts, depth: depth + 1 });
  }

  // request/response guards
  if (opts.mode === 'request' && s.readOnly === true) return null;
  if (opts.mode === 'response' && s.writeOnly === true) return null;

  const type = firstNonNullType(s);
  if (type === 'null') return null;
  if (type === 'string') return stringSample(s);
  if (type === 'integer' || type === 'number') return numberSample(s, type);
  if (type === 'boolean') return true;
  if (type === 'array') return arraySample(s, opts);
  if (type === 'object') return objectSample(s, opts);
  return null;
}

module.exports = { sampleFromSchema, MAX_DEPTH };