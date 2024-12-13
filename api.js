const express = require('express');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const Doctor = require('../models/doctor');
const MedicalCase = require('../models/case');
require('dotenv').config();

const router = express.Router();

// إعداد رفع الصور
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// تسجيل طبيب جديد
router.post('/register', async (req, res) => {
    const { name, email, password, speciality } = req.body;
    if (!name || !email || !password || !speciality) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const doctor = new Doctor({ name, email, password: hashedPassword, speciality });
        await doctor.save();
        res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to register doctor' });
    }
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// تحليل نصوص باستخدام BioGPT
router.post('/ask', async (req, res) => {
    const { question, speciality } = req.body;
    if (!question || !speciality) {
        return res.status(400).json({ error: 'Question and speciality are required' });
    }
    try {
        const options = {
            args: [question, speciality]
        };
        PythonShell.run('scripts/analyze_text.py', options, (err, results) => {
            if (err) return res.status(500).json({ error: 'Failed to analyze question' });
            res.status(200).json({ answer: results[0] });
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process question' });
    }
});

// إضافة حالة تدريبية
router.post('/add-case', async (req, res) => {
    const { title, description, speciality, steps, correctAnswer } = req.body;
    if (!title || !description || !speciality || !steps || !correctAnswer) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const newCase = new MedicalCase({ title, description, speciality, steps, correctAnswer });
        await newCase.save();
        res.status(201).json({ message: 'Medical case added successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add medical case' });
    }
});

module.exports = router;
