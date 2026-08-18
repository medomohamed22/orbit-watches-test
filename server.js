const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ success: false, message: 'يرجى إدخال وصف الساعة المطلوبة.' });
        }

        // Search simulation or direct response using query keywords without breaking if Jina key isn't set
        const q = query.toLowerCase();
        let match = "ساعة Orbit Royal Chrono الفاخرة المجهزة بسوار من الفولاذ المقاوم للصدأ ومينا أزرق متدرج ومقاومة للماء حتى عمق 100 متر.";
        if (q.includes('ذهبي') || q.includes('gold')) {
            match = "ساعة Orbit Elite Gold الكلاسيكية المصنوعة من الذهب الخالص عيار 18 مع إطار مرصع بالياقوت الأزرق.";
        } else if (q.includes('رياضي') || q.includes('sport') || q.includes('جلد')) {
            match = "ساعة Orbit Sport Diver الرياضية المزودة بحزام سيليكون مرن ومقاومة فائقة للصدمات.";
        }

        res.json({ 
            success: true, 
            message: `بناءً على طلبك ("${query}")، وجدنا لك الساعة المثالية: ${match}` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'حدث خطأ في معالجة طلب البحث.' });
    }
});

// For local testing
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
