const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalCase', required: true },
    result: { type: String, required: true },
    feedback: { type: String, required: true },
    timeTaken: { type: Number, required: true, min: 1 }, // Time taken in minutes
    score: { type: Number, required: true, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const TrainingReport = mongoose.model('TrainingReport', reportSchema);
module.exports = TrainingReport;
