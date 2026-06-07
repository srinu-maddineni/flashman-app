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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const port = process.env.PORT || 4000
conectDb()
app.use(express.json())
app.use(cookieParser())
const rawOrigin = process.env.FRONTEND_URL || "http://localhost:5173"
// Remove any trailing slash to satisfy CORS exact match
const allowOrigin = rawOrigin.replace(/\/+$/, "")
console.log('CORS allowOrigin:', allowOrigin)
app.use(cors({
  origin: allowOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Handle preflight OPTIONS requests for any route
// app.options(/.*/, (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', allowOrigin);
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   res.sendStatus(204);
// });


app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/interview', interviewRouter)

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