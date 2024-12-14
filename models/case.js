const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, minlength: 10 },
    speciality: { type: String, required: true, enum: ['Cardiology', 'Radiology', 'Neurology', 'General'] },
    steps: [{ type: String }],
    correctAnswer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

caseSchema.plugin(mongoosePaginate);

const MedicalCase = mongoose.model('MedicalCase', caseSchema);
module.exports = MedicalCase;
