const http = require('http');

const pets = [{ id: 1, name: 'Byte', tag: 'circuit' }];
let nextId = 2;

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  res.setHeader('content-type', 'application/json');

  if (req.method === 'GET' && u.pathname === '/v1/pets') {
    res.end(JSON.stringify(pets));
    return;
  }
  if (req.method === 'POST' && u.pathname === '/v1/pets') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        res.statusCode = 422;
        res.end('{"error":"bad json"}');
        return;
      }
      if (!parsed || typeof parsed.name !== 'string') {
        res.statusCode = 422;
        res.end('{"error":"name required"}');
        return;
      }
      const pet = { id: nextId++, ...parsed };
      pets.push(pet);
      res.statusCode = 201;
      res.end(JSON.stringify(pet));
    });
    return;
  }
  const m = u.pathname.match(/^\/v1\/pets\/(\d+)$/);
  if (req.method === 'GET' && m) {
    const id = Number(m[1]);
    const pet = pets.find((p) => p.id === id);
    if (!pet) {
      res.statusCode = 404;
      res.end('{"error":"not found"}');
      return;
    }
    res.end(JSON.stringify(pet));
    return;
  }
  res.statusCode = 404;
  res.end('{"error":"not found"}');
});

module.exports = server;