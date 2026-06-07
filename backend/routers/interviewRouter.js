import express from 'express';
import { evaluateAnswer, getInterviewHistory, startText, getTestResult, reEvaluateAnswer } from '../controler/interviewController.js';
import getuserid from '../middleware/userauth.js';

const interviewRouter = express.Router();
interviewRouter.get('/test/:testId', getuserid, getTestResult);
interviewRouter.post('/start', getuserid, startText);
interviewRouter.post('/evaluate', getuserid, evaluateAnswer);
interviewRouter.post('/re-evaluate', getuserid, reEvaluateAnswer);
interviewRouter.get('/history', getuserid, getInterviewHistory);

export default interviewRouter;
