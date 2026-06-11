import express from 'express';
import { submitFeedback, getFeedbacks, checkTestFeedback } from '../controler/feedbackController.js';
import getuserid from '../middleware/userauth.js';

const feedbackRouter = express.Router();

feedbackRouter.post('/submit', getuserid, submitFeedback);
feedbackRouter.get('/all', getFeedbacks);
feedbackRouter.get('/check/:testId', getuserid, checkTestFeedback);

export default feedbackRouter;
