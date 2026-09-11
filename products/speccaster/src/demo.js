const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { generate, writeGenerated } = require('./generate');

const DEMO_SPEC = `openapi: 3.0.3
info:
  title: Demo API
  version: 1.0.0
servers:
  - url: http://127.0.0.1:1/v1
paths:
  /pets:
    get:
      operationId: listPets
      summary: List all pets
      responses:
        '200':
          description: A list of pets
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
    post:
      operationId: createPet
      summary: Create a pet
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewPet'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
        '422':
          description: Unprocessable
  /pets/{petId}:
    parameters:
      - name: petId
        in: path
        required: true
        schema:
          type: integer
          minimum: 1
    get:
      operationId: getPet
      summary: Fetch one pet
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
        '404':
          description: Not found
components:
  schemas:
    Pet:
      type: object
      required: [id, name]
      properties:
        id:
          type: integer
        name:
          type: string
        tag:
          type: string
    NewPet:
      type: object
      required: [name]
      properties:
        name:
          type: string
        tag:
          type: string
`;

function createDemoApp() {
  const pets = [{ id: 1, name: 'Byte', tag: 'circuit' }];
  let nextId = 2;
  return (req, res) => {
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
      const pet = pets.find((p) => p.id === Number(m[1]));
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
  };
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(createDemoApp());
    server.on('error', reject);
    server.listen(0, () => resolve(server));
  });
}

function runTestsAsync(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--test', file], { stdio: 'inherit', env: process.env });
    child.on('error', (e) => resolve(e.code || 1));
    child.on('exit', (code) => resolve(code === 0 ? 0 : 1));
  });
}

async function runDemo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'speccaster-demo-'));
  const specFile = path.join(dir, 'openapi.yaml');
  const outFile = path.join(dir, 'contract.test.js');
  fs.writeFileSync(specFile, DEMO_SPEC);

  const server = await startServer();
  const port = server.address().port;
  const baseUrl = 'http://127.0.0.1:' + port + '/v1';

  console.log('[speccaster] demo: spun up an ephemeral API (' + baseUrl + ') and generated contract tests from an embedded OpenAPI spec.');
  const gen = generate({ spec: specFile, out: outFile, baseUrl });
  writeGenerated({ content: gen.content, validateSource: gen.validateSource, out: outFile });
  const status = await runTestsAsync(outFile);

  const mutated = DEMO_SPEC.replace(/\n    post:/, '\n    patchSomething:');
  fs.writeFileSync(specFile, mutated);
  const drifted = generate({ spec: specFile, out: outFile, baseUrl }).content.trim();
  const changed = drifted !== gen.content.trim();

  server.close();
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}

  if (status !== 0) {
    console.error('[speccaster] demo: the generated tests failed — please report this (use the issue link in the README).');
    return 1;
  }
  console.log('');
  if (changed) {
    console.log('[speccaster] demo: then the spec changed (operation edited) and the generated suite changed with it — that is the CI drift gate:');
    console.log('             the build fails until you regenerate. API/spec alignment, automated and recurring.');
  } else {
    console.log('[speccaster] demo: (drift demonstration skipped — regeneration produced identical output)');
  }
  console.log('');
  console.log('Now try it on your own API:  npx speccaster init --spec openapi.yaml');
  return 0;
}

module.exports = { runDemo, DEMO_SPEC };