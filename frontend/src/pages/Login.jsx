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

  const navigate = useNavigate()
  const { setIsLoggedIn, getUserData } = useContext(AppContent)

  // Set default axios configuration to send cookies automatically
  axios.defaults.withCredentials = true;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (state === 'signup' && !name)) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    console.log("api request")

    try {
      if (state === 'signup') {
        const response = await axios.post(`${BACKEND_URL}/api/auth/register`, { name, email, password });
        if (response.data.success) {
          toast.success("Account created successfully!");
          console.log('Register response data:', response.data);
          setIsLoggedIn(true);
          getUserData();
          navigate('/emailverify');
        } else {
          toast.error(response.data.message || "Registration failed.");
          console.log(response.data.message)
        }
      } else {
        console.log('Attempting login with payload:', { email, password });
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
        if (response.data.success) {
          toast.success("Welcome back!");
          // Update global auth state
          setIsLoggedIn(true);
          getUserData();
          navigate('/dashboard');
        } else {
          toast.error(response.data.message || "Invalid credentials.");
        }
      }
    } catch (error) {
      console.error('Login error details:', error);
      toast.error(error.response?.data?.message || error.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden'>
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl"></div>

      {/* Brand Header */}
      <div className='flex items-center gap-3 mb-8 z-10 cursor-pointer' onClick={() => navigate('/')}>
        <img src={image.flash} className='h-16 w-auto object-contain animate-[ping_1s_ease-in-out_infinite]' />
        <h1 className='text-4xl font-extrabold tracking-wider'>
          <span className='text-red-600'>Flash</span>
          <span className='text-yellow-500'>Man</span>
        </h1>
      </div>

      {/* Form Container */}
      <div className='w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl z-10'>
        <h2 className='text-2xl font-bold text-white mb-2 text-center'>
          {state === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className='text-slate-400 text-sm text-center mb-8'>
          {state === 'signin' ? 'Enter credentials to access your interview dashboard' : 'Sign up to start practicing coding assessments'}
        </p>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {state === 'signup' && (
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-300 block'>Full Name</label>
              <div className='relative flex items-center'>
                <img src={image.user} className='absolute left-4 h-5 w-5 opacity-50' />
                <input
                  type="text"
                  placeholder='Enter user name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='w-full bg-slate-950/50 border border-slate-800 focus:border-red-600 focus:outline-none rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 transition-colors'
                  required
                />
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <label className='text-sm font-medium text-slate-300 block'>Email Address</label>
            <div className='relative flex items-center'>
              <span className="absolute left-4 text-slate-600 font-bold text-lg">@</span>
              <input
                type="email"
                placeholder='email@domain.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full bg-slate-950/50 border border-slate-800 focus:border-red-600 focus:outline-none rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 transition-colors'
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <label className='text-sm font-medium text-slate-300 block'>Password</label>
              {state === 'signin' && (
                <button
                  type="button"
                  onClick={() => navigate('/resetpassword')}
                  className='text-xs text-yellow-500 hover:underline hover:text-yellow-400 transition-colors'
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className='relative flex items-center'>
              {/* Lock icon fallback */}
              <span className="absolute left-4 text-slate-600 text-lg">🔒</span>
              <input
                type="password"
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full bg-slate-950/50 border border-slate-800 focus:border-red-600 focus:outline-none rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 transition-colors'
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className='w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-red-600/20 active:scale-[0.98]'
          >
            {loading ? 'Processing...' : state === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className='mt-8 text-center text-sm text-slate-400'>
          {state === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setState('signup')}
                className='text-yellow-500 hover:underline hover:text-yellow-400 font-semibold transition-colors'
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setState('signin')}
                className='text-yellow-500 hover:underline hover:text-yellow-400 font-semibold transition-colors'
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