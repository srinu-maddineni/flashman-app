import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../AppContext';
import { toast } from 'react-toastify';
import { image } from '../assets/image';

const GovTestDetail = () => {
  const { isLoggedIn, userData, BACKEND_URL, loading: authLoading } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();

  const testId = location.state?.testId;

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(0); // Default expand first question

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, authLoading, navigate]);

  // Fetch results on mount
  useEffect(() => {
    const fetchResults = async () => {
      if (!testId) {
        toast.error('Test ID is missing.');
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/gov/test/${testId}`);
        if (response.data.success) {
          setTest(response.data.test);
        } else {
          toast.error(response.data.message || 'Failed to fetch test details.');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching test details:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch test details.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && testId) {
      fetchResults();
    }
  }, [isLoggedIn, testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center font-sans p-6">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-slate-900 mt-6 animate-pulse">Loading report...</h2>
        <p className="text-slate-500 text-sm mt-2">Fetching your assessment data.</p>
      </div>
    );
  }

  if (!test) return null;

  const scorePercentage = (test.score / test.totalQuestions) * 100;
  const testDate = new Date(test.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 5) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getGradeTitle = (score) => {
    if (score >= 8) return 'Excellent Work! 🏆';
    if (score >= 5) return 'Good Effort! 👍';
    return 'Keep Practicing! 📚';
  };

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

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
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full p-6 lg:p-8 space-y-8 flex-1">
        
        {/* Report Overview Banner */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200 py-1 px-3 rounded-full">
                {test.examType} Mock Test Report
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-600 bg-slate-150 border border-slate-200 py-1 px-3 rounded-full">
                {test.subject}
              </span>
              <span className={`text-xs font-extrabold uppercase tracking-widest py-1 px-3 rounded-full border ${
                test.questionSource === 'pyq'
                  ? 'text-amber-700 bg-amber-50 border-amber-250'
                  : 'text-slate-500 bg-slate-100 border-slate-200'
              }`}>
                {test.questionSource === 'pyq' ? 'Previous Year Questions (PYQ)' : 'AI Generated'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
              {getGradeTitle(test.score)}
            </h1>
            <p className="text-slate-500 text-sm">{testDate}</p>
          </div>

          <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
            <div className="text-left">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Correct Answers</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-semibold text-emerald-600">
                  {test.score} / {test.totalQuestions} Questions
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Score Percentage</p>
              <span className={`inline-block text-xl lg:text-2xl font-black mt-1 px-3 py-1 rounded-2xl border ${getScoreColor(test.score)}`}>
                {scorePercentage}%
              </span>
            </div>
          </div>
        </section>

        {/* Detailed Question Review Accordion */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Question-by-Question Analysis</h2>
          
          <div className="space-y-4">
            {test.questions.map((item, index) => {
              const isExpanded = expandedIndex === index;
              const hasAnswered = item.selectedOption !== '';
              const isCorrect = item.isCorrect;

              return (
                <div 
                  key={item._id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-350 transition"
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
                        {item.questionText}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold border px-2.5 py-1 rounded-lg ${
                        !hasAnswered
                          ? 'text-slate-500 bg-slate-50 border-slate-200'
                          : isCorrect
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border-rose-200'
                      }`}>
                        {!hasAnswered 
                          ? 'Skipped' 
                          : isCorrect 
                          ? 'Correct ✓' 
                          : 'Incorrect ✗'}
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
                        <p className="text-base text-slate-800 font-bold leading-relaxed">{item.questionText}</p>
                      </div>

                      {/* Options Grid */}
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Answer Options</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {item.options.map((optText, optIdx) => {
                            const char = optionLabels[optIdx];
                            const isUserSelection = item.selectedOption === char;
                            const isCorrectAns = item.correctOption === char;

                            let optionStyles = 'bg-white border-slate-200 text-slate-700';
                            if (isCorrectAns) {
                              optionStyles = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                            } else if (isUserSelection && !isCorrect) {
                              optionStyles = 'bg-rose-50 border-rose-300 text-rose-800 font-semibold';
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-3 border rounded-xl flex items-start gap-3 text-sm ${optionStyles}`}
                              >
                                <span className={`w-5 h-5 rounded-md font-bold text-xs flex items-center justify-center shrink-0 border ${
                                  isCorrectAns
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : isUserSelection
                                    ? 'bg-rose-500 border-rose-500 text-white'
                                    : 'bg-slate-100 border-slate-200 text-slate-600'
                                }`}>
                                  {char}
                                </span>
                                <span className="leading-relaxed">
                                  {optText}
                                  {isCorrectAns && <span className="ml-2 text-emerald-600 font-bold">✓ (Correct Answer)</span>}
                                  {isUserSelection && !isCorrect && <span className="ml-2 text-rose-600 font-bold">✗ (Your Selection)</span>}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Grade Explanation */}
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Detailed Explanation</h4>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 shadow-xs">
                          {item.explanation}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Back to Dashboard Button */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

      </main>
    </div>
  );
};

export default GovTestDetail;
