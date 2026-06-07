# ⚡ Flashman — AI-Powered Technical Interview Simulator

Flashman is a modern web application designed to help developers ace their technical interviews. By leveraging the power of **Google Gemini AI**, Flashman simulates real-world coding/engineering interviews, generates customized questions, and provides instant, detailed feedback on the candidate's technical accuracy and communication skills (including speaking pace analysis).

---

## ✨ Core Features

* **Interactive Assessment Library:** Select from a wide variety of technologies (Frontend, Backend, Databases, DevOps, Mobile, etc.) and difficulty levels (Junior, Mid-Level, Senior).
* **AI-Generated Questions:** Flashman uses `gemini-2.5-flash` to dynamically generate 10 unique, high-quality technical questions matching the chosen tech and experience level.
* **Speech-to-Text Dictation:** Simulates a real speaking interview. Candidates speak their answers, and Flashman records and transcribes them in real-time.
* **Live Audio Visualizer:** Dynamic, sleek vertical soundwave animation to show microphone activity during the speaking test.
* **Text-to-Speech (TTS):** The simulator reads questions aloud to emulate an interviewer's voice prompt (can be muted).
* **Performance Dashboard:** Visually track progress, total assessments, overall average scores, strongest areas, and recent grading trends with custom SVG charts.
* **Detailed AI Feedback & Critiques:** For every question, view your answer side-by-side with an expert reference model answer and an AI critique scoring you out of 10.
* **Speech Pace (WPM) Analysis:** Evaluates your speaking speed (Optimal: 110-150 WPM) and highlights if you are speaking too fast/rushed or too slow.
* **Secure Auth & Account Verification:** Full user authentication system including secure signup, login, email OTP verification (via Brevo/SMTP), and password reset options.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React 19, Vite 8, JavaScript
* **Styling:** Tailwind CSS v4.3
* **Routing & State:** React Router 7, React Context API
* **HTTP Client:** Axios
* **Notification System:** React Toastify v11
* **Web APIs:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) for speech dictation and voice prompt generation.

### Backend
* **Runtime:** Node.js, Express
* **Database:** MongoDB with Mongoose ODM
* **AI Model:** Google Generative AI (`gemini-2.5-flash`)
* **Email System:** Nodemailer (via Brevo SMTP integration)
* **Security:** JWT (JSON Web Tokens), BCrypt.js (password hashing), HTTP-Only cookies.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance or MongoDB Atlas cloud cluster)
* **Google Gemini API Key** (Get a free key from [Google AI Studio](https://aistudio.google.com/))
* **SMTP Credentials** (e.g., [Brevo](https://www.brevo.com/) or Gmail SMTP configuration for OTP emails)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Flashman
   ```

2. **Backend Setup:**
   * Navigate to the backend directory:
     ```bash
     cd backend
     ```
   * Install dependencies:
     ```bash
     npm install
     ```
   * Create a `.env` file in the `backend/` directory and configure the environment variables:
     ```env
     PORT=4000
     NODE_ENV=development
     MONGODB=your_mongodb_connection_string
     JWT_SC_TOKEN=your_jwt_secret_key
     GEMINI_API_KEY=your_gemini_api_key
     SMTP_USER=your_brevo_smtp_username
     SMTP_PASS=your_brevo_smtp_password
     SENDER_EMAIL=your_verified_sender_email
     FRONTEND_URL=http://localhost:5173
     ```
   * Start the backend server:
     ```bash
     npm run server
     ```

3. **Frontend Setup:**
   * Open a new terminal and navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   * Install dependencies:
     ```bash
     npm install
     ```
   * Create a `.env.local` or `.env` file in the `frontend/` directory and set the API URL:
     ```env
     VITE_BACKEND_URL=http://localhost:4000
     ```
   * Start the development server:
     ```bash
     npm run dev
     ```

---

## 📦 Production Build & Deployment

### Build Frontend
To generate the optimized production assets for the frontend:
```bash
cd frontend
npm run build
```
This builds your React project into the `dist/` directory, which can be deployed to static hosting providers like Vercel, Netlify, or Hostinger.

### Deploy Backend
Deploy the `backend` folder to dynamic cloud providers like Render, Railway, or Heroku:
* Set `NODE_ENV` to `production`.
* Set your production database URIs, API keys, and SMTP credentials.
* Update `FRONTEND_URL` on the backend to point to your deployed frontend domain.
* Update `VITE_BACKEND_URL` on the frontend to point to your deployed backend domain.
