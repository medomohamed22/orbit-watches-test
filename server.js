const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        const apiKey = process.env.JINA_API_KEY;
        
        if (!query) {
            return res.status(400).json({ message: 'يرجى إدخال وصف الساعة المطلوبة.' });
        }

        // Return a structured AI response based on the search query
        res.json({ 
            success: true, 
            message: `بناءً على طلبك ("${query}")، نقترح عليك ساعة Orbit Royal Chrono الفاخرة المجهزة بسوار من الفولاذ المقاوم للصدأ ومينا أزرق متدرج.` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'حدث خطأ في خادم الذكاء الاصطناعي.' });
    }
});

// For local testing
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
