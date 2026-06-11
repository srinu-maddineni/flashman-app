import feedbackModel from '../model/feedbackModel.js';
import usermodel from '../model/usermodel.js';

// Submit new feedback (general or test-specific)
export const submitFeedback = async (req, res) => {
    const userId = req.userId;
    const { feedbackType, testId, techStack, difficulty, rating, comment } = req.body;

    if (!rating || !comment) {
        return res.json({ success: false, message: "Rating and comment are required." });
    }

    try {
        const user = await usermodel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        // Check if feedback already exists for this testId to prevent double submissions
        if (feedbackType === 'test' && testId) {
            const existing = await feedbackModel.findOne({ userId, testId, feedbackType: 'test' });
            if (existing) {
                return res.json({ success: false, message: "You have already submitted feedback for this test." });
            }
        }

        const newFeedback = new feedbackModel({
            userId,
            userName: user.name,
            userEmail: user.email,
            feedbackType: feedbackType || 'general',
            testId,
            techStack,
            difficulty,
            rating: Number(rating),
            comment
        });

        await newFeedback.save();

        return res.json({
            success: true,
            message: "Feedback submitted successfully! Thank you for your review."
        });

    } catch (error) {
        console.error("Error submitting feedback:", error);
        return res.json({ success: false, message: error.message });
    }
};

// Get all feedbacks (public/authenticated)
export const getFeedbacks = async (req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { feedbackType: type } : {};
        
        // Fetch feedbacks, sorted by newest first, limited to 50
        const feedbacks = await feedbackModel.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        return res.json({ success: true, feedbacks });
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        return res.json({ success: false, message: error.message });
    }
};

// Check if user has already submitted feedback for a specific test
export const checkTestFeedback = async (req, res) => {
    const userId = req.userId;
    const { testId } = req.params;

    if (!testId) {
        return res.json({ success: false, message: "Test ID is required." });
    }

    try {
        const existing = await feedbackModel.findOne({ userId, testId, feedbackType: 'test' });
        return res.json({ success: true, hasFeedback: !!existing });
    } catch (error) {
        console.error("Error checking test feedback:", error);
        return res.json({ success: false, message: error.message });
    }
};
