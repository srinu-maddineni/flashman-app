import React, { useState, useContext } from 'react'
import { image } from '../assets/image'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContent } from '../AppContext'

const Emailverify = () => {
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sentAt, setSentAt] = useState(null)
  const navigate = useNavigate()
  const { setIsLoggedIn, getUserData } = useContext(AppContent)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/send-verify-otp`)
      if (response.data.success) {
        toast.success(response.data.message || 'Verification code sent to your email.')
        setIsOtpSent(true)
        setSentAt(new Date())
      } else {
        toast.error(response.data.message || 'Unable to send verification code.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    if (!otp) {
      toast.error('Please enter the verification code.')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-account`, { otp })
      if (response.data.success) {
        toast.success(response.data.message || 'Email verified successfully!')
        setIsLoggedIn(true)
        getUserData()
        navigate('/dashboard')
      } else {
        toast.error(response.data.message || 'Verification failed.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden'>
      <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl'></div>
      <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl'></div>

      <div className='flex items-center gap-3 mb-8 z-10 cursor-pointer' onClick={() => navigate('/')}>
        <img src={image.flash} className='h-16 w-auto object-contain animate-pulse' />
        <h1 className='text-4xl font-extrabold tracking-wider'>
          <span className='text-red-600'>Flash</span>
          <span className='text-yellow-500'>Man</span>
        </h1>
      </div>

      <div className='w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl z-10'>
        <h2 className='text-2xl font-bold text-white mb-2 text-center'>Verify Your Email</h2>
        <p className='text-slate-400 text-sm text-center mb-8'>
          Protect your account by verifying your email address. A 6-digit code will be sent to the email linked with your account.
        </p>

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} className='space-y-6'>
            <div className='space-y-2'>
              <p className='text-slate-300 text-sm'>Ready to verify? Click below to receive your code.</p>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-red-600/20 active:scale-[0.98]'
            >
              {loading ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyEmail} className='space-y-6'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-300 block'>Verification Code</label>
              <div className='relative flex items-center'>
                <span className='absolute left-4 text-slate-600 text-lg'>📩</span>
                <input
                  type='text'
                  placeholder='Enter 6-digit code'
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value)}
                  className='w-full bg-slate-950/50 border border-slate-800 focus:border-red-600 focus:outline-none rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 transition-colors'
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-yellow-500/20 active:scale-[0.98]'
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type='button'
              onClick={handleSendOtp}
              disabled={loading}
              className='w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-300 rounded-xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-slate-700/20 active:scale-[0.98]'
            >
              {loading ? 'Resending...' : 'Resend Code'}
            </button>

            {sentAt && (
              <p className='text-xs text-slate-500 text-center'>
                Code sent at {sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              </p>
            )}
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

export default Emailverify