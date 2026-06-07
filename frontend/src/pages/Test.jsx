import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../AppContext';
import { toast } from 'react-toastify';
import { image } from '../assets/image';

const Test = () => {
  const { isLoggedIn, userData, BACKEND_URL, loading: authLoading } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();

  const techStack = location.state?.tech || 'JavaScript';
  const difficulty = location.state?.difficulty || 'Mid-Level';

  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);

  const recognitionRef = useRef(null);
  const currentAnswerRef = useRef('');

  // Audio Visualizer Refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Sync state answer text with a ref to avoid closures caching stale state inside timers
  useEffect(() => {
    currentAnswerRef.current = currentAnswer;
  }, [currentAnswer]);

  // Initialize Speech-to-Text Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(transcript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Text-to-Speech (TTS) Voice Prompt Generator
  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[^a-zA-Z0-9\s?.,-]/g, ''); // strip symbols for clearer speech
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Run speaking question and handle cleanups
  useEffect(() => {
    if (questions && questions[currentIndex] && !isMuted && !loading && !testFinished) {
      speakQuestion(questions[currentIndex]);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, questions, isMuted, loading, testFinished]);

  // Manage 90-second countdown timer for each question
  useEffect(() => {
    if (loading || testFinished || !questions.length) return;

    setTimeLeft(90);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, loading, testFinished, questions]);

  const handleTimerTimeout = async () => {
    const finalAnswer = currentAnswerRef.current.trim() || 'No answer provided. (Time limit exceeded)';
    toast.warning("Time's up for this question! Auto-submitting answer.");
    await submitAndProceed(finalAnswer);
  };

  // Stop listening when question changes
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Handle Voice Waveform Canvas Draw loops
  useEffect(() => {
    if (isListening) {
      startVoiceVisualizer();
    } else {
      stopVoiceVisualizer();
    }
    return () => {
      stopVoiceVisualizer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const startVoiceVisualizer = async () => {
    try {
      stopVoiceVisualizer(); // cancel any active contexts

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasCtx = canvas.getContext('2d');

      const draw = () => {
        if (!analyserRef.current || !canvasCtx || !canvas) return;
        animationFrameRef.current = requestAnimationFrame(draw);

        analyserRef.current.getByteFrequencyData(dataArray);

        // Clear canvas
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        // Render sleek vertical bars centering out the soundwaves
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i] / 255.0; // scale 0.0 - 1.0
          barHeight = value * (height * 0.85);

          canvasCtx.fillStyle = `rgba(244, 63, 94, ${0.4 + value * 0.6})`; // animated rose colors
          const y = (height - barHeight) / 2;
          
          canvasCtx.beginPath();
          canvasCtx.roundRect(x, y, barWidth - 1, barHeight, 4);
          canvasCtx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.error('Audio visualizer failed to initialize:', err);
    }
  };

  const stopVoiceVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const canvasCtx = canvas.getContext('2d');
      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech-to-text is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        setCurrentAnswer('');
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Microphone active. Please speak your answer.');
      } catch (err) {
        console.error('Speech start error:', err);
      }
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, authLoading, navigate]);

  // Generate questions on mount
  useEffect(() => {
    const generateQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${BACKEND_URL}/api/interview/start`, { techStack, difficulty });
        console.log(response)
        if (response.data.success) {
          setTestId(response.data.testId);
          setQuestions(response.data.questions);
        } else {
          toast.error(response.data.message || 'Failed to generate test questions.');
          navigate('/dashboard');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to connect to the grading server.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      generateQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      toast.warning('Please enter an answer before submitting, or skip if you are unsure.');
      return;
    }

    await submitAndProceed(currentAnswer);
  };

  const handleSkipQuestion = async () => {
    const skipText = 'No answer provided. (Skipped)';
    await submitAndProceed(skipText);
  };

  const submitAndProceed = async (answerText) => {
    setSubmitting(true);
    // Cancel active speaker synthesis on submit/skip
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Calculate Speaking Pace WPM (Words Per Minute)
    const timeSpent = 90 - timeLeft;
    const duration = timeSpent > 0 ? timeSpent : 1; // avoid divide by zero
    const isSkippedOrEmpty = answerText.includes('No answer provided') || !answerText.trim();
    const wordCount = isSkippedOrEmpty ? 0 : answerText.split(/\s+/).filter(w => w.trim().length > 0).length;
    const wpm = isSkippedOrEmpty ? 0 : Math.round((wordCount / duration) * 60);

    try {
      const payload = {
        testId,
        techStack,
        question: questions[currentIndex],
        answer: answerText,
        difficulty,
        wpm,
        duration: isSkippedOrEmpty ? 0 : duration
      };

      const response = await axios.post(`${BACKEND_URL}/api/interview/evaluate`, payload);

      if (response.data.success) {
        toast.success(`Question ${currentIndex + 1} answer saved!`);

        // Clear input field
        setCurrentAnswer('');

        // Move to next question or finish
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setTestFinished(true);
          toast.success('Congratulations! You completed the assessment.');
        }
      } else {
        toast.error(response.data.message || 'Failed to save answer.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
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
        <h2 className="text-xl font-bold text-slate-900 mt-6 animate-pulse">Consulting Gemini AI...</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm text-center">
          Generating 10 custom engineering questions for <strong className="text-slate-800">{techStack}</strong>. This may take up to 10 seconds.
        </p>
      </div>
    );
  }

  if (testFinished) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-250 flex items-center justify-center text-4xl mx-auto">
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Assessment Completed!</h2>
            <p className="text-slate-500 text-sm mt-2">
              All 10 answers have been sent to Gemini AI for background grading and critique generation.
            </p>
          </div>
          <button
            onClick={() => navigate('/testdetail', { state: { testId } })}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition duration-200 cursor-pointer"
          >
            View Results & Feedback
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold rounded-xl transition duration-200 cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

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

        <div className="flex items-center gap-3 bg-white border border-slate-200 py-1.5 px-3 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm">
            {getUserInitials()}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden md:block">
            {techStack} Assessment
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
                className="bg-slate-800 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Question Timer */}
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span className={timeLeft < 15 ? "text-rose-500 animate-pulse" : "text-slate-500"}>
                ⏱️
              </span>
              <span>Time Remaining:</span>
              <span className={`font-mono text-base ${timeLeft < 15 ? "text-rose-600 font-bold animate-pulse animate-[ping_1.5s_infinite]" : "text-slate-800"}`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex-1 max-w-[200px] bg-slate-200 h-2 rounded-full overflow-hidden ml-4">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timeLeft < 15 ? "bg-rose-500" : "bg-slate-850"
                }`}
                style={{ width: `${(timeLeft / 90) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Question Prompt</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isMuted) {
                    setIsMuted(false);
                    speakQuestion(questions[currentIndex]);
                  } else {
                    setIsMuted(true);
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }
                }}
                className="text-slate-400 hover:text-slate-700 bg-white border border-slate-200 hover:border-slate-350 p-1.5 rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title={isMuted ? "Unmute Question" : "Mute Question"}
              >
                <span>{isMuted ? '🔇 Muted' : '🔊 Speaking'}</span>
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-3 leading-relaxed">
              {questions[currentIndex]}
            </h2>
          </div>

          {/* Answer Form */}
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="answer" className="text-sm font-semibold text-slate-500">
                  Your Response (Speaking Test)
                </label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition duration-200 cursor-pointer ${
                    isListening 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/20' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-350 shadow-xs'
                  }`}
                >
                  <span>{isListening ? '🛑 Stop speaking' : '🎤 Start speaking'}</span>
                </button>
              </div>

              {isListening && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                      <span className="text-xs text-rose-700 font-bold">Microphone is active. Speak clearly...</span>
                    </div>
                  </div>
                  {/* Real-time Voice Waveform Visualizer */}
                  <div className="w-full bg-rose-100/30 rounded-xl p-1 overflow-hidden border border-rose-200/50">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={60}
                      className="w-full h-[60px] block"
                    />
                  </div>
                </div>
              )}

              <textarea
                id="answer"
                placeholder={isListening ? "Listening... Speak your answer now." : "Click 'Start speaking' above to dictate your answer. Typing is disabled for this test."}
                value={currentAnswer}
                readOnly
                disabled={submitting}
                className="w-full bg-slate-50/70 border border-slate-200 focus:outline-none rounded-2xl p-4 text-slate-700 placeholder-slate-400 transition h-48 resize-none text-base leading-relaxed cursor-not-allowed select-none"
                required
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkipQuestion}
                disabled={submitting}
                className="order-2 sm:order-1 px-5 py-3 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-850 rounded-xl transition font-medium cursor-pointer text-sm"
              >
                Skip Question
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="order-1 sm:order-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-xl transition cursor-pointer text-sm shadow-xs flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving Answer...
                  </>
                ) : (
                  currentIndex === questions.length - 1 ? 'Finish & Complete Assessment ➔' : 'Submit & Next Question ➔'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Test;
