#!/usr/bin/env node
const { main } = require('../src/cli');
main(process.argv.slice(2)).then((code) => {
  process.exitCode = code || 0;
}).catch((e) => {
  console.error('specproof: ' + (e && e.message ? e.message : e));
  process.exitCode = 1;
});