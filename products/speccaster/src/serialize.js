// OpenAPI parameter serialization (style / explode) — deterministic, subset:
//   query: form (default), pipeDelimited, spaceDelimited, deepObject
//   path:  simple (default)
// Values arrive as sampled scalars/arrays/objects. Returns arrays of
// [key, encodedValue] pairs to be joined with '&' (query) or a string (path).

function paramBoolean(p, styleDefault) {
  const style = p.style || styleDefault;
  const explode = p.explode === undefined ? style === styleDefault && style === 'form' : !!p.explode;
  return { style, explode };
}

function scalarPair(name, v) {
  return [[name, encodeURIComponent(v === null || v === undefined ? '' : String(v))]];
}

function queryEncoding(p, value) {
  const { style, explode } = paramBoolean(p, 'form');
  const name = p.name;
  const enc = (v) => encodeURIComponent(v === null || v === undefined ? '' : String(v));

  if (style === 'form') {
    if (Array.isArray(value)) {
      return explode ? value.map((v) => [name, enc(v)]) : [[name, value.map(enc).join(',')]];
    }
    if (value && typeof value === 'object') {
      if (explode) return Object.keys(value).map((k) => [k, enc(value[k])]);
      return [[name, Object.keys(value).map((k) => k + ',' + enc(value[k])).join(',')]];
    }
    return scalarPair(name, value);
  }
  if (style === 'pipeDelimited' && Array.isArray(value)) {
    return [[name, (explode ? value : value).map(enc).join('|')]];
  }
  if (style === 'spaceDelimited' && Array.isArray(value)) {
    return [[name, value.map(enc).join('%20')]];
  }
  if (style === 'deepObject' && value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value).map((k) => [name + '[' + k + ']', enc(value[k])]);
  }
  return scalarPair(name, Array.isArray(value) ? value.join(',') : value);
}

function simplerPathValue(p, value) {
  // style 'simple' (path default). Arrays/objects are joined with ','.
  const render = Array.isArray(value) ? value.join(',') : value && typeof value === 'object' ? Object.keys(value).join(',') : value === undefined || value === null ? '' : String(value);
  return encodeURIComponent(render);
}

module.exports = { queryEncoding, simplerPathValue, paramBoolean };