const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    speciality: { type: String, required: true },
    steps: [{ type: String }],
    correctAnswer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

const MedicalCase = mongoose.model('MedicalCase', caseSchema);
module.exports = MedicalCase;