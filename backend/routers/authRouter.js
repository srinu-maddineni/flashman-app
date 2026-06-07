import express from 'express'
import { isAuthenticate, login, logout, register, resetOtp, resetPassword, verifyemail, verifyOtp } from '../controler/authControler.js'
import getuserid from '../middleware/userauth.js'

const authRouter = express.Router()

authRouter.post('/register',register)
authRouter.post('/login',login)
authRouter.post('/logout',logout)
authRouter.post('/send-verify-otp',getuserid,verifyOtp)
authRouter.post('/verify-account', getuserid, verifyemail)
authRouter.post('/isauthenticated', getuserid, isAuthenticate)
authRouter.post('/reset-password-otp',resetOtp)
authRouter.post('/reset-password',resetPassword)




export default authRouter