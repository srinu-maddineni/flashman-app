import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../AppContext';
import { toast } from 'react-toastify';
import { image } from '../assets/image';

const GovTest = () => {
  const { isLoggedIn, userData, BACKEND_URL, loading: authLoading } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();

  const examType = location.state?.examType || 'UPSC';
  const subject = location.state?.subject || 'General Studies';
  const questionSource = location.state?.questionSource || 'ai';

  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(25).fill(''));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 15 minutes overall timer = 900 seconds
  const [timeLeft, setTimeLeft] = useState(900);
  const timerRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, authLoading, navigate]);

  // Warn user before leaving/refreshing page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "You have an active exam session. Are you sure you want to leave?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Generate questions on mount or load existing session from localStorage
  useEffect(() => {
    const generateQuestions = async () => {
      // 1. Check if there is an active session in localStorage
      try {
        const savedSession = localStorage.getItem('activeGovTest');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          // Check if it matches the current parameters and user
          if (
            parsed.examType === examType &&
            parsed.subject === subject &&
            parsed.questionSource === questionSource &&
            (!parsed.userId || !userData?._id || parsed.userId === userData._id)
          ) {
            console.log("[GovTest] Resuming existing exam session:", parsed.testId);
            setTestId(parsed.testId);
            setQuestions(parsed.questions);
            setAnswers(parsed.answers || Array(parsed.questions.length).fill(''));
            setTimeLeft(parsed.timeLeft ?? 900);
            setCurrentIndex(parsed.currentIndex || 0);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("[GovTest] Error reading saved session from localStorage:", err);
      }

      // 2. Otherwise generate brand new questions from backend
      try {
        setLoading(true);
        const response = await axios.post(`${BACKEND_URL}/api/gov/start`, { examType, subject, questionSource });
        if (response.data.success) {
          const newTestId = response.data.testId;
          const newQuestions = response.data.questions;
          const initialAnswers = Array(newQuestions.length).fill('');

          setTestId(newTestId);
          setQuestions(newQuestions);
          setAnswers(initialAnswers);
          setTimeLeft(900);
          setCurrentIndex(0);

          // Save new session parameters to localStorage
          const sessionToSave = {
            userId: userData?._id || null,
            examType,
            subject,
            questionSource,
            testId: newTestId,
            questions: newQuestions,
            answers: initialAnswers,
            timeLeft: 900,
            currentIndex: 0
          };
          localStorage.setItem('activeGovTest', JSON.stringify(sessionToSave));
        } else {
          toast.error(response.data.message || 'Failed to generate test questions.');
          navigate('/dashboard');
        }
      } catch (err) {
        let errMsg = err.response?.data?.message || err.message || 'Failed to connect to the grading server.';
        if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("too many requests") || errMsg.toLowerCase().includes("rate limit")) {
          errMsg = "Gemini API rate limit exceeded. Please wait 30-60 seconds before trying again, or set up billing in your Google AI Studio console.";
        }
        toast.error(errMsg);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isLoggedIn) {
      generateQuestions();
    }
  }, [isLoggedIn, authLoading, examType, subject, questionSource, userData?._id]);

  // Persist answers, currentIndex, and timeLeft to localStorage whenever they change
  useEffect(() => {
    if (loading || !testId) return;
    try {
      const savedSession = localStorage.getItem('activeGovTest');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        parsed.timeLeft = timeLeft;
        parsed.answers = answers;
        parsed.currentIndex = currentIndex;
        localStorage.setItem('activeGovTest', JSON.stringify(parsed));
      }
    } catch (err) {
      console.error("[GovTest] Error persisting session status:", err);
    }
  }, [timeLeft, answers, currentIndex, loading, testId]);

  // Start the countdown timer once questions are loaded
  useEffect(() => {
    if (loading || !questions.length) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions]);

  const handleTimeOut = async () => {
    toast.warning("Time limit exceeded! Auto-submitting your answers...");
    await submitTestAnswers(answers);
  };

  const handleOptionSelect = (optionChar) => {
    setAnswers(prev => {
      const newAns = [...prev];
      newAns[currentIndex] = optionChar;
      return newAns;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    const unansweredCount = answers.filter(a => a === '').length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }
    await submitTestAnswers(answers);
  };

  const submitTestAnswers = async (finalAnswers) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/gov/submit`, {
        testId,
        answers: finalAnswers
      });

      if (response.data.success) {
        localStorage.removeItem('activeGovTest'); // Clear saved session on submission
        toast.success("Exam completed and graded!");
        navigate('/gov-testdetail', { state: { testId } });
      } else {
        toast.error(response.data.message || 'Failed to submit exam.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoClick = () => {
    const confirmExit = window.confirm("Are you sure you want to exit the test? Your current progress will be lost.");
    if (confirmExit) {
      localStorage.removeItem('activeGovTest');
      navigate('/dashboard');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.name) return 'U';
    return userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading || !questions || questions.length === 0 || !questions[currentIndex]) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center font-sans p-6">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-slate-900 mt-6 animate-pulse">Consulting Gemini AI...</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm text-center">
          Generating 25 premium {questionSource === 'pyq' ? "Previous Year" : "AI-generated"} multiple-choice questions for <strong className="text-slate-800">{examType}</strong> - {subject}. This might take a few seconds.
        </p>
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentIndex] || '';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
          <img src={image.flash} className="h-10 w-auto object-contain" alt="Flash logo" />
          <span className="text-2xl font-extrabold tracking-wider hidden sm:inline-block">
            <span className="text-red-600">Flash</span>
            <span className="text-yellow-500">Man</span>
          </span>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-200 py-1.5 px-3 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm">
            {getUserInitials()}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden md:block">
            {examType} Exam Mock Test
          </span>
        </div>
      </nav>

      {/* Main Testing Container */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">

          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-slate-850 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Exam Timer & Status Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 border border-slate-250 p-4 rounded-2xl gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span className={timeLeft < 60 ? "text-rose-500 animate-pulse text-lg" : "text-slate-500 text-lg"}>
                ⏱️
              </span>
              <span>Exam Time Remaining:</span>
              <span className={`font-mono text-lg ${timeLeft < 60 ? "text-rose-600 font-bold animate-pulse" : "text-slate-800 font-bold"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition flex items-center justify-center cursor-pointer ${
                    currentIndex === idx
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : answers[idx] !== ''
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 hover:border-slate-400 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-6 relative">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Question Prompt</p>
            <h2 className="text-lg font-bold text-slate-900 mt-3 leading-relaxed">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-500">Select one option:</p>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((optionText, idx) => {
                const char = optionLabels[idx];
                const isSelected = selectedAnswer === char;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionSelect(char)}
                    className={`text-left p-4 rounded-xl border-2 transition duration-150 cursor-pointer flex items-start gap-4 hover:bg-slate-50 group ${
                      isSelected
                        ? 'bg-slate-900 hover:bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-350 text-slate-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-white text-slate-900 border-white'
                        : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200'
                    }`}>
                      {char}
                    </span>
                    <span className="text-sm font-medium leading-relaxed">{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-5 py-2.5 border rounded-xl font-semibold text-xs tracking-wide transition cursor-pointer ${
                currentIndex === 0
                  ? 'border-slate-100 text-slate-300'
                  : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600'
              }`}
            >
              ➔ Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-350 text-white font-bold rounded-xl text-xs tracking-wide shadow-xs transition duration-150 cursor-pointer flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Grading Exam...
                  </>
                ) : (
                  'Submit & Finish Exam ➔'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs tracking-wide transition cursor-pointer"
              >
                Next Question ➔
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GovTest;
