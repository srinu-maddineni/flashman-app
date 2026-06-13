import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Resetpass from './pages/Resetpass'
import Emailverify from './pages/Emailverify'
import Dashboard from './pages/Dashboard'
import Test from './pages/Test'
import TestDetail from './pages/TestDetail'
import GovTest from './pages/GovTest'
import GovTestDetail from './pages/GovTestDetail'

const App = () => {
  return (
    <>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="dark"
    />
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/resetpassword' element={<Resetpass/>} />
      <Route path='/emailverify' element={<Emailverify/>} />
      <Route path='/test' element={<Test/>} />
      <Route path='/testdetail' element={<TestDetail/>} />
      <Route path='/gov-test' element={<GovTest/>} />
      <Route path='/gov-testdetail' element={<GovTestDetail/>} />
    </Routes>
    </>
  )
}

export default App
