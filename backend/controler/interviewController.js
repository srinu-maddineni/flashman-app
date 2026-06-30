import { GoogleGenerativeAI } from '@google/generative-ai';
import interviewModel from '../model/interviewModel.js';
import crypto from 'crypto'
import mongoose from 'mongoose';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export const startText = async (req, res) => {
    const { techStack, difficulty = 'Mid-Level' } = req.body;
    console.log(`[START TEST] Request received for techStack: "${techStack}", difficulty: "${difficulty}"`);

    if (!techStack) return res.json({ success: false, message: "Please provide tech stack" })

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[START TEST] GEMINI_API_KEY is not defined in backend/.env");
            return res.json({ success: false, message: "require GEMINI API  KEY" })
        }

        console.log("[START TEST] Initializing Gemini AI client...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a Senior Software Engineering interviewer.
        Generate exactly 10 random, high-quality technical interview questions at a "${difficulty}" experience level for the tech stack: "${techStack}".
        The questions should cover a good mix of topics (e.g., core concepts, best practices, advanced features, optimization) appropriate for a ${difficulty} engineer.
        Each question must be short and direct, suitable for a candidate to write a text response.
        Return your response as a single, valid, parsable JSON array of strings ONLY. Do not wrap the JSON in markdown code blocks like \`\`\`json or add any other text before/after.
        Example output format:
        [
          "First question text?",
          "Second question text?",
          "Third question text?"
        ]`

        console.log("[START TEST] Calling model.generateContent...");
        const result = await model.generateContent(prompt)

        console.log("[START TEST] Received response, parsing text...");
        const text = result.response.text();

        const cleanText = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        const questions = JSON.parse(cleanText)
        const testId = crypto.randomUUID()

        console.log("[START TEST] Questions generated successfully! testId:", testId);
        return res.json({ success: true, testId, questions })
    }
    catch (error) {
        console.error("[START TEST] Error in startText:", error);
        let errMsg = error.message || "";
        if (errMsg.includes("API key expired") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key")) {
            errMsg = "Your Google Gemini API Key has expired or is invalid. Please get a fresh key from Google AI Studio (https://aistudio.google.com/) and update GEMINI_API_KEY in backend/.env.";
        }
        return res.json({ success: false, message: errMsg })
    }
}

export const evaluateAnswer = async (req, res) => {
    const { testId, techStack, question, answer, difficulty, wpm, duration } = req.body;

    const userId = req.userId; // Populated by your getuserid (userauth) middleware

    if (!testId || !techStack || !question || !answer) {
        return res.json({ success: false, message: "required fields are empty." });
    }

    try {
        const newRecord = new interviewModel({
            userId,
            testId,
            techStack,
            question,
            answer,
            score: null,
            feedBack: "",
            modelAnswer: "",
            difficulty: difficulty || 'Mid-Level',
            wpm,
            duration
        })
        await newRecord.save()

        evalWithGeminiAiInBackground(newRecord._id, question, answer, wpm)
        return res.json({
            success: true,
            message: "Answer saved Evaluating..."
        });

    } catch (error) {
        console.error("Gemini Q&A evaluation error:", error);
        return res.json({ success: false, message: error.message });
    }
};

