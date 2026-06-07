import express from 'express'
import getuserid from '../middleware/userauth.js'
import { userData } from '../controler/usercontroler.js'

const userRouter = express.Router()

userRouter.get('/user-data',getuserid,userData)

export default userRouter
