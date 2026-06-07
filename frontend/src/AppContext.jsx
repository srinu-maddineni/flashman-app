import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

// Create the context
export const AppContent = createContext()

export const AppContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // Configure axios defaults
  axios.defaults.withCredentials = true
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ""

  // 1. Fetch user data (Name & Verification Status)
  const getUserData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/user-data`)
      if (response.data.success) {
        setUserData(response.data.userData)
      } else {
        toast.error(response.data.message || "Failed to load user profile.")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // 2. Check if user is authenticated (Check cookie validity on page load)
  const checkAuthState = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/isauthenticated`)
      if (response.data.success) {
        setIsLoggedIn(true)
        await getUserData()
      } else {
        setIsLoggedIn(false)
        setUserData(null)
      }
    } catch (error) {
      setIsLoggedIn(false)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  // 3. Logout user
  const logout = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/logout`)
      if (response.data.success) {
        setIsLoggedIn(false)
        setUserData(null)
        setHistory([])
        toast.success("Successfully logged out.")
      } else {
        toast.error(response.data.message || "Logout failed.")
      }
    } catch (error) {
      toast.error(error.message || "An error occurred during logout.")
    }
  }

  // 4. Fetch past test history
  const getHistory = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/interview/history`)
      if (response.data.success) {
        setHistory(response.data.history)
      } else {
        toast.error(response.data.message || "Failed to load test history.")
      }
    } catch (error) {
      console.error("Error fetching history:", error)
    }
  }

  // Run auth check on initial load
  useEffect(() => {
    checkAuthState()
  }, [])

  // Pass these values globally
  const value = {
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    history,
    setHistory,
    loading,
    BACKEND_URL,
    getUserData,
    checkAuthState,
    logout,
    getHistory
  }

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  )
}