require('dotenv').config();
const express = require('express');
const { PythonShell } = require('python-shell');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// إعداد الخادم لقبول JSON
app.use(express.json());

// أمان إضافي
app.use(cors());
app.use(helmet());

// معدل الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // 100 طلب لكل IP
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use(limiter);

// مسار رئيسي افتراضي
app.get('/', (req, res) => {
    res.send('Server is running! Welcome to Medical AI Bot.');
});

// مسار الذكاء الاصطناعي: سؤال طبيب وإجابة
app.post('/ask-ai', (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    const options = {
        args: [question]
    };

    // تشغيل سكربت Python لتحليل السؤال
    PythonShell.run('ask_ai.py', options, (err, results) => {
        if (err) {
            console.error('Error processing AI request:', err);
            return res.status(500).json({ error: 'Failed to process request' });
        }

        res.status(200).json({ answer: results[0] });
    });
});

// تشغيل الخادم
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Server is running securely on port ${PORT}`);
});
