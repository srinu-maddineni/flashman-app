import express from "express"
import cors from "cors"
import "dotenv/config"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import cookieParser from "cookie-parser"
import conectDb from "./config/mongodb.js"
import rateLimit from "express-rate-limit"
import authRouter from "./routers/authRouter.js"
import userRouter from "./routers/userRouter.js"
import interviewRouter from "./routers/interviewRouter.js"
import feedbackRouter from "./routers/feedbackRouter.js"
import govTestRouter from "./routers/govTestRouter.js"


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const port = process.env.PORT || 4000
conectDb().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message)
  process.exit(1)
})
app.use(express.json())
app.use(cookieParser())
const allowedOrigin = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "")

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const isAllowed = origin === allowedOrigin ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      (origin.endsWith(".vercel.app") && origin.includes("flashman"))
    callback(null, isAllowed)
  },
  credentials: true
}))

const apiRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests from this IP, please try again later"
})
app.use(apiRequestLimiter)


const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 30,
  message: "Too many requests from this IP, please try again later"
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/interview', interviewRouter)
app.use('/api/feedback', feedbackRouter)
app.use('/api/gov', limiter, govTestRouter)


const distPath = path.join(__dirname, '../frontend/dist')
if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send("Server started at 4000")
  })
}

// Global error handler — catches unhandled errors in routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

app.listen(port, () => console.log(`Server started at port ${port}`))