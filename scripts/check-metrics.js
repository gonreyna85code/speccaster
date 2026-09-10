const https = require('https');

const PKG = 'speccaster';
const REPO = 'gonreyna85code/speccaster';
const LANDING = 'https://gonreyna85code.github.io/speccaster/';
const METRICS_FILE = require('path').join(__dirname, '..', 'memory', 'metrics.jsonl');

function getJson(url, headers) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'speccaster-operator', ...(headers || {}) } }, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => {
          let j;
          try { j = JSON.parse(d); } catch { return reject(new Error('bad json from ' + url + ': ' + d.slice(0, 120))); }
          resolve({ status: r.statusCode, body: j });
        });
      })
      .on('error', reject);
  });
}

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'speccaster-operator' } }, (r) => {
      r.resume();
      r.on('end', () => resolve(r.statusCode));
    }).on('error', reject);
  });
}

(async () => {
  const row = { date: new Date().toISOString().slice(0, 10), ts: new Date().toISOString() };
  try {
    const wk = await getJson(`https://api.npmjs.org/downloads/point/last-week/${PKG}`);
    if (wk.status === 404) { row.published = false; row.npm_downloads_last_week = 0; }
    else row.npm_downloads_last_week = wk.body.downloads;
  } catch (e) { row.npm_last_week_error = e.message; }
  try {
    const mo = await getJson(`https://api.npmjs.org/downloads/point/last-month/${PKG}`);
    if (mo.status === 404) { row.published = false; row.npm_downloads_last_month = 0; }
    else row.npm_downloads_last_month = mo.body.downloads;
  } catch (e) { row.npm_last_month_error = e.message; }
  try {
    const st = await getJson(`https://api.github.com/repos/${REPO}`);
    row.github_stars = st.body.stargazers_count;
    row.github_open_issues = st.body.open_issues_count;
    row.github_forks = st.body.forks_count;
  } catch (e) { row.github_error = e.message; }
  try {
    row.landing_status = await getUrl(LANDING);
  } catch (e) { row.landing_error = e.message; }

  const fs = require('fs');
  fs.appendFileSync(METRICS_FILE, JSON.stringify(row) + '\n');
  console.log(JSON.stringify(row, null, 2));
})().catch((e) => { console.error('check-metrics failed:', e.message); process.exit(1); });