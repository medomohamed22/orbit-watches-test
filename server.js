const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    const apiKey = process.env.JINA_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ message: 'Configuration error' });
    }

    try {
        // Mocking Jina Search response for demo purposes
        res.json({ message: `نتائج البحث عن: "${query}" - تم العثور على 3 ساعات تطابق وصفك.` });
    } catch (error) {
        res.status(500).json({ message: 'Search failed' });
    }
});

module.exports = app;
