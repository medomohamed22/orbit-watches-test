AiWay — Vercel Static Deploy

1) ارفع هذا المجلد إلى GitHub ثم Import Project في Vercel
   أو استخدم Vercel CLI داخل المجلد.
2) لا يوجد Build Command مطلوب.
3) الصفحة الرئيسية هي index.html.
4) إعدادات Provider / Base URL / API Key / Model كلها من داخل AiWay.
5) التخزين محلي في متصفح المستخدم (IndexedDB + localStorage).
6) ملاحظة: الاستضافة تعطي الصفحة HTTPS وOrigin حقيقي، لكن أي Provider يمنع Browser CORS
   سيظل يحتاج Proxy/Backend من طرفك.
