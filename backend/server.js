import express from "express"
import cors from "cors"
import "dotenv/config"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import cookieParser from "cookie-parser"
import conectDb from "./config/mongodb.js"
import authRouter from "./routers/authRouter.js"
import userRouter from "./routers/userRouter.js"
import interviewRouter from "./routers/interviewRouter.js"
import feedbackRouter from "./routers/feedbackRouter.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const port = process.env.PORT || 4000
conectDb()
app.use(express.json())
app.use(cookieParser())
app.use(cors((req, callback) => {
  const origin = req.header('Origin')
  const rawOrigin = process.env.FRONTEND_URL || "http://localhost:5173"
  const cleanOrigin = rawOrigin.replace(/['"\r\n\t]/g, "").trim().replace(/\/+$/, "")

  const corsOptions = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }

  if (
    origin &&
    (origin === cleanOrigin ||
      origin.startsWith("http://localhost:") ||
      origin.endsWith(".vercel.app"))
  ) {
    corsOptions.origin = true
  } else {
    corsOptions.origin = false
  }

  callback(null, corsOptions)
}))


app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/interview', interviewRouter)
app.use('/api/feedback', feedbackRouter)

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

app.listen(port, () => console.log(`sever started at port ${port}`))