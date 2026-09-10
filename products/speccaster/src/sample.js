function sampleFromSchema(schema, depth = 0) {
  if (!schema || typeof schema !== 'object') return null;
  if (depth > 6) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  if (schema.const !== undefined) return schema.const;
  if (Array.isArray(schema.oneOf) && schema.oneOf.length) return sampleFromSchema(schema.oneOf[0], depth + 1);
  if (Array.isArray(schema.anyOf) && schema.anyOf.length) return sampleFromSchema(schema.anyOf[0], depth + 1);
  if (Array.isArray(schema.allOf) && schema.allOf.length) {
    const merged = { properties: {}, required: [] };
    for (const sub of schema.allOf) {
      Object.assign(merged, sub);
      if (sub.properties) Object.assign(merged.properties, sub.properties);
      if (Array.isArray(sub.required)) merged.required = merged.required.concat(sub.required);
    }
    return sampleFromSchema(merged, depth + 1);
  }
  const type = schema.type || (schema.properties ? 'object' : 'string');
  if (type === 'string') {
    if (schema.format === 'date-time') return '2026-01-01T00:00:00Z';
    if (schema.format === 'date') return '2026-01-01';
    if (schema.format === 'uuid') return '3f2b0d9a-1c44-4a7b-9b0e-2e1d8f7a6c5d';
    if (schema.format === 'email') return 'user@example.com';
    if (schema.format === 'hostname') return 'example.com';
    if (schema.format === 'uri') return 'https://example.com';
    if (schema.format === 'ipv4') return '192.0.2.1';
    if (typeof schema.minLength === 'number' && schema.minLength > 1) {
      let s = '';
      for (let i = 0; i < schema.minLength; i++) s += 'x';
      return s;
    }
    return 'sample';
  }
  if (type === 'integer' || type === 'number') {
    const min = typeof schema.minimum === 'number' ? schema.minimum : 1;
    if (schema.format === 'int64') return String(typeof min === 'number' ? min : 1);
    return typeof min === 'number' ? min : 1;
  }
  if (type === 'boolean') return true;
  if (type === 'array') {
    const item = schema.items ? sampleFromSchema(schema.items, depth + 1) : null;
    if (item === null) return [];
    return [item];
  }
  if (type === 'object') {
    const out = {};
    const props = schema.properties || {};
    const required = Array.isArray(schema.required) ? schema.required : Object.keys(props);
    for (const key of required) {
      if (props[key]) out[key] = sampleFromSchema(props[key], depth + 1);
    }
    const hasProps = Object.keys(props).length > 0;
    if (!hasProps) return {};
    return out;
  }
  return null;
}

module.exports = { sampleFromSchema };