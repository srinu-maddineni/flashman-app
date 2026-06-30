import { GoogleGenerativeAI } from '@google/generative-ai';
import govTestModel from '../model/govTestModel.js';
import govQuestionPoolModel from '../model/govQuestionPoolModel.js';
import { poolCache, userSeenCache } from '../config/cacheManager.js';
import crypto from 'crypto';

const activeGenerations = new Map(); // userId -> Promise


const generateQuestionsBatch = async (examType, subject, questionSource, count, batchIndex) => {
    console.log(`[START GOV TEST] Batch ${batchIndex}: Starting generation of ${count} questions via Gemini...`);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in backend/.env");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        questionText: { type: "STRING" },
                        options: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        },
                        correctOption: { type: "STRING" },
                        explanation: { type: "STRING" }
                    },
                    required: ["questionText", "options", "correctOption", "explanation"]
                }
            }
        }
    });

    let focusStyle = "";
    if (batchIndex === 1) {
        focusStyle = "Focus on foundational facts, definitions, core concepts, and basic to intermediate theories/applications.";
    } else {
        focusStyle = "Focus on advanced analysis, tough logical reasoning, complex problem solving, scenarios, exceptions, and deep conceptual integration.";
    }

    let promptStyle = `Generate exactly ${count} distinct, high-quality, challenging Multiple Choice Questions (MCQs) for the exam: "${examType}" and subject/topic: "${subject}". ${focusStyle}`;
    if (questionSource === 'pyq') {
        promptStyle = `Generate exactly ${count} distinct, high-quality, authentic Previous Years Questions (PYQs) or extremely realistic reproductions of actual questions asked in past years for the exam: "${examType}" and subject/topic: "${subject}". In the explanation, mention which year or context of the exam it was asked in. ${focusStyle}`;
    }

    const prompt = `You are a professional examiner for Government Exams.
${promptStyle}
Each question must have exactly 4 options: A, B, C, and D.
For each question, provide:
1. The question text.
2. An array of 4 options (strings).
3. The correct option letter (must be exactly one of "A", "B", "C", or "D").
4. A detailed, clear explanation explaining why that option is correct.

Return your response as a single, valid, parsable JSON array of objects ONLY.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let cleanText = text.replace(/```json/gi, "").replace(/```/gi, "").trim();

    try {
        const parsed = JSON.parse(cleanText);
        console.log(`[START GOV TEST] Batch ${batchIndex}: Successfully parsed ${parsed.length} questions from Gemini.`);
        return parsed;
    } catch (parseError) {
        console.warn(`[START GOV TEST] Batch ${batchIndex}: Gemini JSON.parse failed, attempting control character sanitization:`, parseError.message);
        const sanitized = cleanText.replace(/[\u0000-\u001F]+/g, (match) => {
            if (match === '\n') return '\\n';
            if (match === '\r') return '\\r';
            if (match === '\t') return '\\t';
            return '';
        });
        const parsed = JSON.parse(sanitized);
        console.log(`[START GOV TEST] Batch ${batchIndex}: Successfully parsed ${parsed.length} questions from Gemini after sanitization.`);
        return parsed;
    }
};;

export const startGovTest = async (req, res) => {
    const { examType, subject, questionSource = 'ai' } = req.body;
    const userId = req.userId;

    console.log(`[START GOV TEST] Request received for examType: "${examType}", subject: "${subject}", source: "${questionSource}"`);

    if (!examType || !subject) {
        return res.json({ success: false, message: "Please provide exam type and subject" });
    }

    const normalizedExamType = examType.toLowerCase().trim();
    const normalizedSubject = subject.toLowerCase().trim();
    const normalizedSource = questionSource.toLowerCase().trim();

    // If there is already an active generation for this user, wait for it
    if (activeGenerations.has(userId)) {
        console.log(`[START GOV TEST] User ${userId} has an active generation in progress. Awaiting its completion...`);
        try {
            const result = await activeGenerations.get(userId);
            return res.json(result);
        } catch (err) {
            console.error(`[START GOV TEST] Awaited generation failed for user ${userId}:`, err);
            // If the active one failed, we'll fall through and let this request try again
        }
    }

    const generateAndSaveTest = async () => {
        // Check for any existing incomplete test for this user
        const activeTest = await govTestModel.findOne({ userId, isCompleted: false });
        if (activeTest) {
            if (
                activeTest.examType.toLowerCase().trim() === normalizedExamType &&
                activeTest.subject.toLowerCase().trim() === normalizedSubject &&
                activeTest.questionSource.toLowerCase().trim() === normalizedSource
            ) {
                console.log(`[START GOV TEST] Resuming existing active test ${activeTest.testId} for user ${userId}`);
                
                // Filter out correct answers and explanations when sending to client to prevent cheating
                const clientQuestions = activeTest.questions.map((q, idx) => ({
                    index: idx,
                    questionText: q.questionText,
                    options: q.options
                }));

                return { success: true, testId: activeTest.testId, questions: clientQuestions };
            } else {
                // If starting a different exam/subject, mark the old one completed (auto-submit)
                console.log(`[START GOV TEST] Auto-submitting old active test ${activeTest.testId} for user ${userId} to start new one`);
                activeTest.isCompleted = true;
                await activeTest.save();
            }
        }

        // Enforce daily limit of exactly 5 tests per user
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const testsCountToday = await govTestModel.countDocuments({
            userId,
            createdAt: { $gte: startOfToday }
        });

        console.log(`[START GOV TEST] User ${userId} has already started ${testsCountToday} tests today.`);

        if (testsCountToday >= 5) {
            return { 
                success: false, 
                message: "You have reached your daily limit of 5 mock tests. Please try again tomorrow!" 
            };
        }

        // 1. Get seen questions list from Cache (fallback to DB)
        let seenSet = userSeenCache.get(userId);
        if (!seenSet) {
            const seenList = await govTestModel.distinct("questions.questionText", { userId });
            seenSet = new Set(seenList.map(t => t.trim().toLowerCase()));
            userSeenCache.set(userId, seenSet, 24 * 60 * 60); // 24 hours TTL
        }

        // 2. Get pool questions from Cache (fallback to DB)
        const cacheKey = `${normalizedExamType}:${normalizedSubject}:${normalizedSource}`;
        let pool = poolCache.get(cacheKey);
        if (!pool) {
            pool = await govQuestionPoolModel.find({
                examType: normalizedExamType,
                subject: normalizedSubject,
                questionSource: normalizedSource
            });
            poolCache.set(cacheKey, pool, 4 * 60 * 60); // 4 hours TTL
        }

        // 3. Filter pool for unseen questions (in memory)
        let unseen = pool.filter(q => !seenSet.has(q.questionText.trim().toLowerCase()));

        // 4. If less than 25 unseen questions, call Gemini to replenish pool (cold start / exhausted)
        if (unseen.length < 25) {
            const geminiKey = process.env.GEMINI_API_KEY;
            if (!geminiKey) {
                console.error("[START GOV TEST] No GEMINI_API_KEY defined in backend/.env");
                return { success: false, message: "GEMINI_API_KEY is not configured." };
            }

            console.log(`[START GOV TEST] Pool has only ${unseen.length} unseen questions. Calling Gemini to generate a fresh batch of 25...`);
            const startTime = Date.now();

            // Generate 25 new questions in parallel (12 foundational, 13 advanced)
            const [batch1, batch2] = await Promise.all([
                generateQuestionsBatch(examType, subject, questionSource, 12, 1),
                generateQuestionsBatch(examType, subject, questionSource, 13, 2)
            ]);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`[START GOV TEST] Gemini batch generation finished in ${duration}s.`);

            const generatedQuestions = [...batch1, ...batch2];
            if (generatedQuestions.length === 0) {
                return { success: false, message: "Could not generate questions. Please try again." };
            }

            // Save new unique questions to DB pool
            const newPoolDocs = [];
            for (const q of generatedQuestions) {
                const isDuplicate = pool.some(pq => pq.questionText.trim().toLowerCase() === q.questionText.trim().toLowerCase());
                if (!isDuplicate) {
                    newPoolDocs.push({
                        examType: normalizedExamType,
                        subject: normalizedSubject,
                        questionSource: normalizedSource,
                        questionText: q.questionText,
                        options: q.options,
                        correctOption: q.correctOption,
                        explanation: q.explanation
                    });
                }
            }

            if (newPoolDocs.length > 0) {
                const savedDocs = await govQuestionPoolModel.insertMany(newPoolDocs);
                pool.push(...savedDocs);
                poolCache.set(cacheKey, pool, 4 * 60 * 60);
            }

            // Re-evaluate unseen questions list
            unseen = pool.filter(q => !seenSet.has(q.questionText.trim().toLowerCase()));
        }

        // 5. Fisher-Yates shuffle for unbiased random sampling, then take 25
        for (let i = unseen.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unseen[i], unseen[j]] = [unseen[j], unseen[i]];
        }
        const finalQuestions = unseen.slice(0, 25);

        if (finalQuestions.length === 0) {
            return { success: false, message: "No questions available in the pool. Please try again." };
        }

        const testId = crypto.randomUUID();

        // 6. Save the test session to the database
        const newTest = new govTestModel({
            userId,
            testId,
            examType,
            subject,
            questionSource,
            questions: finalQuestions.map(q => ({
                questionText: q.questionText,
                options: q.options,
                correctOption: q.correctOption,
                explanation: q.explanation,
                selectedOption: '',
                isCorrect: false
            })),
            score: 0,
            totalQuestions: finalQuestions.length,
            isCompleted: false
        });

        await newTest.save();

        // 7. Filter out correct answers and explanations when sending to client to prevent cheating
        const clientQuestions = finalQuestions.map((q, idx) => ({
            index: idx,
            questionText: q.questionText,
            options: q.options
        }));

        // 8. Update user's seenQuestions in cache
        finalQuestions.forEach(q => seenSet.add(q.questionText.trim().toLowerCase()));
        userSeenCache.set(userId, seenSet, 24 * 60 * 60);

        console.log(`[START GOV TEST] Mock test session created successfully! testId: ${testId}`);
        return { success: true, testId, questions: clientQuestions };
    };

    const generationPromise = generateAndSaveTest();
    activeGenerations.set(userId, generationPromise);

    try {
        const result = await generationPromise;
        return res.json(result);
    } catch (error) {
        console.error("[START GOV TEST] Error in startGovTest:", error);
        let errMsg = error.message || "";
        if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("too many requests") || errMsg.toLowerCase().includes("rate limit")) {
            errMsg = "API rate limit exceeded. Please wait 30-60 seconds before trying again, or set up billing in your Google AI Studio console.";
        }
        return res.json({ success: false, message: errMsg });
    } finally {
        activeGenerations.delete(userId);
    }
};

export const submitGovTest = async (req, res) => {
    const { testId, answers } = req.body; // answers is an array of strings e.g. ['A', 'B', 'C', '', ...]
    const userId = req.userId;

    if (!testId || !answers || !Array.isArray(answers)) {
        return res.json({ success: false, message: "Required fields are empty or invalid." });
    }

    try {
        const testRecord = await govTestModel.findOne({ testId, userId });
        if (!testRecord) {
            return res.json({ success: false, message: "Test record not found." });
        }

        let calculatedScore = 0;
        testRecord.questions.forEach((q, idx) => {
            const userAnswer = answers[idx] || '';
            q.selectedOption = userAnswer;
            
            const isCorrect = userAnswer.trim().toUpperCase() === q.correctOption.trim().toUpperCase();
            q.isCorrect = isCorrect;
            
            if (isCorrect) {
                calculatedScore += 1;
            }
        });

        testRecord.score = calculatedScore;
        testRecord.isCompleted = true;
        await testRecord.save();

        return res.json({
            success: true,
            message: "Test submitted and graded successfully.",
            test: testRecord
        });

    } catch (error) {
        console.error("[SUBMIT GOV TEST] Error:", error);
        return res.json({ success: false, message: error.message });
    }
};

export const getGovTestResult = async (req, res) => {
    const { testId } = req.params;
    const userId = req.userId;

    if (!testId) {
        return res.json({ success: false, message: "Required test ID is missing." });
    }

    try {
        const testRecord = await govTestModel.findOne({ testId, userId });
        if (!testRecord) {
            return res.json({ success: false, message: "Test not found." });
        }
        return res.json({ success: true, test: testRecord });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const getGovTestHistory = async (req, res) => {
    const userId = req.userId;
    try {
        const history = await govTestModel.find({ userId }).sort({ createdAt: -1 });
        return res.json({ success: true, history });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
