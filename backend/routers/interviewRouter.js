import express from 'express';
import { evaluateAnswer, getInterviewHistory, startText, getTestResult, reEvaluateAnswer, startCustomTest } from '../controler/interviewController.js';
import getuserid from '../middleware/userauth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const interviewRouter = express.Router();

interviewRouter.get('/test/:testId', getuserid, getTestResult);
interviewRouter.post('/start', getuserid, startText);
interviewRouter.post('/start-custom', getuserid, upload.single('resume'), startCustomTest); // restart trigger
interviewRouter.post('/evaluate', getuserid, evaluateAnswer);
interviewRouter.post('/re-evaluate', getuserid, reEvaluateAnswer);
interviewRouter.get('/history', getuserid, getInterviewHistory);

export default interviewRouter;
