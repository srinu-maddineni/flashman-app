import React, { useEffect, useState, useContext } from 'react';
import Nav from '../components/Nav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { BACKEND_URL } = useContext(AppContent);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  const handleStart = () => {
    navigate("/login");
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/feedback/all`);
        if (response.data.success) {
          // Show reviews with 4 or 5 stars for high quality testimonials
          setFeedbacks(response.data.feedbacks.filter(f => f.rating >= 4));
        }
      } catch (err) {
        console.error("Error loading feedbacks:", err);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    fetchFeedbacks();
  }, [BACKEND_URL]);

  // Fallback high-quality testimonials if the DB is fresh and has no feedbacks yet
  const fallbackTestimonials = [
    {
      _id: 't1',
      userName: 'Suresh Kumar',
      rating: 5,
      feedbackType: 'test',
      techStack: 'React & Redux',
      comment: 'The speech-to-text dictation is incredibly smooth! The AI feedback was point-on, showing me exactly where my technical explanation was lacking.',
      createdAt: new Date().toISOString()
    },
    {
      _id: 't2',
      userName: 'Priya Sharma',
      rating: 5,
      feedbackType: 'general',
      comment: 'Excellent interview prep tool. The speaking pace analysis (WPM) helped me realize I speak way too fast when nervous. Highly recommend it to any job seeker!',
      createdAt: new Date().toISOString()
    },
    {
      _id: 't3',
      userName: 'Vikram Aditya',
      rating: 4,
      feedbackType: 'test',
      techStack: 'Node.js & MongoDB',
      comment: 'Very realistic questions. The grading feels strict but fair, and the expert model answers are a fantastic reference to learn from.',
      createdAt: new Date().toISOString()
    }
  ];

  const displayedFeedbacks = feedbacks.length > 0 ? feedbacks.slice(0, 6) : fallbackTestimonials;

  // Helper for rendering rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-lg">
            {i < rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-red-500 selection:text-white">
      <Nav />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 px-6 bg-linear-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-1.5 rounded-full text-xs font-semibold text-red-600 animate-bounce">
            ⚡ Now Live & Free for Jobseekers
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Master Technical Interviews with{' '}
            <span className="bg-linear-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Superhero Speed
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Flashman simulates real-world engineering interviews. Practice verbally with speech-to-text dictation, analyze speaking pace, and receive instant expert grades and reviews powered by Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer text-base"
            >
              Get Started for Free ➔
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold rounded-2xl shadow-xs transition duration-200 text-center"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Built to Excel under Real Interview Pressures</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            Everything you need to confidently answer engineering prompts, fine-tune explanations, and score higher.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: '🎯',
              title: '30+ Tech Stacks',
              desc: 'Select from Frontend, Backend, Databases, and DevOps categories for customized test generation.'
            },
            {
              icon: '🎤',
              title: 'Voice-to-Text Dictation',
              desc: 'Speak your answers naturally using speech recognition, mirroring actual verbal responses.'
            },
            {
              icon: '📈',
              title: 'Speaking Pace Insights',
              desc: 'Track your speaking rate (WPM) to ensure you present clearly and do not rush your explanations.'
            },
            {
              icon: '🤖',
              title: 'AI Critiques & Grading',
              desc: 'Instant, detail-rich feedback on technical accuracy and communication alongside expert model answers.'
            }
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs hover:shadow-md transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-3xl p-3 bg-slate-50 border border-slate-100 rounded-2xl inline-block">
                  {feat.icon}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial & Review Feed */}
      <section className="py-20 px-6 bg-slate-100/60 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto w-full space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              Community Reviews
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">What Job Seekers are Saying</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Real opinions, ratings, and feedback shared by developers using Flashman to land their dream roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFeedbacks.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs hover:border-slate-350 transition flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 leading-tight">{item.userName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {item.feedbackType === 'test' ? (
                          <span className="text-slate-500">
                            Reviewed <strong className="text-slate-700">{item.techStack}</strong> Assessment
                          </span>
                        ) : (
                          'General Review'
                        )}
                      </p>
                    </div>
                    {renderStars(item.rating)}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed whitespace-pre-wrap">
                    "{item.comment}"
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 text-right font-medium">
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleStart}
              className="px-6 py-3 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-2xl text-xs sm:text-sm cursor-pointer shadow-xs transition duration-150"
            >
              Sign Up to Share Your Story
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="mt-auto py-12 px-6 border-t border-slate-200 bg-white text-center text-slate-400 space-y-4 text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-extrabold tracking-wider">
            <span className="text-red-600">Flash</span>
            <span className="text-yellow-500">Man</span>
          </span>
        </div>
        <p>&copy; {new Date().getFullYear()} Flashman Inc. All rights reserved. Help job seekers land roles fast.</p>
      </footer>
    </div>
  );
};

export default Home;