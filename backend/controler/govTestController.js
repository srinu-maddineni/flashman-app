import { GoogleGenerativeAI } from '@google/generative-ai';
import govTestModel from '../model/govTestModel.js';
import crypto from 'crypto';

const callGeminiFallback = async (examType, subject, questionSource, count, batchIndex) => {
    console.log(`[START GOV TEST] Batch ${batchIndex}: Groq failed. Initiating Gemini fallback...`);
    const apiKeys = process.env.GEMINI_API_KEYS
        ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean)
        : [process.env.GEMINI_API_KEY];

    if (!apiKeys.length || !apiKeys[0]) {
        throw new Error("No Gemini API keys configured for fallback.");
    }

    let lastError = null;
    const startIndex = Math.floor(Math.random() * apiKeys.length);

    for (let i = 0; i < apiKeys.length; i++) {
        const keyIndex = (startIndex + i) % apiKeys.length;
        const apiKey = apiKeys[keyIndex];

        try {
            console.log(`[START GOV TEST] Batch ${batchIndex}: Trying Gemini Key index ${keyIndex}...`);
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
                console.log(`[START GOV TEST] Batch ${batchIndex}: Gemini Key index ${keyIndex} successfully parsed ${parsed.length} questions.`);
                return parsed;
            } catch (parseError) {
                console.warn(`[START GOV TEST] Batch ${batchIndex}: Gemini parsing failed, attempting sanitization:`, parseError.message);
                const sanitized = cleanText.replace(/[\u0000-\u001F]+/g, (match) => {
                    if (match === '\n') return '\\n';
                    if (match === '\r') return '\\r';
                    if (match === '\t') return '\\t';
                    return '';
                });
                const parsed = JSON.parse(sanitized);
                console.log(`[START GOV TEST] Batch ${batchIndex}: Gemini Key index ${keyIndex} parsed ${parsed.length} questions after sanitization.`);
                return parsed;
            }
        } catch (error) {
            console.warn(`[START GOV TEST] Batch ${batchIndex}: Gemini Key index ${keyIndex} failed: ${error.message}`);
            lastError = error;
            continue;
        }
    }

    throw lastError || new Error("All backup Gemini API keys failed.");
};

const generateQuestionsBatch = async (examType, subject, questionSource, count, batchIndex) => {
    try {
        console.log(`[START GOV TEST] Batch ${batchIndex}: Starting generation of ${count} questions via Groq...`);
        const apiKey = process.env.GROG_API_KEY || process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROG_API_KEY is not defined in backend/.env");
        }

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
Each question must have exactly 4 options.
For each question, provide:
1. The question text.
2. An array of 4 options (strings).
3. The correct option letter (must be exactly one of "A", "B", "C", or "D").
4. A detailed, clear explanation explaining why that option is correct.

You must output your response as a single valid JSON object containing a key "questions" which is an array of ${count} question objects.
Each question object in the array must look exactly like this:
{
  "questionText": "Question text here",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctOption": "A",
  "explanation": "Detailed explanation here"
}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.replace(/['"\r\n\t]/g, "").trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are a professional examiner for Government Exams." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API Error: ${response.statusText} (${response.status}) - ${errText}`);
        }

        const resData = await response.json();
        const content = resData.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error("Empty content received from Groq API.");
        }

        let cleanText = content.trim();
        try {
            const parsed = JSON.parse(cleanText);
            const questionsArray = parsed.questions || [];
            console.log(`[START GOV TEST] Batch ${batchIndex}: Successfully parsed ${questionsArray.length} questions from Groq.`);
            return questionsArray;
        } catch (parseError) {
            console.warn(`[START GOV TEST] Batch ${batchIndex}: Groq JSON.parse failed, attempting control character sanitization:`, parseError.message);
            const sanitized = cleanText.replace(/[\u0000-\u001F]+/g, (match) => {
                if (match === '\n') return '\\n';
                if (match === '\r') return '\\r';
                if (match === '\t') return '\\t';
                return '';
            });
            const parsed = JSON.parse(sanitized);
            const questionsArray = parsed.questions || [];
            console.log(`[START GOV TEST] Batch ${batchIndex}: Successfully parsed ${questionsArray.length} questions from Groq after sanitization.`);
            return questionsArray;
        }
    } catch (groqError) {
        console.warn(`[START GOV TEST] Batch ${batchIndex}: Groq call failed. Fallback to Gemini... Error:`, groqError.message);
        // Fallback to Gemini
        return await callGeminiFallback(examType, subject, questionSource, count, batchIndex);
    }
};

export const startGovTest = async (req, res) => {
    const { examType, subject, questionSource = 'ai' } = req.body;
    const userId = req.userId;

    console.log(`[START GOV TEST] Request received for examType: "${examType}", subject: "${subject}", source: "${questionSource}"`);

    if (!examType || !subject) {
        return res.json({ success: false, message: "Please provide exam type and subject" });
    }

    try {
        // Enforce daily limit of exactly 5 tests per user
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const testsCountToday = await govTestModel.countDocuments({
            userId,
            createdAt: { $gte: startOfToday }
        });

        console.log(`[START GOV TEST] User ${userId} has already started ${testsCountToday} tests today.`);

        if (testsCountToday >= 5) {
            return res.json({ 
                success: false, 
                message: "You have reached your daily limit of 5 mock tests. Please try again tomorrow!" 
            });
        }

        const groqKey = process.env.GROG_API_KEY || process.env.GROQ_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!groqKey && !geminiKey) {
            console.error("[START GOV TEST] No API keys defined in backend/.env");
            return res.json({ success: false, message: "No API keys configured." });
        }

        const startTime = Date.now();
        console.log("[START GOV TEST] Calling concurrent batch generator...");

        // Launch 2 batches in parallel
        const [batch1, batch2] = await Promise.all([
            generateQuestionsBatch(examType, subject, questionSource, 12, 1),
            generateQuestionsBatch(examType, subject, questionSource, 13, 2)
        ]);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[START GOV TEST] Concurrent batch calls completed in ${duration}s!`);

        const generatedQuestions = [...batch1, ...batch2];
        console.log(`[START GOV TEST] Total questions accumulated: ${generatedQuestions.length}`);

        if (generatedQuestions.length === 0) {
            return res.json({ success: false, message: "Could not generate any questions. Please try again." });
        }

        const testId = crypto.randomUUID();

        // Save the test session to the database
        const newTest = new govTestModel({
            userId,
            testId,
            examType,
            subject,
            questionSource,
            questions: generatedQuestions.map(q => ({
                questionText: q.questionText,
                options: q.options,
                correctOption: q.correctOption,
                explanation: q.explanation,
                selectedOption: '',
                isCorrect: false
            })),
            score: 0,
            totalQuestions: generatedQuestions.length,
            isCompleted: false
        });

        await newTest.save();

        // Filter out correct answers and explanations when sending to client to prevent cheating
        const clientQuestions = generatedQuestions.map((q, idx) => ({
            index: idx,
            questionText: q.questionText,
            options: q.options
        }));

        console.log("[START GOV TEST] Questions generated and stored successfully! testId:", testId);
        return res.json({ success: true, testId, questions: clientQuestions });
    }
    catch (error) {
        console.error("[START GOV TEST] Error in startGovTest:", error);
        let errMsg = error.message || "";
        if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("too many requests") || errMsg.toLowerCase().includes("rate limit")) {
            errMsg = "API rate limit exceeded. Please wait 30-60 seconds before trying again, or set up billing in your Groq/Google Cloud console.";
        }
        return res.json({ success: false, message: errMsg });
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
