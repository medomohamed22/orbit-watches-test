import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);
const buckets = globalThis.__aiwaySearchBuckets || (globalThis.__aiwaySearchBuckets = new Map());
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const SEARCH_TIMEOUT_MS = 12_000;

function clientKey(req) {
  const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}
function allowRequest(key) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= MAX_PER_WINDOW) return false;
  current.count += 1;
  return true;
}
function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Search upstream timeout')), ms); }),
  ]).finally(() => clearTimeout(timer));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.EXA_API_KEY) return res.status(500).json({ error: 'EXA_API_KEY is not configured on Vercel' });
  if (!allowRequest(clientKey(req))) return res.status(429).json({ error: 'Too many search requests. Try again shortly.' });

  try {
    const { query, numResults = 6 } = req.body || {};
    const q = String(query || '').trim();
    if (!q) return res.status(400).json({ error: 'query is required' });
    if (q.length > 1500) return res.status(400).json({ error: 'query is too long' });

    const limit = Math.max(1, Math.min(10, Number(numResults) || 6));
    const response = await withTimeout(exa.search(q, {
      numResults: limit,
      type: 'auto',
      contents: { highlights: true },
    }), SEARCH_TIMEOUT_MS);

    const results = (response.results || []).map((r) => {
      let domain = '';
      try { domain = new URL(r.url).hostname.replace(/^www\./, ''); } catch {}
      return {
        title: String(r.title || domain || r.url || '').slice(0, 500),
        url: r.url,
        domain,
        publishedDate: r.publishedDate || null,
        author: r.author || null,
        text: Array.isArray(r.highlights) ? r.highlights.join('\n').slice(0, 2400) : '',
      };
    }).filter(r => /^https?:\/\//i.test(String(r.url || '')));

    return res.status(200).json({ query: q, results });
  } catch (error) {
    console.error('Exa search error:', error);
    const timeout = /timeout/i.test(String(error?.message || ''));
    return res.status(timeout ? 504 : 500).json({ error: timeout ? 'Search provider timed out' : (error?.message || 'Web search failed') });
  }
}
