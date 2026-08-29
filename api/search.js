import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.EXA_API_KEY) return res.status(500).json({ error: 'EXA_API_KEY is not configured on Vercel' });

  try {
    const { query, numResults = 6 } = req.body || {};
    const q = String(query || '').trim();
    if (!q) return res.status(400).json({ error: 'query is required' });

    const limit = Math.max(1, Math.min(10, Number(numResults) || 6));
    const response = await exa.search(q, {
      numResults: limit,
      type: 'auto',
      contents: { highlights: true },
    });

    const results = (response.results || []).map((r) => {
      let domain = '';
      try { domain = new URL(r.url).hostname.replace(/^www\./, ''); } catch {}
      return {
        title: r.title || domain || r.url,
        url: r.url,
        domain,
        publishedDate: r.publishedDate || null,
        author: r.author || null,
        text: Array.isArray(r.highlights) ? r.highlights.join('\n').slice(0, 2400) : '',
      };
    });

    return res.status(200).json({ query: q, results });
  } catch (error) {
    console.error('Exa search error:', error);
    return res.status(500).json({ error: error?.message || 'Web search failed' });
  }
}
