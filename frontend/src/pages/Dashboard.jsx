import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../AppContext';
import { toast } from 'react-toastify';
import { image } from '../assets/image';
import axios from 'axios';

const techStackCategories = [
  {
    id: 'frontend',
    name: 'Frontend',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    hoverColorClass: 'hover:border-slate-400',
    items: [
      { name: 'HTML', type: 'Core', desc: 'HyperText Markup Language, the standard structure of web documents.' },
      { name: 'CSS', type: 'Core', desc: 'Cascading Style Sheets for describing document presentation.' },
      { name: 'JavaScript', type: 'Core', desc: 'High-level, dynamic client-side scripting language.' },
      { name: 'React', type: 'Framework/Library', desc: 'A popular declarative, component-based library for building user interfaces.' },
      { name: 'Angular', type: 'Framework/Library', desc: 'A comprehensive TypeScript-based web application framework.' },
      { name: 'Vue.js', type: 'Framework/Library', desc: 'An approachable, performant, and versatile JavaScript framework.' },
      { name: 'Svelte', type: 'Framework/Library', desc: 'Compiles components to tiny, execution-free vanilla JavaScript.' },
      { name: 'Tailwind CSS', type: 'Styling', desc: 'A utility-first CSS framework for rapid UI styling.' },
      { name: 'Bootstrap', type: 'Styling', desc: 'The most popular HTML, CSS, and JS library for responsive design.' },
      { name: 'Sass', type: 'Styling', desc: 'A mature, stable, and powerful professional CSS extension language.' },
      { name: 'Redux', type: 'State Management', desc: 'Predictable state container for JavaScript apps.' },
      { name: 'Zustand', desc: 'A small, fast, and scalable bearbones state-management solution.', type: 'State Management' },
      { name: 'Context API', type: 'State Management', desc: 'React\'s built-in state management for sharing global data.' }
    ]
  },
  {
    id: 'backend',
    name: 'Backend',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    hoverColorClass: 'hover:border-slate-400',
    items: [
      { name: 'JavaScript (Node.js)', type: 'Language', desc: 'An open-source, cross-platform JavaScript runtime environment.' },
      { name: 'Python', type: 'Language', desc: 'A high-level, general-purpose, and highly readable programming language.' },
      { name: 'Java', type: 'Language', desc: 'A class-based, object-oriented, highly portable language.' },
      { name: 'C#', type: 'Language', desc: 'Modern, object-oriented, and type-safe language developed by Microsoft.' },
      { name: 'Go', type: 'Language', desc: 'Compiled, concurrent, statically typed programming language by Google.' },
      { name: 'PHP', type: 'Language', desc: 'Server-side scripting language designed for web development.' },
      { name: 'Ruby', type: 'Language', desc: 'A dynamic, open-source programming language with a focus on simplicity.' },
      { name: 'Express.js', type: 'Framework', desc: 'Minimalist and flexible Node.js web application framework.' },
      { name: 'Django', type: 'Framework', desc: 'High-level Python web framework that encourages rapid development.' },
      { name: 'Spring Boot', type: 'Framework', desc: 'Build stand-alone, production-ready Spring-based Java applications.' },
      { name: 'ASP.NET', type: 'Framework', desc: 'Cross-platform, open-source web application framework developed by Microsoft.' },
      { name: 'Flask', type: 'Framework', desc: 'A lightweight and extensible WSGI Python web framework.' }
    ]
  },
  {
    id: 'databases',
    name: 'Databases',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    hoverColorClass: 'hover:border-slate-400',
    items: [
      { name: 'MySQL', type: 'SQL (Relational)', desc: 'The world\'s most popular open-source relational database management system.' },
      { name: 'PostgreSQL', type: 'SQL (Relational)', desc: 'A powerful, highly-extensible open-source object-relational database.' },
      { name: 'SQLite', type: 'SQL (Relational)', desc: 'Small, fast, self-contained, high-reliability SQL database engine.' },
      { name: 'Oracle', type: 'SQL (Relational)', desc: 'A multi-model database management system built for enterprise data.' },
      { name: 'MongoDB', type: 'NoSQL', desc: 'A document-based distributed database designed for modern applications.' },
      { name: 'Firebase Firestore', type: 'NoSQL', desc: 'Cloud-hosted, NoSQL real-time database from Google.' },
      { name: 'Redis', type: 'NoSQL / Cache', desc: 'In-memory data structure store used as a database, cache, and message broker.' }
    ]
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    hoverColorClass: 'hover:border-slate-400',
    items: [
      { name: 'Amazon Web Services', type: 'Cloud Platform', desc: 'The world\'s most comprehensive and broadly adopted cloud platform.' },
      { name: 'Google Cloud', type: 'Cloud Platform', desc: 'Suite of cloud computing services running on the infrastructure that Google uses.' },
      { name: 'Microsoft Azure', type: 'Cloud Platform', desc: 'Cloud computing service created by Microsoft for building and testing.' },
      { name: 'Docker', type: 'Tools', desc: 'Containerization tool that allows packing applications into standard environments.' },
      { name: 'Kubernetes', type: 'Tools', desc: 'An open-source container-orchestration system for automating app deployment.' },
      { name: 'CI/CD (GitHub Actions, Jenkins)', type: 'Tools', desc: 'Automation of integration, testing, and delivery pipelines.' }
    ]
  },
  {
    id: 'versioncontrol',
    name: 'Version Control',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    hoverColorClass: 'hover:border-slate-400',
    items: [
      { name: 'Git', type: 'System', desc: 'Free and open source distributed version control system.' },
      { name: 'GitHub', type: 'Platform', desc: 'AI-powered developer platform to build, secure, and ship software.' },
      { name: 'GitLab', type: 'Platform', desc: 'A web-based Git repository manager with wiki, issue-tracking and CI/CD.' }
    ]
  },
  {
    id: 'mobile',
    name: 'Mobile Dev',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    hoverColorClass: 'hover:border-slate-400',
    items: [
      { name: 'React Native', type: 'Cross-Platform', desc: 'React framework for building native Android and iOS mobile applications.' },
      { name: 'Flutter', type: 'Cross-Platform', desc: 'Google\'s portable UI toolkit for crafting natively compiled apps from one codebase.' },
      { name: 'Swift (iOS)', type: 'Native', desc: 'A powerful and intuitive programming language for macOS, iOS, watchOS, and tvOS.' },
      { name: 'Kotlin (Android)', type: 'Native', desc: 'Statically typed programming language used extensively for Android apps.' }
    ]
  },
  {
    id: 'testing',
    name: 'Testing',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    hoverColorClass: 'hover:border-slate-400',
    items: [
      { name: 'Jest', type: 'JavaScript', desc: 'Delightful JavaScript Testing Framework with a focus on simplicity.' },
      { name: 'Mocha', type: 'JavaScript', desc: 'Feature-rich JavaScript test framework running on Node.js and in the browser.' },
      { name: 'Cypress', type: 'E2E Testing', desc: 'Fast, easy and reliable testing for anything that runs in a browser.' },
      { name: 'Selenium', type: 'Automation', desc: 'Open-source umbrella project for a range of tools and libraries used for browser automation.' }
    ]
  },
  {
    id: 'fullstack',
    name: 'Full Stack',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    hoverColorClass: 'hover:border-slate-400',
    items: [
      { name: 'MERN Stack', type: 'Stack', desc: 'Popular stack combining MongoDB, Express, React, and Node.js.' },
      { name: 'MEAN Stack', type: 'Stack', desc: 'Web development stack combining MongoDB, Angular, Express, and Node.js.' },
      { name: 'LAMP Stack', type: 'Stack', desc: 'Classic web development stack combining Linux, Apache, MySQL, and PHP.' },
      { name: 'JAMstack', type: 'Stack', desc: 'Modern web architecture: Client-side JavaScript, reusable APIs, and pre-built Markup.' }
    ]
  }
];

