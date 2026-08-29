import Exa from 'exa-js';

const exa = process.env.EXA_API_KEY ? new Exa(process.env.EXA_API_KEY) : null;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  // Allow the client (same-origin on Vercel, or local dev) to call this endpoint.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!exa) return res.status(500).json({ error: 'EXA_API_KEY is not configured on the server' });

  try {
    const { query, numResults = 6 } = req.body || {};
    const q = String(query || '').trim();
    if (!q) return res.status(400).json({ error: 'query is required' });

    const limit = Math.max(1, Math.min(10, Number(numResults) || 6));
    // Canonical Exa usage: contents are nested under `contents`.
    // `type: 'auto'` is the official default; highlights return concise,
    // citable snippets the model can ground its answer on.
    const response = await exa.search(q, {
      type: 'auto',
      numResults: limit,
      contents: { text: true, highlights: true },
    });

    const results = (response.results || []).map((r) => {
      let domain = '';
      try { domain = new URL(r.url).hostname.replace(/^www\./, ''); } catch {}
      const snippet = Array.isArray(r.highlights) && r.highlights.length
        ? r.highlights.join('\n').slice(0, 2400)
        : (typeof r.text === 'string' ? r.text.replace(/\s+/g, ' ').trim().slice(0, 2400) : '');
      return {
        title: r.title || domain || r.url,
        url: r.url,
        domain,
        publishedDate: r.publishedDate || null,
        author: r.author || null,
        text: snippet,
      };
    });

    return res.status(200).json({ query: q, results });
  } catch (error) {
    console.error('Exa search error:', error);
    return res.status(500).json({ error: error?.message || 'Web search failed' });
  }
}
