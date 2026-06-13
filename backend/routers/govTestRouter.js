import express from 'express';
import { startGovTest, submitGovTest, getGovTestResult, getGovTestHistory } from '../controler/govTestController.js';
import getuserid from '../middleware/userauth.js';

const govTestRouter = express.Router();

govTestRouter.post('/start', getuserid, startGovTest);
govTestRouter.post('/submit', getuserid, submitGovTest);
govTestRouter.get('/test/:testId', getuserid, getGovTestResult);
govTestRouter.get('/history', getuserid, getGovTestHistory);

export default govTestRouter;