const govExamsList = [
  {
    id: 'upsc',
    name: 'UPSC Civil Services',
    desc: 'Union Public Service Commission Civil Services Examination for IAS/IPS preparation.',
    subjects: ['General Studies', 'Indian Polity', 'History & Culture', 'Geography & Environment', 'CSAT']
  },
  {
    id: 'ssc',
    name: 'SSC CGL',
    desc: 'Staff Selection Commission Combined Graduate Level Exam for tier-1 & tier-2 officer posts.',
    subjects: ['General Awareness', 'Quantitative Aptitude', 'Reasoning', 'English Language']
  },
  {
    id: 'banking',
    name: 'Banking Exams',
    desc: 'SBI, IBPS, and RBI PO, Clerk & Assistant recruitment examinations.',
    subExams: [
      { name: 'SBI PO', subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General & Banking Awareness'] },
      { name: 'SBI Clerk', subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General & Financial Awareness'] },
      { name: 'IBPS PO', subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General & Banking Awareness'] },
      { name: 'IBPS Clerk', subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General & Financial Awareness'] },
      { name: 'IBPS RRB PO', subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'Financial Awareness', 'English Language'] },
      { name: 'IBPS RRB Clerk', subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'General & Financial Awareness', 'English Language'] },
      { name: 'RBI Assistant', subjects: ['Numerical Ability', 'Reasoning Ability', 'English Language', 'General Awareness', 'Computer Knowledge'] }
    ]
  },
  {
    id: 'railways',
    name: 'Railway Exams',
    desc: 'Railway Recruitment Board (RRB) NTPC, ALP, JE, and Group D examinations.',
    subExams: [
      { name: 'RRB NTPC', subjects: ['General Awareness', 'Mathematics', 'General Intelligence & Reasoning'] },
      { name: 'RRB ALP & Technician', subjects: ['Mathematics', 'General Intelligence & Reasoning', 'General Science', 'Basic Science & Engineering'] },
      { name: 'RRB JE', subjects: ['General Awareness', 'Physics & Chemistry', 'Basics of Computers', 'Basics of Environment', 'Technical Abilities'] },
      { name: 'RRB Group D', subjects: ['Mathematics', 'General Intelligence & Reasoning', 'General Science', 'General Awareness on Current Affairs'] }
    ]
  },
  {
    id: 'defence',
    name: 'Defence Exams',
    desc: 'UPSC NDA, CDS, AFCAT and other defense forces recruitment examinations.',
    subExams: [
      { name: 'NDA & NA', subjects: ['Mathematics', 'General Ability Test', 'English'] },
      { name: 'CDS', subjects: ['English', 'General Knowledge', 'Elementary Mathematics'] },
      { name: 'AFCAT', subjects: ['General Awareness', 'Verbal Ability in English', 'Numerical Ability', 'Reasoning & Military Aptitude'] },
      { name: 'CAPF (AC)', subjects: ['General Ability & Intelligence', 'General Studies, Essay & Comprehension'] },
      { name: 'Agniveer Recruitment', subjects: ['Mathematics', 'Reasoning', 'General Science', 'General Knowledge'] },
      { name: 'Technical Entry Scheme (TES)', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Technical Ability'] },
      { name: 'Indian Coast Guard AC', subjects: ['Mental Ability', 'General Awareness', 'English', 'Professional Knowledge'] }
    ]
  }
];

const Dashboard = () => {
  const {
    isLoggedIn,
    userData,
    history,
    getHistory,
    loading,
    logout,
    BACKEND_URL,
  } = useContext(AppContent);

  const navigate = useNavigate();
  const [prepType, setPrepType] = useState(() => {
    return localStorage.getItem('prepType') || 'software';
  });
  
  useEffect(() => {
    localStorage.setItem('prepType', prepType);
  }, [prepType]);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState(null);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  // Government Exams state variables
  const [govHistory, setGovHistory] = useState([]);
  const [showGovModal, setShowGovModal] = useState(false);
  const [selectedGovExam, setSelectedGovExam] = useState('');
  const [selectedGovSubExam, setSelectedGovSubExam] = useState('');
  const [selectedGovSubject, setSelectedGovSubject] = useState('');
  const [selectedGovSource, setSelectedGovSource] = useState('ai'); // 'ai' or 'pyq'

  // Community Feedback Hub state
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchDashboardFeedbacks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/feedback/all`);
      if (response.data.success) {
        setFeedbacks(response.data.feedbacks);
      }
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    }
  };

  const getGovHistory = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/gov/history`);
      if (response.data.success) {
        setGovHistory(response.data.history);
      }
    } catch (err) {
      console.error("Error fetching government exam history:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && BACKEND_URL) {
      fetchDashboardFeedbacks();
    }
  }, [isLoggedIn, BACKEND_URL]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) {
      toast.warning("Please enter your feedback comment.");
      return;
    }
    setSubmittingFeedback(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/feedback/submit`, {
        feedbackType: 'general',
        rating: feedbackRating,
        comment: feedbackComment
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setFeedbackComment('');
        setFeedbackRating(5);
        fetchDashboardFeedbacks();
      } else {
        toast.error(response.data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error submitting feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Custom Resume Match state and submit handler
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState('Mid-Level');
  const [customSubmitting, setCustomSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.warning("Please upload your resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.warning("Please provide a job description.");
      return;
    }

    setCustomSubmitting(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);
    formData.append('difficulty', customDifficulty);

    try {
      toast.info("Analyzing resume & job description...");
      const response = await axios.post(`${BACKEND_URL}/api/interview/start-custom`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success("AI interview questions generated! Starting test...");
        setShowResumeModal(false);
        setResumeFile(null);
        setJobDescription('');
        
        // Redirect to /test page, passing pre-generated questions
        navigate('/test', { 
          state: { 
            tech: 'Resume Match', 
            difficulty: customDifficulty,
            testId: response.data.testId,
            questions: response.data.questions
          } 
        });
      } else {
        toast.error(response.data.message || "Failed to generate interview questions.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "An error occurred starting custom test.");
    } finally {
      setCustomSubmitting(false);
    }
  };

  // Load history when the dashboard mounts (and user is authenticated)
  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        getHistory();
        getGovHistory();
      } else {
        navigate('/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, loading]);

  const handleStartTest = (stack) => {
    setSelectedTech(stack);
    setShowDifficultyModal(true);
  };

  const confirmStartTest = (difficulty) => {
    setShowDifficultyModal(false);
    toast.info(`Starting a new ${selectedTech} assessment (${difficulty} level)…`);
    navigate('/test', { state: { tech: selectedTech, difficulty } });
  };

  // Government Exams start handler
  const handleStartGovTest = (examName) => {
    const exam = govExamsList.find(e => e.name === examName);
    if (exam) {
      setSelectedGovExam(exam.name);
      if (exam.subExams && exam.subExams.length > 0) {
        setSelectedGovSubExam(exam.subExams[0].name);
        setSelectedGovSubject(exam.subExams[0].subjects[0]);
      } else {
        setSelectedGovSubExam('');
        setSelectedGovSubject(exam.subjects[0]);
      }
      setSelectedGovSource('ai');
      setShowGovModal(true);
    }
  };

  const confirmStartGovTest = () => {
    setShowGovModal(false);
    const finalExamName = selectedGovSubExam || selectedGovExam;
    toast.info(`Starting new ${finalExamName} assessment (${selectedGovSubject})…`);
    navigate('/gov-test', { state: { examType: finalExamName, subject: selectedGovSubject, questionSource: selectedGovSource } });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  // Dynamic Metrics and Scores
  let totalAssessments = 0;
  let overallAvgScore = 0;
  let bestTech = 'N/A';
  let bestScore = -1;
  let pendingCount = 0;

  if (prepType === 'software') {
    totalAssessments = history ? history.length : 0;
    const completedTests = history ? history.filter(item => item.averageScore !== null) : [];
    overallAvgScore = completedTests.length > 0
      ? completedTests.reduce((sum, item) => sum + item.averageScore, 0) / completedTests.length
      : 0;

    const techScores = {};
    completedTests.forEach(item => {
      const stack = item.techStack;
      if (stack) {
        if (!techScores[stack]) {
          techScores[stack] = { sum: 0, count: 0 };
        }
        techScores[stack].sum += item.averageScore;
        techScores[stack].count += 1;
      }
    });

    Object.keys(techScores).forEach(stack => {
      const avg = techScores[stack].sum / techScores[stack].count;
      if (avg > bestScore) {
        bestScore = avg;
        bestTech = stack;
      }
    });

    pendingCount = history ? history.filter(item => item.evaluatedQuestions < item.totalQuestions).length : 0;
  } else {
    totalAssessments = govHistory ? govHistory.length : 0;
    const completedTests = govHistory ? govHistory.filter(item => item.isCompleted) : [];
    overallAvgScore = completedTests.length > 0
      ? completedTests.reduce((sum, item) => sum + (item.score / (item.totalQuestions || 25)) * 10, 0) / completedTests.length
      : 0;

    const examScores = {};
    completedTests.forEach(item => {
      const exam = item.examType;
      if (exam) {
        if (!examScores[exam]) {
          examScores[exam] = { sum: 0, count: 0 };
        }
        examScores[exam].sum += (item.score / (item.totalQuestions || 25)) * 10;
        examScores[exam].count += 1;
      }
    });

    Object.keys(examScores).forEach(exam => {
      const avg = examScores[exam].sum / examScores[exam].count;
      if (avg > bestScore) {
        bestScore = avg;
        bestTech = exam;
      }
    });

    pendingCount = govHistory ? govHistory.filter(item => !item.isCompleted).length : 0;
  }

  // Chart Layout Config
  const margin = { top: 25, right: 20, bottom: 40, left: 40 };
  const svgWidth = 500;
  const svgHeight = 220;
  const contentWidth = svgWidth - margin.left - margin.right;
  const contentHeight = svgHeight - margin.top - margin.bottom;

  const chartData = prepType === 'software'
    ? (history ? history.filter(h => h.averageScore !== null).slice(0, 6).reverse() : [])
    : (govHistory ? govHistory.filter(h => h.isCompleted).slice(0, 6).reverse() : []);

  // Helper: Flatten tech stacks and inject category colors/metadata
  const allTechStacks = techStackCategories.reduce((acc, cat) => {
    const itemsWithCategory = cat.items.map(item => ({
      ...item,
      categoryId: cat.id,
      categoryName: cat.name,
      colorClass: cat.colorClass,
      hoverColorClass: cat.hoverColorClass
    }));
    return [...acc, ...itemsWithCategory];
  }, []);

  // Filter based on active category tab and search query
  const filteredTechStacks = allTechStacks.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Helper for score badge colors
  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-slate-400 bg-slate-100 border-slate-200';
    if (score >= 8 || score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 5 || score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.name) return 'U';
    return userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative font-sans">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src={image.flash} className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-200" alt="Flash logo" />
          <span className="text-2xl font-extrabold tracking-wider hidden sm:inline-block">
            <span className="text-red-600">Flash</span>
            <span className="text-yellow-500">Man</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-slate-200 py-1.5 px-3 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {getUserInitials()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs text-slate-400 leading-none">Logged in as</p>
              <h4 className="text-sm font-semibold text-slate-700 mt-0.5">{userData?.name || 'Developer'}</h4>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600 rounded-xl transition duration-200 cursor-pointer text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-8 space-y-10 relative z-10">
        
        {/* Banner Section */}
        <section className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome back, <span>{userData?.name || 'Developer'}</span>!
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Sharpen your preparation and testing. Choose between Software Engineering (with AI speech evaluation) or Government competitive exams (with MCQ tests).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 py-2 px-4 rounded-xl self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Account Active & Secured</span>
          </div>
        </section>

        {/* Goal Preparation Selector */}
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 inline-flex shadow-xs">
            <button
              onClick={() => setPrepType('software')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition duration-200 cursor-pointer flex items-center gap-2 ${
                prepType === 'software'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              💻 Software Engineering
            </button>
            <button
              onClick={() => setPrepType('gov')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition duration-200 cursor-pointer flex items-center gap-2 ${
                prepType === 'gov'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              🏛️ Government Exams
            </button>
          </div>
        </div>

        {/* Analytics & Performance Insights */}
        {((prepType === 'software' && history && history.length > 0) || (prepType === 'gov' && govHistory && govHistory.length > 0)) && (
          <section className="bg-white border border-slate-200 p-6 lg:p-8 rounded-3xl shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Performance Analytics</h2>
              <p className="text-sm text-slate-500 mt-1">Key metrics and score trends from your graded assessments.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between hover:shadow-xs transition duration-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Tests</span>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-slate-950">{totalAssessments}</span>
                    <span className="text-xs text-slate-500 block mt-1">Assessments taken</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between hover:shadow-xs transition duration-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Score</span>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-slate-950">
                      {overallAvgScore > 0 
                        ? `${Math.round((prepType === 'software' ? overallAvgScore : overallAvgScore) * 10) / 10}/10` 
                        : 'N/A'}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">Overall average grade</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between hover:shadow-xs transition duration-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Strongest Area</span>
                  <div className="mt-4">
                    <span className="text-lg font-extrabold text-slate-950 line-clamp-1" title={bestTech}>
                      {bestTech}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      {bestScore > 0 ? `Avg: ${Math.round(bestScore * 10) / 10}/10` : 'No evaluations yet'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between hover:shadow-xs transition duration-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{prepType === 'software' ? 'Pending Grading' : 'Unfinished Tests'}</span>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-slate-950">{pendingCount}</span>
                    <span className="text-xs text-slate-500 block mt-1">{prepType === 'software' ? 'Tests being graded' : 'Tests not submitted'}</span>
                  </div>
                </div>
              </div>

              {/* Score Trend SVG Chart */}
              <div className="lg:col-span-2 bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between hover:shadow-xs transition duration-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-700 text-sm font-bold">Recent Assessment Trends</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Average grade (out of 10)</span>
                </div>

                {chartData.length > 0 ? (
                  <div className="w-full">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                      {/* Gridlines */}
                      {[0, 2.5, 5, 7.5, 10].map((yVal, i) => {
                        const y = margin.top + contentHeight - (yVal / 10) * contentHeight;
                        return (
                          <g key={i}>
                            <line
                              x1={margin.left}
                              y1={y}
                              x2={svgWidth - margin.right}
                              y2={y}
                              stroke="#e2e8f0"
                              strokeDasharray="4 4"
                            />
                            <text
                              x={margin.left - 8}
                              y={y + 4}
                              textAnchor="end"
                              className="font-mono text-[9px] fill-slate-400"
                            >
                              {yVal}
                            </text>
                          </g>
                        );
                      })}

                      {/* Bars and X Labels */}
                      {chartData.map((item, idx) => {
                        const numTests = chartData.length;
                        const colWidth = contentWidth / numTests;
                        const barWidth = colWidth * 0.45;
                        const x = margin.left + idx * colWidth + (colWidth - barWidth) / 2;
                        
                        const scoreVal = prepType === 'software' ? (item.averageScore || 0) : ((item.score || 0) / (item.totalQuestions || 25)) * 10;
                        const labelText = prepType === 'software' ? item.techStack : item.subject;
                        
                        const barHeight = (scoreVal / 10) * contentHeight;
                        const y = margin.top + contentHeight - barHeight;

                        // Bar color mapping matching score ranges
                        let fillColor = '#94a3b8'; // slate-400
                        if (scoreVal >= 8) fillColor = '#10b981'; // emerald-500
                        else if (scoreVal >= 5) fillColor = '#f59e0b'; // amber-500
                        else if (scoreVal > 0) fillColor = '#f43f5e'; // rose-500

                        const tooltipTitle = prepType === 'software'
                          ? `Click to view feedback report for ${item.techStack} (${Math.round(scoreVal * 10) / 10}/10)`
                          : `Click to view exam report for ${item.examType} - ${item.subject} (${scoreVal}/10)`;

                        return (
                          <g
                            key={item._id || item.testId}
                            className="group cursor-pointer"
                            onClick={() => {
                              if (prepType === 'software') {
                                navigate('/testdetail', { state: { testId: item._id } });
                              } else {
                                navigate('/gov-testdetail', { state: { testId: item.testId } });
                              }
                            }}
                          >
                            {/* Bar Tooltip / Hover Indicator */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              fill={fillColor}
                              rx={4}
                              className="transition-all duration-300 hover:opacity-75 hover:scale-[1.01] transform origin-bottom"
                            >
                              <title>{tooltipTitle}</title>
                            </rect>

                            {/* Score Text above the bar */}
                            <text
                              x={x + barWidth / 2}
                              y={y - 6}
                              textAnchor="middle"
                              className="font-bold font-mono text-[10px] fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {Math.round(scoreVal * 10) / 10}
                            </text>

                            {/* Label along X Axis */}
                            <text
                              x={x + barWidth / 2}
                              y={svgHeight - margin.bottom + 18}
                              textAnchor="middle"
                              className="font-bold text-[9px] fill-slate-500 select-none"
                            >
                              {labelText.length > 8 ? `${labelText.substring(0, 6)}...` : labelText}
                            </text>
                          </g>
                        );
                      })}

                      {/* X Axis line */}
                      <line
                        x1={margin.left}
                        y1={margin.top + contentHeight}
                        x2={svgWidth - margin.right}
                        y2={margin.top + contentHeight}
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-slate-400 text-xs font-semibold">No evaluated test scores available to display.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Dynamic section rendering based on prepType */}
        {prepType === 'software' ? (
          <>
            {/* Custom Resume Matcher Banner Card */}
            <section className="bg-linear-to-r from-slate-900 via-slate-850 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
              {/* Subtle glow decorative elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full filter blur-3xl opacity-50 group-hover:bg-red-600/20 transition-all duration-500"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500/10 rounded-full filter blur-3xl opacity-50 group-hover:bg-yellow-500/20 transition-all duration-500"></div>

              <div className="space-y-4 max-w-3xl relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 px-3.5 py-1 rounded-full text-xs font-bold text-red-400 animate-pulse">
                  ✨ New Premium Feature
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Resume & Job Matcher</h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  Don't just practice generic tests. Upload your resume (PDF/TXT) and paste the exact description of the job you are applying for. Our AI will generate custom technical and situational interview questions to verify your fit.
                </p>
              </div>

              <button
                onClick={() => setShowResumeModal(true)}
                className="w-full md:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl transition duration-155 transform hover:-translate-y-0.5 cursor-pointer text-sm tracking-wide shrink-0 shadow-md relative z-10"
              >
                Start Resume Match Test ➔
              </button>
            </section>

            {/* Tech-stack explorer */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Interactive Assessment Library</h2>
                  <p className="text-sm text-slate-500 mt-1">Select a stack to start practicing real-world scenarios.</p>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                  <input
                    type="text"
                    placeholder="Search technology..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-slate-450 focus:outline-none rounded-xl py-2.5 pl-11 pr-4 text-slate-800 placeholder-slate-400 transition-colors shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-605"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition duration-200 cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-850 border border-slate-200'
                  }`}
                >
                  All Tech
                </button>
                {techStackCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl border transition duration-200 cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-850 border-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Tech Stacks Grid */}
              {filteredTechStacks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredTechStacks.map((stack) => (
                    <div
                      key={stack.name}
                      onClick={() => handleStartTest(stack.name)}
                      className={`group bg-white border border-slate-200 hover:bg-slate-50/50 rounded-2xl p-5 flex flex-col justify-between h-[180px] shadow-xs hover:shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${stack.hoverColorClass}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${stack.colorClass}`}>
                            {stack.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{stack.categoryName}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-955 transition-colors mt-3">
                          {stack.name}
                        </h3>
                        <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                          {stack.desc}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-900 font-semibold mt-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        Start Test <span>➔</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl">
                  <span className="text-3xl">📭</span>
                  <p className="text-slate-500 text-sm mt-3">No technologies match your search criteria.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="mt-4 text-xs text-slate-600 hover:underline cursor-pointer"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              )}
            </section>

            {/* Recent test history */}
            <section className="space-y-6 pt-6 border-t border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Interview History</h2>
                <p className="text-sm text-slate-500 mt-1">Review grades, feedback, and model answers for previous attempts.</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white border border-slate-200 h-36 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : history && history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((item) => {
                    const total = item.totalQuestions || 10;
                    const evaluated = item.evaluatedQuestions || 0;
                    const isEvaluating = evaluated < total;
                    const score = item.averageScore;

                    return (
                      <div
                        key={item._id}
                        className="bg-white border border-slate-200 hover:border-slate-350 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition duration-300 relative group"
                      >
                        {isEvaluating && (
                          <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                          </span>
                        )}

                        <div>
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 tracking-wide">{item.techStack || 'Assessment'}</h3>
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Progress</p>
                              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                                {isEvaluating ? `Evaluating (${evaluated}/${total})` : `Completed (${total}/${total})`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Avg Score</p>
                              <span className={`inline-block text-sm font-bold px-2 py-0.5 mt-0.5 rounded-lg border ${getScoreColor(score)}`}>
                                {score !== null && score !== undefined ? `${Math.round(score * 10) / 10}/10` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/testdetail', { state: { testId: item._id } })}
                          className="mt-6 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold tracking-wide transition duration-200 cursor-pointer"
                        >
                          View Detailed Feedback Report
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-3xl">
                  <span className="text-3xl">🎯</span>
                  <p className="text-slate-500 text-sm mt-3">No test history found yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Choose a technology above and start your first practice run!</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Government Exams Section */}
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Competitive Exam Mock Tests</h2>
                <p className="text-sm text-slate-500 mt-1">Select a competitive exam category to start practicing MCQs generated by Gemini AI.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {govExamsList.map((exam) => (
                  <div
                    key={exam.id}
                    onClick={() => handleStartGovTest(exam.name)}
                    className="group bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 rounded-2xl p-5 flex flex-col justify-between h-[190px] shadow-xs hover:shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border bg-slate-105 text-slate-600 border-slate-200">
                        MCQ Test
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-955 transition-colors mt-3">
                        {exam.name}
                      </h3>
                      <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                        {exam.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-900 font-semibold mt-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      Start Test <span>➔</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Government history list */}
            <section className="space-y-6 pt-6 border-t border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Exam History</h2>
                <p className="text-sm text-slate-500 mt-1">Review scores and view detailed explanations for past competitive exams.</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white border border-slate-200 h-36 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : govHistory && govHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {govHistory.map((item) => {
                    return (
                      <div
                        key={item.testId}
                        className="bg-white border border-slate-200 hover:border-slate-350 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition duration-300 relative group"
                      >
                        <div>
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 tracking-wide">{item.examType}</h3>
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-slate-500 font-semibold">{item.subject}</p>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                              item.questionSource === 'pyq'
                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : 'text-slate-600 bg-slate-100 border-slate-200'
                            }`}>
                              {item.questionSource === 'pyq' ? 'PYQ' : 'AI Generated'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Format</p>
                              <p className="text-xs text-slate-600 font-semibold mt-0.5">MCQ Exam ({item.totalQuestions || 25} Qs)</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Score</p>
                              <span className={`inline-block text-sm font-bold px-2 py-0.5 mt-0.5 rounded-lg border ${getScoreColor(item.score)}`}>
                                {item.score} / {item.totalQuestions}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/gov-testdetail', { state: { testId: item.testId } })}
                          className="mt-6 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold tracking-wide transition duration-200 cursor-pointer"
                        >
                          View Detailed Answers & Explanations
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-3xl">
                  <span className="text-3xl">🎯</span>
                  <p className="text-slate-500 text-sm mt-3">No government mock exam history found yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Select an exam category above to begin your first mock test!</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* Community Feedback Hub Section */}
        <section className="bg-white border border-slate-200 p-6 lg:p-8 rounded-3xl shadow-xs space-y-6 pt-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Community Feedback Hub</h2>
            <p className="text-sm text-slate-500 mt-1">
              Help us improve Flashman or share your success story with other job seekers!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Submit feedback form */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-150 p-6 rounded-2xl flex flex-col justify-between">
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Share Your Experience</h3>
                
                {/* Interactive Star Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="text-2xl transition duration-150 cursor-pointer focus:outline-none"
                      >
                        <span className={star <= feedbackRating ? "text-amber-400" : "text-slate-300"}>★</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Text Area */}
                <div className="space-y-1.5">
                  <label htmlFor="dashboardComment" className="text-xs font-semibold text-slate-500 block">Your Review</label>
                  <textarea
                    id="dashboardComment"
                    rows="4"
                    placeholder="Write a message, request features, or share how Flashman helped you prepare..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:outline-none rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-305 text-white font-semibold rounded-xl text-xs transition duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {submittingFeedback ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback ➔'
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Live Feed of Reviews */}
            <div className="lg:col-span-2 space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="text-sm font-bold text-slate-800">Recent User Reviews</h3>
              {feedbacks.length > 0 ? (
                <div className="space-y-3">
                  {feedbacks.map((item) => (
                    <div
                      key={item._id}
                      className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 relative group hover:border-slate-350 transition duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 text-xs">{item.userName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                            {item.feedbackType === 'test' ? (
                              <span className="text-slate-500">
                                Rated <strong className="text-slate-700">{item.techStack}</strong> Assessment
                              </span>
                            ) : (
                              'General App Review'
                            )}
                          </span>
                        </div>
                        <div className="flex gap-0.5 text-amber-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < item.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed italic">
                        "{item.comment}"
                      </p>
                      <div className="text-[9px] text-slate-400 text-right">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-2xl">💬</span>
                  <p className="text-xs text-slate-500 font-semibold mt-2">No reviews shared yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Experience Difficulty Modal */}
      {showDifficultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl relative space-y-6 animate-scale-up">
            {/* Close Button */}
            <button
              onClick={() => setShowDifficultyModal(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-650 font-bold transition cursor-pointer text-base"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-3xl">🎯</span>
              <h3 className="text-2xl font-extrabold text-slate-900">Select Difficulty Level</h3>
              <p className="text-slate-500 text-sm">
                Customize the question complexity for your <strong className="text-slate-800">{selectedTech}</strong> interview practice.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  level: 'Junior',
                  title: 'Junior Engineer',
                  desc: 'Focuses on core syntax, language fundamentals, basic data structures, and straightforward algorithms.',
                  color: 'border-slate-200 hover:border-emerald-450 hover:bg-emerald-50/10 text-slate-800 hover:text-emerald-800'
                },
                {
                  level: 'Mid-Level',
                  title: 'Mid-Level Engineer',
                  desc: 'Covers framework features, state management, asynchronous logic, API integration, and error handling.',
                  color: 'border-slate-200 hover:border-slate-450 hover:bg-slate-50/30 text-slate-800 hover:text-slate-950'
                },
                {
                  level: 'Senior',
                  title: 'Senior Engineer',
                  desc: 'Explores system optimization, scalability trade-offs, architecture patterns, performance bottlenecks, and security.',
                  color: 'border-slate-200 hover:border-rose-450 hover:bg-rose-50/10 text-slate-800 hover:text-rose-800'
                }
              ].map((tier) => (
                <div
                  key={tier.level}
                  onClick={() => confirmStartTest(tier.level)}
                  className={`border border-slate-200 rounded-2xl p-4 cursor-pointer transition duration-200 text-left relative group ${tier.color}`}
                >
                  <h4 className="font-extrabold text-base tracking-wide flex justify-between items-center">
                    {tier.title}
                    <span className="text-xs font-semibold opacity-70 group-hover:translate-x-1 transition-transform">➔</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload and JD Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl relative space-y-6 animate-scale-up">
            {/* Close Button */}
            <button
              onClick={() => {
                if (!customSubmitting) {
                  setShowResumeModal(false);
                  setResumeFile(null);
                  setJobDescription('');
                }
              }}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-650 font-bold transition cursor-pointer text-base"
              disabled={customSubmitting}
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-3xl">📄</span>
              <h3 className="text-2xl font-extrabold text-slate-950">Custom Resume Interview</h3>
              <p className="text-slate-505 text-sm">
                Generate tailored interview questions matching your resume profile against a job description.
              </p>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* File Uploader */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">Upload Resume (PDF or TXT)</label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition relative ${
                    resumeFile 
                      ? 'border-emerald-500 bg-emerald-50/10' 
                      : 'border-slate-300 hover:border-slate-450 hover:bg-slate-50'
                  }`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResumeFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  {resumeFile ? (
                    <div className="space-y-1">
                      <span className="text-emerald-500 text-xl font-bold">✓</span>
                      <p className="text-sm font-semibold text-slate-705">{resumeFile.name}</p>
                      <p className="text-[10px] text-slate-400">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-slate-400 text-xl">📁</span>
                      <p className="text-sm font-medium text-slate-605">Select or drop file here</p>
                      <p className="text-[10px] text-slate-400">Supports PDF or plain TXT up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Text Area */}
              <div className="space-y-1.5">
                <label htmlFor="jd" className="text-xs font-semibold text-slate-505 block">Job Description</label>
                <textarea
                  id="jd"
                  rows="5"
                  placeholder="Paste the target job description (responsibilities, requirements, technical skills)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-2xl p-3 text-sm text-slate-800 placeholder-slate-400 transition"
                  required
                />
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-1.5">
                <label htmlFor="customDifficulty" className="text-xs font-semibold text-slate-505 block">Experience Level</label>
                <select
                  id="customDifficulty"
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-slate-350"
                >
                  <option value="Junior">Junior Level</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior Level</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={customSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-2xl text-sm transition duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {customSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating AI Interview... (may take 10s)
                  </>
                ) : (
                  'Start Custom AI Interview ➔'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Government Exam Subject Modal */}
      {showGovModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 lg:p-8 shadow-2xl relative space-y-6 animate-scale-up">
            {/* Close Button */}
            <button
              onClick={() => setShowGovModal(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-650 font-bold transition cursor-pointer text-base"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-3xl">🏛️</span>
              <h3 className="text-2xl font-extrabold text-slate-900">Select Exam Subject</h3>
              <p className="text-slate-500 text-sm">
                Choose the subject/topic you want to prepare for in the <strong className="text-slate-800">{selectedGovExam}</strong> exam.
              </p>
            </div>

            <div className="space-y-4">
              {govExamsList.find(e => e.name === selectedGovExam)?.subExams && (
                <div className="space-y-1.5">
                  <label htmlFor="govSubExamSelect" className="text-xs font-semibold text-slate-500 block">Select Specific Exam</label>
                  <select
                    id="govSubExamSelect"
                    value={selectedGovSubExam}
                    onChange={(e) => {
                      const newSubExamName = e.target.value;
                      setSelectedGovSubExam(newSubExamName);
                      const currentExamData = govExamsList.find(ex => ex.name === selectedGovExam);
                      const sub = currentExamData?.subExams?.find(s => s.name === newSubExamName);
                      if (sub && sub.subjects.length > 0) {
                        setSelectedGovSubject(sub.subjects[0]);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-slate-350"
                  >
                    {govExamsList.find(e => e.name === selectedGovExam)?.subExams?.map((sub) => (
                      <option key={sub.name} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="govSubjectSelect" className="text-xs font-semibold text-slate-500 block">Select Subject</label>
                <select
                  id="govSubjectSelect"
                  value={selectedGovSubject}
                  onChange={(e) => setSelectedGovSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-slate-350"
                >
                  {govExamsList.find(e => e.name === selectedGovExam)?.subExams ? (
                    govExamsList.find(e => e.name === selectedGovExam)?.subExams?.find(s => s.name === selectedGovSubExam)?.subjects.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))
                  ) : (
                    govExamsList.find(e => e.name === selectedGovExam)?.subjects?.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Question Source Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 block">Question Source Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGovSource('ai')}
                    className={`py-2 px-3 text-xs font-bold border rounded-xl transition duration-150 cursor-pointer text-center ${
                      selectedGovSource === 'ai'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    🤖 AI Generated
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGovSource('pyq')}
                    className={`py-2 px-3 text-xs font-bold border rounded-xl transition duration-150 cursor-pointer text-center ${
                      selectedGovSource === 'pyq'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    📜 Previous Year
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {selectedGovSource === 'ai' 
                    ? 'AI generates a fresh set of challenging mock questions matching the exam syllabus.'
                    : 'AI retrieves and adapts authentic questions asked in past years of this exam.'
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={confirmStartGovTest}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs tracking-wide shadow-xs transition duration-150 cursor-pointer"
              >
                Confirm & Start Mock Test ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
