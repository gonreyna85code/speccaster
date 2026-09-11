// SpecCaster runtime contract validator. Emitted verbatim into the target repo
// as speccaster/validate.js. Zero dependencies, node >= 18, deterministic.
// This file intentionally has no imports besides node built-ins.

function typeName(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function plainTypes(s) {
  let list = Array.isArray(s.type) ? s.type.slice() : s.type ? [s.type] : [];
  if (!list.length && s.properties) list = ['object'];
  if (s.nullable === true && !list.includes('null')) list = list.concat('null');
  return list;
}

function deepEq(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEq(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEq(a[k], b[k])) return false;
    }
    return true;
  }
  return false;
}

function describeActual(v) {
  let s;
  try {
    s = JSON.stringify(v);
  } catch {
    s = String(v);
  }
  return s && s.length > 60 ? s.slice(0, 57) + '…' : s;
}

function describeExpected(s) {
  if (s.const !== undefined) return 'const ' + JSON.stringify(s.const);
  if (Array.isArray(s.enum) && s.enum.length) return 'one of ' + s.enum.map((x) => JSON.stringify(x)).join(', ');
  let t = Array.isArray(s.type) ? s.type.join('|') : s.type || (s.properties ? 'object' : 'any');
  return t;
}

function statusAllowed(status, keys) {
  const n = Number(status);
  for (const k of keys) {
    if (k === 'default') return true;
    if (/^[1-5]XX$/i.test(k)) {
      const base = +k[0] * 100;
      if (n >= base && n < base + 100) return true;
    }
    if (String(n) === k) return true;
  }
  return false;
}

function contentMatches(expected, actual) {
  if (!expected) return true;
  if (expected === '*/*' || expected === '*') return true;
  const e = expected.split('/');
  const a = (actual || '').split(';')[0].split('/');
  if (a.length < 2 || !a[0] || !a[1]) return false;
  if (e[0] !== '*' && e[0] !== a[0]) return false;
  if (e[1] === '*') return true;
  if (e[0] === 'application' && e[1] === '*+json') {
    return a[1] === 'json' || a[1].endsWith('+json');
  }
  return e[1] === a[1];
}

function jsonMedia(ct) {
  const t = (ct || '').split(';')[0].trim();
  return t === 'application/json' || t === 'text/json' || t === '*/*' || t.endsWith('+json');
}

