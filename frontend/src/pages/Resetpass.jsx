import React, { useState } from 'react'
import { image } from '../assets/image'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Resetpass = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  axios.defaults.withCredentials = true;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address.")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/reset-password-otp`, { email })
      if (response.data.success) {
        toast.success(response.data.message || "Reset OTP sent to your registered email.")
        setIsOtpSent(true)
      } else {
        toast.error(response.data.message || "Failed to send OTP.")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!email || !otp || !newPassword) {
      toast.error("Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      })
      if (response.data.success) {
        toast.success("Password reset successfully! Redirecting to login...")
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        toast.error(response.data.message || "Failed to reset password.")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden'>
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl"></div>

      {/* Brand Header */}
      <div className='flex items-center gap-3 mb-8 z-10 cursor-pointer' onClick={() => navigate('/')}>
        <img src={image.flash} className='h-16 w-auto object-contain animate-pulse' />
        <h1 className='text-4xl font-extrabold tracking-wider'>
          <span className='text-red-600'>Flash</span>
          <span className='text-yellow-500'>Man</span>
        </h1>
      </div>

      {/* Form Container */}
      <div className='w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl z-10'>
        <h2 className='text-2xl font-bold text-white mb-2 text-center'>Reset Password</h2>
        <p className='text-slate-400 text-sm text-center mb-8'>
          {!isOtpSent
            ? 'Enter your registered email address to receive a password reset code'
            : 'Enter the 6-digit OTP code sent to your email and choose a new password'}
        </p>

        {!isOtpSent ? (
          /* Step 1 Form */
          <form onSubmit={handleSendOtp} className='space-y-6'>
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

            <button
              type="submit"
              disabled={loading}
              className='w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-red-600/20 active:scale-[0.98]'
            >
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          /* Step 2 Form */
          <form onSubmit={handleResetPassword} className='space-y-6'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-300 block'>Email Address</label>
              <div className='relative flex items-center'>
                <span className="absolute left-4 text-slate-600 font-bold text-lg">@</span>
                <input
                  type="email"
                  value={email}
                  disabled
                  className='w-full bg-slate-950/30 border border-slate-900 opacity-60 rounded-xl py-3 pl-12 pr-4 text-slate-400 cursor-not-allowed'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-300 block'>Verification OTP</label>
              <div className='relative flex items-center'>
                <span className="absolute left-4 text-slate-600 text-lg">🔑</span>
                <input
                  type="text"
                  placeholder='Enter 6-digit OTP'
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className='w-full bg-slate-950/50 border border-slate-800 focus:border-red-600 focus:outline-none rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 transition-colors'
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-300 block'>New Password</label>
              <div className='relative flex items-center'>
                <span className="absolute left-4 text-slate-600 text-lg">🔒</span>
                <input
                  type="password"
                  placeholder='Enter new password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className='w-full bg-slate-950/50 border border-slate-800 focus:border-red-600 focus:outline-none rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 transition-colors'
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className='w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-yellow-500/20 active:scale-[0.98]'
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setIsOtpSent(false)}
              className='w-full text-center text-xs text-slate-400 hover:underline hover:text-white transition-colors cursor-pointer mt-2'
            >
              Change Email
            </button>
          </form>
        )}

        <div className='mt-8 text-center text-sm text-slate-400'>
          <button
            onClick={() => navigate('/login')}
            className='text-yellow-500 hover:underline hover:text-yellow-400 font-semibold transition-colors'
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Resetpass