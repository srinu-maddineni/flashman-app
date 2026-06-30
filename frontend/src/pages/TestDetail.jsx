import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../AppContext';
import { toast } from 'react-toastify';
import { image } from '../assets/image';
const TestDetail = () => {
  const { isLoggedIn, userData, BACKEND_URL, loading: authLoading } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();

  const testId = location.state?.testId;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(0); // Default expand first question
  
  // Post-test feedback state
  const [hasFeedback, setHasFeedback] = useState(false);
  const [testRating, setTestRating] = useState(5);
  const [testComment, setTestComment] = useState('');
  const [submittingTestFeedback, setSubmittingTestFeedback] = useState(false);
  
  // Use a ref to keep track of polling interval
  const pollIntervalRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, authLoading, navigate]);
  // Fetch results function
  const fetchResults = async (showLoadingState = false) => {
    if (!testId) {
      toast.error('Test ID is missing.');
      navigate('/dashboard');
      return;
    }

    if (showLoadingState) setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/interview/test/${testId}`);
      if (response.data.success) {
        setResults(response.data.results);
      } else {
        toast.error(response.data.message || 'Failed to fetch test details.');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error fetching test details:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch test details.');
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  const handleReEvaluate = async (recordId) => {
    try {
      toast.info("Retrying AI evaluation...");
      const response = await axios.post(`${BACKEND_URL}/api/interview/re-evaluate`, { recordId });
      if (response.data.success) {
        toast.success("Re-evaluation started! Polling grade...");
        setResults(prev => prev.map(rec => rec._id === recordId ? { ...rec, score: null, feedBack: "" } : rec));
      } else {
        toast.error(response.data.message || "Failed to trigger re-evaluation.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during re-evaluation.");
    }
  };

  const checkIfFeedbackSubmitted = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/feedback/check/${testId}`);
      if (response.data.success) {
        setHasFeedback(response.data.hasFeedback);
      }
    } catch (err) {
      console.error("Error checking test feedback status:", err);
    }
  };

  const handleTestFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!testComment.trim()) {
      toast.warning("Please write a comment for your test review.");
      return;
    }
    setSubmittingTestFeedback(true);
    const currentTech = results[0]?.techStack || 'Assessment';
    const currentDifficulty = results[0]?.difficulty || 'Mid-Level';
    try {
      const response = await axios.post(`${BACKEND_URL}/api/feedback/submit`, {
        feedbackType: 'test',
        testId,
        techStack: currentTech,
        difficulty: currentDifficulty,
        rating: testRating,
        comment: testComment
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setHasFeedback(true);
        setTestComment('');
      } else {
        toast.error(response.data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error submitting feedback.");
    } finally {
      setSubmittingTestFeedback(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (isLoggedIn && testId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchResults(true);
      checkIfFeedbackSubmitted();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, testId]);

  // Handle active polling if there are pending evaluations (score is null)
  useEffect(() => {
    const hasPendingGrades = results.some(item => item.score === null || item.score === undefined);

    if (hasPendingGrades && isLoggedIn && testId) {
      // Clear any existing interval to prevent duplicates
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      // Start new polling interval
      pollIntervalRef.current = setInterval(() => {
        fetchResults(false);
      }, 5000);
    } else {
      // Stop polling when everything is evaluated
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, isLoggedIn, testId]);

  // Calculations
  const totalQuestions = results.length;
  const evaluatedQuestions = results.filter(item => item.score !== null && item.score !== undefined && item.score !== -1).length;
  const isEvaluating = results.some(item => item.score === null || item.score === undefined);

  // We only average non-negative scores (0 to 10)
  const gradedResults = results.filter(item => item.score !== null && item.score !== undefined && item.score >= 0);
  const averageScore = gradedResults.length > 0
    ? gradedResults.reduce((acc, curr) => acc + curr.score, 0) / gradedResults.length
    : 0;

  const techStack = results[0]?.techStack || 'Assessment';
  const difficulty = results[0]?.difficulty || 'Mid-Level';
  const testDate = results[0]?.createdAt 
    ? new Date(results[0].createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // Helper for score color badges
  const getScoreColor = (score) => {
    if (score === -1) return 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse';
    if (score === null || score === undefined) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-255';
    if (score >= 5) return 'text-amber-700 bg-amber-50 border-amber-255';
    return 'text-rose-700 bg-rose-50 border-rose-255';
  };

  const getScoreText = (score) => {
    if (score === -1) return 'Failed ⚠️';
    if (score === null || score === undefined) return 'Evaluating... ⏳';
    return `Score: ${score}/10`;
  };

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.name) return 'U';
    return userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center font-sans p-6">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-slate-900 mt-6 animate-pulse">Loading report...</h2>
        <p className="text-slate-500 text-sm mt-2">Fetching your assessment data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src={image.flash} className="h-10 w-auto object-contain" alt="Flash logo" />
          <span className="text-2xl font-extrabold tracking-wider hidden sm:inline-block">
            <span className="text-red-600">Flash</span>
            <span className="text-yellow-500">Man</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer border border-slate-200 py-1.5 px-3.5 rounded-xl hover:bg-slate-50"
          >
            ➔ Dashboard
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {getUserInitials()}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full p-6 lg:p-8 space-y-8 flex-1">
        
        {/* Report Overview Banner */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200 py-1 px-3 rounded-full">
                {techStack} Assessment Report
              </span>
              <span className={`text-xs font-extrabold uppercase tracking-widest py-1 px-3 rounded-full border ${
                difficulty === 'Junior' 
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                  : difficulty === 'Senior' 
                  ? 'text-rose-700 bg-rose-50 border-rose-200' 
                  : 'text-slate-700 bg-slate-100 border-slate-200'
              }`}>
                {difficulty} Level
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
              Performance Review
            </h1>
            <p className="text-slate-500 text-sm">{testDate}</p>
          </div>

          <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
            <div className="text-left">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Evaluation Status</p>
              <div className="flex items-center gap-2 mt-1">
                {isEvaluating ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                    <span className="text-sm font-semibold text-yellow-600">
                      Evaluating ({evaluatedQuestions}/{totalQuestions})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-semibold text-emerald-600">Grading Complete</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Score</p>
              <span className={`inline-block text-xl lg:text-2xl font-black mt-1 px-3 py-1 rounded-2xl border ${getScoreColor(averageScore)}`}>
                {evaluatedQuestions > 0 ? `${Math.round(averageScore * 10) / 10}/10` : 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {isEvaluating && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-700 text-sm">
            <span className="animate-spin text-lg">⏳</span>
            <p>
              Some answers are currently being analyzed by Gemini AI in the background. The page will <strong>automatically refresh</strong> as scores and critiques arrive.
            </p>
          </div>
        )}

        {/* Post-Test Feedback Option */}
        {!hasFeedback && !isEvaluating && results.length > 0 && (
          <section className="bg-white border border-slate-200 p-6 lg:p-8 rounded-3xl shadow-xs space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">How was this Assessment?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Rate the quality of the {techStack} questions and Gemini's evaluation.
                </p>
              </div>
              
              {/* Star rating selector */}
              <div className="flex gap-2 shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTestRating(star)}
                    className="text-2xl transition duration-150 cursor-pointer focus:outline-none"
                  >
                    <span className={star <= testRating ? "text-amber-400" : "text-slate-300"}>★</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleTestFeedbackSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Leave a quick review on this assessment (e.g. 'Questions were solid, evaluation was very accurate')..."
                value={testComment}
                onChange={(e) => setTestComment(e.target.value)}
                disabled={submittingTestFeedback}
                className="flex-1 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition"
                required
              />
              <button
                type="submit"
                disabled={submittingTestFeedback}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-350 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-xs transition duration-150 shrink-0"
              >
                {submittingTestFeedback ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          </section>
        )}

        {/* Detailed Question Review Accordion */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Question-by-Question Analysis</h2>
          
          <div className="space-y-4">
            {results.map((item, index) => {
              const isExpanded = expandedIndex === index;
              const hasScore = item.score !== null && item.score !== undefined && item.score !== -1;

              return (
                <div 
                  key={item._id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition"
                >
                  {/* Accordion Header */}
                  <div 
                    onClick={() => toggleAccordion(index)}
                    className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-4 pr-4">
                      <span className="text-sm font-bold text-slate-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 line-clamp-1 leading-relaxed">
                        {item.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold border px-2.5 py-1 rounded-lg ${getScoreColor(item.score)}`}>
                        {getScoreText(item.score)}
                      </span>
                      <span className={`text-slate-400 text-sm font-bold transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-6 space-y-6 bg-slate-50/20">
                      
                      {/* Full Question Text */}
                      <div className="space-y-1">
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Full Question</h4>
                        <p className="text-base text-slate-800 font-bold leading-relaxed">{item.question}</p>
                      </div>

                      {/* Candidate Answer */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Your Answer</h4>
                          
                          {/* Speaking Pace WPM Badge */}
                          {item.wpm > 0 && (
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                              item.wpm < 110 
                                ? 'text-amber-700 bg-amber-50 border-amber-200' 
                                : item.wpm > 150 
                                ? 'text-rose-700 bg-rose-50 border-rose-200' 
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            }`}>
                              🎤 Speaking Pace: {item.wpm} WPM ({
                                item.wpm < 110 
                                  ? 'Slow' 
                                  : item.wpm > 150 
                                  ? 'Fast' 
                                  : 'Excellent'
                              })
                            </span>
                          )}
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                          {item.answer}
                        </div>
                                         {/* Gemini Evaluation & Feedback */}
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">AI Critique & Feedback</h4>
                        <div className={`border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                          item.score === -1 
                            ? 'bg-rose-50 border-rose-250 text-rose-800' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          {item.score === -1 ? (
                            <div className="space-y-3">
                              <p className="font-semibold text-rose-700">{item.feedBack}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReEvaluate(item._id);
                                }}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                              >
                                🔄 Re-Evaluate Grade
                              </button>
                            </div>
                          ) : hasScore ? (
                            item.feedBack || 'No feedback provided.'
                          ) : (
                            <span className="text-slate-400 italic animate-pulse flex items-center gap-2">
                              <span>⏳</span> AI is formulating feedback, grading response accuracy, and writing critiques...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Gemini Model Answer */}
                      {item.score !== -1 && (
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Expert Model Answer</h4>
                          <div className="bg-slate-900 border border-slate-950 text-slate-200 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-lg">
                            {hasScore ? (
                              item.modelAnswer || 'No model answer provided.'
                            ) : (
                              <span className="text-slate-500 italic animate-pulse flex items-center gap-2">
                                <span>⏳</span> Generating reference model answer...
                              </span>
                            )}
                          </div>
                        </div>
                      )}         </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TestDetail;