function schemaErrors(value, schema, base, errs) {
  errs = errs || [];
  if (schema === true) return errs;
  if (schema === false) {
    errs.push({ path: base, expected: 'nothing', actual: describeActual(value), message: 'schema forbids any value' });
    return errs;
  }
  if (!schema || typeof schema !== 'object') return errs;

  if (value === null) {
    if (hasNullType(schema)) return errs;
    errs.push({ path: base, expected: describeExpected(schema), actual: 'null', message: 'null not allowed' });
    return errs;
  }

  const types = plainTypes(schema);
  const vt = typeName(value);
  const typeOk =
    types.length === 0 ||
    types.includes(vt) ||
    (vt === 'integer' && types.includes('number')) ||
    (vt === 'number' && types.includes('integer') && Number.isInteger(value));
  if (!typeOk) {
    errs.push({ path: base, expected: describeExpected(schema), actual: describeActual(value), message: 'type mismatch' });
    return errs;
  }

  if (schema.const !== undefined && !deepEq(value, schema.const)) {
    errs.push({ path: base, expected: 'const ' + JSON.stringify(schema.const), actual: describeActual(value), message: 'const mismatch' });
  }
  if (Array.isArray(schema.enum) && schema.enum.length && !schema.enum.some((e) => deepEq(e, value))) {
    errs.push({ path: base, expected: describeExpected(schema), actual: describeActual(value), message: 'not one of the declared enum values' });
  }

  if (Array.isArray(schema.oneOf) && schema.oneOf.length) {
    let valid = false;
    let first = null;
    for (const b of schema.oneOf) {
      const probe = [];
      schemaErrors(value, b, base, probe);
      if (probe.length === 0) {
        valid = true;
        break;
      }
      if (!first && probe.length) first = probe[0];
    }
    if (!valid) {
      errs.push({
        path: base,
        expected: 'one of ' + schema.oneOf.length + ' schemas',
        actual: describeActual(value),
        message: 'matches none — closest: ' + (first ? first.message + ' at ' + first.path : 'n/a'),
      });
    }
  }
  if (Array.isArray(schema.anyOf) && schema.anyOf.length) {
    let valid = false;
    for (const b of schema.anyOf) {
      if (schemaErrors(value, b, base, []).length === 0) {
        valid = true;
        break;
      }
    }
    if (!valid) {
      errs.push({ path: base, expected: 'any of ' + schema.anyOf.length + ' schemas', actual: describeActual(value), message: 'matches none' });
    }
  }
  if (Array.isArray(schema.allOf) && schema.allOf.length) {
    for (const b of schema.allOf) schemaErrors(value, b, base, errs);
  }

  if (typeof value === 'number') {
    const mi = schema.minimum;
    const ma = schema.maximum;
    if (typeof mi === 'number' && value < mi) errs.push({ path: base, expected: 'number >= ' + mi, actual: String(value), message: 'below minimum' });
    if (typeof ma === 'number' && value > ma) errs.push({ path: base, expected: 'number <= ' + ma, actual: String(value), message: 'above maximum' });
    if (schema.exclusiveMinimum === true && typeof mi === 'number' && value <= mi) {
      errs.push({ path: base, expected: 'number > ' + mi, actual: String(value), message: 'not above exclusive minimum' });
    }
    if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum) {
      errs.push({ path: base, expected: 'number > ' + schema.exclusiveMinimum, actual: String(value), message: 'not above exclusive minimum' });
    }
    if (typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum) {
      errs.push({ path: base, expected: 'number < ' + schema.exclusiveMaximum, actual: String(value), message: 'not below exclusive maximum' });
    }
    if (types.includes('integer') && !Number.isInteger(value)) {
      errs.push({ path: base, expected: 'integer', actual: String(value), message: 'non-integer for integer type' });
    }
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      errs.push({ path: base, expected: 'string of length >= ' + schema.minLength, actual: String(value.length), message: 'too short' });
    }
    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) {
      errs.push({ path: base, expected: 'string of length <= ' + schema.maxLength, actual: String(value.length), message: 'too long' });
    }
    if (schema.pattern) {
      try {
        if (!new RegExp(schema.pattern).test(value)) {
          errs.push({ path: base, expected: 'string matching ' + schema.pattern, actual: JSON.stringify(value), message: 'does not match declared pattern' });
        }
      } catch {
        // unparseable pattern: skip, spec author error — don't fail the contract on it
      }
    }
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errs.push({ path: base, expected: 'array of >= ' + schema.minItems + ' items', actual: String(value.length), message: 'too few items' });
    }
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) {
      errs.push({ path: base, expected: 'array of <= ' + schema.maxItems + ' items', actual: String(value.length), message: 'too many items' });
    }
    if (schema.items) {
      for (let i = 0; i < value.length; i++) schemaErrors(value[i], schema.items, base + '[' + i + ']', errs);
    }
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (Array.isArray(schema.required)) {
      for (const k of schema.required) {
        const ps = schema.properties && schema.properties[k];
        if (ps && ps.writeOnly === true) continue; // response-side: writeOnly must not be required
        if (!(k in value)) {
          errs.push({ path: base + '.' + k, expected: 'present', actual: 'missing', message: 'required property missing' });
        }
      }
    }
    if (schema.properties) {
      for (const k of Object.keys(schema.properties)) {
        const ps = schema.properties[k];
        if (ps && ps.writeOnly === true) continue;
        if (k in value) schemaErrors(value[k], ps, base + '.' + k, errs);
      }
    }
    if (schema.additionalProperties === false) {
      for (const k of Object.keys(value)) {
        if (!schema.properties || !(k in schema.properties)) {
          errs.push({ path: base + '.' + k, expected: 'no additional properties', actual: describeActual(value[k]), message: 'undeclared property (additionalProperties: false)' });
        }
      }
    }
  }
  return errs;
}

function hasNullType(s) {
  if (s.nullable === true) return true;
  return Array.isArray(s.type) && s.type.includes('null');
}

function formatErrors(label, errs) {
  const lines = errs.slice(0, 8).map(
    (e) => '  ' + e.path + ' — expected ' + e.expected + ', received ' + e.actual + ' (' + e.message + ')'
  );
  if (errs.length > 8) lines.push('  … and ' + (errs.length - 8) + ' more');
  return label + '\n' + lines.join('\n');
}

module.exports = { statusAllowed, contentMatches, jsonMedia, schemaErrors, formatErrors, deepEq };