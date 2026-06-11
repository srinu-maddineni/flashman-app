import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    feedbackType: { type: String, enum: ['general', 'test'], default: 'general' },
    testId: { type: String },
    techStack: { type: String },
    difficulty: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const feedbackModel = mongoose.models.feedback || mongoose.model('feedback', feedbackSchema);

export default feedbackModel;
