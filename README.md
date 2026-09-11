# 🚀 PlacementPilot AI

### Agentic AI Placement Assistant

PlacementPilot AI is an AI-powered career and placement assistant designed to help students prepare for software engineering and technical placement opportunities.

It combines **AI assistance, adaptive practice, coding problems, resume analysis, job matching, interview preparation, and personalized career guidance** in one platform.

---

## ✨ Features

- 🤖 AI Career Assistant
- 📝 Resume Analyzer
- 💼 Job Match Analysis
- 💻 Coding Practice
- 🧠 Adaptive Learning
- 🎯 Personalized Study Planning
- 🎤 AI Mock Interview
- 👤 Student Profile
- 🔐 User Authentication
- 📊 Placement Preparation Tracking

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   Vite + CSS        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │      REST APIs      │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐    ┌─────────────┐   ┌─────────────┐
       │ AI Agents │    │   Database  │   │    Tools    │
       └─────┬─────┘    └─────────────┘   └─────────────┘
             │
             ▼
       ┌─────────────┐
       │   Ollama    │
       │  Qwen3:4b   │
       └─────────────┘
🛠️ Technology Stack
Frontend
React
Vite
JavaScript
CSS
Backend
Python
FastAPI
SQLAlchemy
SQLite
JWT Authentication
AI
Ollama
Qwen3:4b
AI Agents
Planner Agent
Evaluator Agent
Interviewer Agent
Adaptive Learning Agent
Tool Executor
Tools
Resume Parser
Job Analyzer
Question Generator
Coding Practice Engine
Code Executor
📂 Project Structure
PlacementPilot-AI/
│
├── backend/
│   │
│   ├── agents/
│   │   ├── planner.py
│   │   ├── evaluator.py
│   │   ├── interviewer.py
│   │   ├── adaptive_agent.py
│   │   └── tool_executor.py
│   │
│   ├── services/
│   │   ├── llm_service.py
│   │   └── code_executor.py
│   │
│   ├── tools/
│   │   ├── resume_parser.py
│   │   ├── job_analyzer.py
│   │   ├── question_generator.py
│   │   └── practice_engine.py
│   │
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── frontend/
│   │
│   ├── public/
│   │   └── data/
│   │       └── problems.json
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Practice.jsx
│   │   │   ├── Resume.jsx
│   │   │   ├── JobMatch.jsx
│   │   │   ├── Interview.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── .gitignore
⚙️ Installation
1. Clone the Repository
 git clone https://github.com/Mohid223/PlacementPilot-AI.git

cd PlacementPilot-AI
🐍 Backend Setup

Go to the backend directory:

cd backend

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt
🤖 Ollama Setup

PlacementPilot AI currently uses Ollama with the Qwen3 4B model for local AI responses.

Install Ollama on your system and download the model:

ollama pull qwen3:4b

Start the model:

ollama run qwen3:4b

The application expects Ollama to run at:

http://localhost:11434

Ollama and the Qwen3 model are not included in this repository.

🔐 Environment Variables

Create a .env file inside the backend folder.

OLLAMA_URL=http://localhost:11434/api/chat
OLLAMA_MODEL=qwen3:4b

Do not commit the .env file to GitHub.

Use .env.example as a template.

▶️ Run Backend

Inside the backend folder:

uvicorn main:app --reload

Backend will run at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs
⚛️ Frontend Setup

Open another terminal.

Go to the frontend:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend will run at:

http://localhost:5173
🔄 Application Flow
Student
   │
   ▼
React Frontend
   │
   ▼
FastAPI REST API
   │
   ▼
Planner Agent
   │
   ├── Resume Parser
   ├── Job Analyzer
   ├── Question Generator
   ├── Practice Engine
   └── Interviewer
          │
          ▼
      Ollama / Qwen3
          │
          ▼
      AI Response
          │
          ▼
      Student
🤖 AI Agent Workflow
Planner Agent

Understands the student's request and creates an execution plan.

Evaluator Agent

Evaluates answers, coding performance, and preparation progress.

Interviewer Agent

Generates interview questions and conducts AI-based interview preparation.

Adaptive Agent

Adjusts practice and learning recommendations according to the student's performance.

Tool Executor

Selects and executes the appropriate PlacementPilot tools.

💻 Coding Practice

PlacementPilot includes a coding practice system containing 616 programming problems.

Problems include different difficulty levels:

Easy
Medium
Hard

The practice system supports:

Problem statements
Examples
Constraints
Test cases
Python
C++
JavaScript
Code execution
Output comparison
🔐 Authentication

The application uses JWT-based authentication.

Supported operations:

Signup
   ↓
Login
   ↓
JWT Access Token
   ↓
Protected APIs
   ↓
Student Profile
🎯 Future Improvements
Real-time job scraping
Advanced resume scoring
More programming languages
Better AI interview evaluation
Voice-based mock interviews
Placement analytics dashboard
Personalized learning roadmap
Production-grade code sandbox
Cloud deployment
PostgreSQL support
⚠️ Security Note

The current coding execution engine is intended for development and hackathon use.

Production deployment should use a secure sandbox/containerized execution environment before allowing arbitrary user code execution.

Never commit:

.env
*.db
node_modules/
__pycache__/
API keys
Passwords
Private credentials
Large AI model files
👨‍💻 Project

PlacementPilot AI

An Agentic AI-powered placement preparation platform for students.

Built using:

React + FastAPI + Python + SQLAlchemy + SQLite
+ AI Agents + Ollama + Qwen3
📌 Local Development

Run these three components separately:

Terminal 1 — Ollama
ollama run qwen3:4b
Terminal 2 — Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload
Terminal 3 — Frontend
cd frontend
npm run dev

Then open:

http://localhost:5173

**Ye version GitHub ke liye proper hai.** Bas `YOUR_USERNAME` ko apne GitHub username se replace kar dena.

Aur ek important point: README mein `.env` ka naam structure mein dikh raha hai, lekin `.gitignore` ki wajah se **actual `.env` GitHub par nahi jayega**.
Google search API ke liye, ek related SerpApi option consider karein.
Ad