const evalWithGeminiAiInBackground = async (recodeId, question, answer, wpm, attempt = 1) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log("GEMINI API KEY IS NOT CONFIGURED ON THE SERVER")
            return
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let paceCritiquePrompt = "";
        if (wpm) {
            paceCritiquePrompt = `\nThe candidate spoke their response at a pace of ${wpm} Words Per Minute (WPM). In the feedback, please write a brief sentence commenting on their speaking pace (optimal pace is 110-150 WPM; if they are >150 WPM they are fast/rushed, if <110 WPM they are slow/deliberate).`;
        }

        const prompt = `
        You are a Senior Software Engineering interviewer.
        Evaluate the candidate's answer to the following technical interview question:
        
        Question: "${question}"
        Candidate's Answer: "${answer}"
        ${paceCritiquePrompt}

        Analyze the answer and provide your response as a single, valid, parsable JSON object ONLY. Do not wrap the JSON in markdown code blocks like \`\`\`json or add any other text before/after. The JSON structure MUST be exactly like this:
        {
          "score": 8,
          "feedBack": "Write a 3-4 sentence detailed critique here on technical accuracy and communication style.",
          "modelAnswer": "Write a concise, perfect model answer to the question here."
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean up markdown block characters if Gemini adds them
        const cleanText = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        const evalData = JSON.parse(cleanText);

        await interviewModel.findByIdAndUpdate(recodeId, {
            score: evalData.score,
            feedBack: evalData.feedBack,
            modelAnswer: evalData.modelAnswer
        })
    }
    catch (error) {
        console.error(`[GEMINI EVAL ATTEMPT ${attempt} FAILED] for record ${recodeId}:`, error.message);
        
        const maxAttempts = 6;
        if (attempt < maxAttempts) {
            const isQuotaError = error.message && (
                error.message.toLowerCase().includes("quota") || 
                error.message.toLowerCase().includes("limit") || 
                error.message.toLowerCase().includes("exhausted") || 
                error.message.includes("429")
            );
            // Quota/Rate limit delay: 15s, 30s, 45s, 60s, 75s
            // Other errors delay: 3s, 6s, 12s, 24s, 48s
            const delay = isQuotaError 
                ? attempt * 15000 
                : Math.pow(2, attempt) * 1500 + 1500;

            console.log(`[GEMINI RETRY] ${isQuotaError ? 'Quota/Rate-limit error detected. Heavy backoff applied.' : ''} Retrying attempt ${attempt + 1} in ${delay}ms...`);
            
            setTimeout(() => {
                evalWithGeminiAiInBackground(recodeId, question, answer, wpm, attempt + 1);
            }, delay);
        } else {
            console.error(`[GEMINI EVAL PERMANENT FAILURE] for record ${recodeId}`);
            let errorMsg = "AI evaluation failed due to API quota constraints or network limits. Please click 'Re-Evaluate Grade' below to try again.";
            
            if (error.message && (error.message.includes("API key expired") || error.message.includes("API_KEY_INVALID"))) {
                errorMsg = "AI evaluation failed: The server API key is expired or invalid. Please check your system configuration.";
            }

            await interviewModel.findByIdAndUpdate(recodeId, {
                score: -1, // Mark as failed evaluation
                feedBack: errorMsg,
                modelAnswer: "Evaluation failed."
            });
        }
    }
}

export const getTestResult = async (req, res) => {
    const { testId } = req.params
    const userId = req.userId

    if (!testId) {
        return res.json({ success: false, message: "require test id" })
    }

    try {
        const results = await interviewModel.find({ testId, userId })
        if (results.length === 0) return res.json({ success: false, message: "test not found" })
        return res.json({ success: true, results })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const getInterviewHistory = async (req, res) => {
    const userId = req.userId;
    try {
        const history = await interviewModel.aggregate([
            // 1. Filter records matching this user's ID
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },

            // 2. Group records by testId
            {
                $group: {
                    _id: "$testId",
                    techStack: { $first: "$techStack" },
                    createdAt: { $first: "$createdAt" },
                    totalQuestions: { $sum: 1 },
                    // Count how many questions have been evaluated (where score is not null)
                    evaluatedQuestions: {
                        $sum: { $cond: [{ $ne: ["$score", null] }, 1, 0] }
                    },
                    // Calculate the average score for this test (exclude failed evaluations with score -1)
                    averageScore: { $avg: { $cond: [{ $gte: ["$score", 0] }, "$score", null] } }
                }
            },

            // 3. Sort tests by newest first
            { $sort: { createdAt: -1 } }
        ]);
        return res.json({ success: true, history });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const reEvaluateAnswer = async (req, res) => {
    const { recordId } = req.body;
    const userId = req.userId;

    if (!recordId) {
        return res.json({ success: false, message: "Missing record ID" });
    }

    try {
        const record = await interviewModel.findOne({ _id: recordId, userId });
        if (!record) {
            return res.json({ success: false, message: "Evaluation record not found" });
        }

        // Reset details to null to notify client to resume polling
        record.score = null;
        record.feedBack = "";
        record.modelAnswer = "";
        await record.save();

        // Fire background evaluation again
        evalWithGeminiAiInBackground(record._id, record.question, record.answer, record.wpm);

        return res.json({ success: true, message: "Re-evaluation started." });
    } catch (error) {
        console.error("Re-evaluation error:", error);
        return res.json({ success: false, message: error.message });
    }
};

export const startCustomTest = async (req, res) => {
    const { jobDescription, difficulty = 'Mid-Level' } = req.body;
    const file = req.file;

    console.log(`[START CUSTOM TEST] Request received. File present: ${!!file}, difficulty: "${difficulty}"`);

    if (!jobDescription) {
        return res.json({ success: false, message: "Please provide a job description" });
    }
    if (!file) {
        return res.json({ success: false, message: "Please upload your resume" });
    }

    try {
        let resumeText = "";
        
        if (file.mimetype === 'application/pdf') {
            console.log("[START CUSTOM TEST] Parsing PDF resume...");
            const parsed = await pdf(file.buffer);
            resumeText = parsed.text;
        } else {
            console.log("[START CUSTOM TEST] Parsing plain text resume...");
            resumeText = file.buffer.toString('utf-8');
        }

        if (!resumeText.trim()) {
            return res.json({ success: false, message: "Resume appears to be empty or unparseable." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[START CUSTOM TEST] GEMINI_API_KEY is not defined in backend/.env");
            return res.json({ success: false, message: "Server configuration error (missing Gemini key)" });
        }

        console.log("[START CUSTOM TEST] Initializing Gemini AI...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a Senior Software Engineering interviewer.
        You are preparing an interview for a candidate based on their resume and the target job description.
        
        Candidate's Resume Content:
        """
        ${resumeText.substring(0, 10000)}
        """
        
        Target Job Description:
        """
        ${jobDescription.substring(0, 5000)}
        """
        
        Generate exactly 10 high-quality technical and situational interview questions at a "${difficulty}" level customized for this candidate.
        The questions should:
        1. Probe the candidate's actual experience and claims in their resume relative to the job requirements.
        2. Ask questions testing the key skills, patterns, and technologies described in both documents.
        3. Be concise and direct, suitable for a candidate to speak a response.
        4. Focus on deep understanding, architecture, or coding best practices.
        
        Return your response as a single, valid, parsable JSON array of strings ONLY. Do not wrap the JSON in markdown code blocks like \`\`\`json or add any other text before/after.
        Example output format:
        [
          "First custom question?",
          "Second custom question?",
          "Third custom question?"
        ]`;

        console.log("[START CUSTOM TEST] Calling Gemini to generate questions...");
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const cleanText = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        const questions = JSON.parse(cleanText);
        const testId = crypto.randomUUID();

        console.log("[START CUSTOM TEST] Questions generated successfully! testId:", testId);
        return res.json({ success: true, testId, questions });
    }
    catch (error) {
        console.error("[START CUSTOM TEST] Error:", error);
        return res.json({ success: false, message: error.message || "Failed to generate custom interview questions" });
    }
};

