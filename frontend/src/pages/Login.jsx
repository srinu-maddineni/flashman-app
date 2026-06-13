import React, { useState, useContext } from 'react'
import { image } from '../assets/image'
import { AppContent } from '../AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Login = () => {
  const [state, setState] = useState('signin') // 'signin' or 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { setIsLoggedIn, getUserData } = useContext(AppContent)

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (state === 'signup' && !name)) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      if (state === 'signup') {
        const response = await axios.post(`${BACKEND_URL}/api/auth/register`, { name, email, password });
        if (response.data.success) {
          toast.success("Account created successfully!");
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
          setIsLoggedIn(true);
          getUserData();
          navigate('/emailverify');
        } else {
          toast.error(response.data.message || "Registration failed.");
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
        if (response.data.success) {
          toast.success("Welcome back!");
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
          setIsLoggedIn(true);
          getUserData();
          navigate('/dashboard');
        } else {
          toast.error(response.data.message || "Invalid credentials.");
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || error.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none text-slate-800">
      
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

      {/* Dynamic Animated Ambient Background Blobs */}
      <div className="absolute top-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-red-500/5 rounded-full filter blur-3xl animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-10 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-yellow-500/5 rounded-full filter blur-3xl animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-120 h-80 sm:h-120 bg-indigo-600/5 rounded-full filter blur-3xl animate-pulse duration-[10000ms]"></div>

      {/* Brand Header */}
      <div 
        className="flex items-center gap-3 mb-8 z-10 cursor-pointer transform hover:scale-102 transition duration-200" 
        onClick={() => navigate('/')}
      >
        <img src={image.flash} className="h-12 w-auto object-contain hover:rotate-12 transition-transform duration-300" alt="Flash logo" />
        <h1 className="text-3xl font-black tracking-wider">
          <span className="text-red-600">Flash</span>
          <span className="text-yellow-500">Man</span>
        </h1>
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl z-10 relative group animate-fade-in">
        
        {/* Glow effect at the top boundary */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>

        <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight">
          {state === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm text-center mt-2 mb-8 font-medium">
          {state === 'signin' ? 'Enter credentials to access your interview dashboard' : 'Sign up to start practicing coding assessments'}
        </p>



        <form onSubmit={handleSubmit} className="space-y-6">
          {state === 'signup' && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Full Name</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 text-base">👤</span>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-500/80 focus:outline-none focus:ring-1 focus:ring-red-500/30 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 transition"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-base font-bold">@</span>
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500/80 focus:outline-none focus:ring-1 focus:ring-red-500/30 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 transition"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Password</label>
              {state === 'signin' && (
                <button
                  type="button"
                  onClick={() => navigate('/resetpassword')}
                  className="text-xs text-yellow-600 hover:underline hover:text-yellow-750 transition font-semibold"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-base">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500/80 focus:outline-none focus:ring-1 focus:ring-red-500/30 rounded-2xl py-3 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 012.238-3.287M12 5c.479 0 .953.033 1.42.097M10.5 8.5a3 3 0 11-3.3 3.3m0 0l-1.42 1.42M10.5 8.5L3 3m18 18l-7.5-7.5M12 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-2.238 3.287m-1.42-1.42a3 3 0 11-3.3-3.3m0 0l1.42-1.42" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 disabled:from-slate-400 disabled:to-slate-300 text-white font-extrabold rounded-2xl transition duration-200 cursor-pointer shadow-lg hover:shadow-red-500/10 active:scale-[0.99] text-sm tracking-wide"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              state === 'signin' ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="mt-8 text-center text-xs sm:text-sm text-slate-500 font-medium">
          {state === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setState('signup')}
                className="text-yellow-600 hover:underline hover:text-yellow-750 font-bold transition ml-0.5 cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setState('signin')}
                className="text-yellow-600 hover:underline hover:text-yellow-750 font-bold transition ml-0.5 cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login