import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    testId: { type: String, required: true },
    techStack: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    score: { type: Number },
    feedBack: { type: String },
    modelAnswer: { type: String },
    difficulty: { type: String, default: 'Mid-Level' },
    wpm: { type: Number },
    duration: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const interviewModel = mongoose.models.interview || mongoose.model('interview', interviewSchema);

export default interviewModel;
