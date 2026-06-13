import mongoose from 'mongoose';

const govTestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    testId: { type: String, required: true, unique: true },
    examType: { type: String, required: true }, // e.g. 'UPSC', 'SSC CGL', 'Banking', 'Railways', 'Defence'
    subject: { type: String, required: true },  // e.g. 'Polity', 'Quantitative Aptitude', etc.
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }], // 4 multiple choice options
        correctOption: { type: String, required: true }, // 'A', 'B', 'C', or 'D'
        explanation: { type: String, required: true },
        selectedOption: { type: String, default: '' }, // 'A', 'B', 'C', or 'D' (blank if skipped)
        isCorrect: { type: Boolean, default: false }
    }],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 25 },
    questionSource: { type: String, default: 'ai' }, // 'ai' or 'pyq'
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const govTestModel = mongoose.models.govtest || mongoose.model('govtest', govTestSchema);

export default govTestModel;
