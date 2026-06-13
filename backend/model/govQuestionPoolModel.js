import mongoose from 'mongoose';

const govQuestionPoolSchema = new mongoose.Schema({
    examType: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, lowercase: true, trim: true },
    questionSource: { type: String, required: true, lowercase: true, trim: true }, // 'ai' or 'pyq'
    questionText: { type: String, required: true, trim: true },
    options: [{ type: String, required: true }],
    correctOption: { type: String, required: true, trim: true }, // 'A', 'B', 'C', or 'D'
    explanation: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});

// Compound index for high performance querying
govQuestionPoolSchema.index({ examType: 1, subject: 1, questionSource: 1 });

const govQuestionPoolModel = mongoose.models.govquestionpool || mongoose.model('govquestionpool', govQuestionPoolSchema);

export default govQuestionPoolModel;
