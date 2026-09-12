# 🚀 PlacementPilot AI

### Agentic AI Placement Assistant

PlacementPilot AI is an AI-powered career and placement preparation platform designed to help students prepare for software engineering and technical placement opportunities.

It combines **AI assistance, adaptive practice, coding problems, resume analysis, job matching, interview preparation, and personalized career guidance** into a single platform.

---

## ✨ Features

* 🤖 AI Career Assistant
* 📝 Resume Analyzer
* 💼 Job Match Analysis
* 💻 Coding Practice
* 🧠 Adaptive Learning
* 🎯 Personalized Study Planning
* 🎤 AI Mock Interview
* 👤 Student Profile
* 🔐 JWT Authentication
* 📊 Placement Preparation Tracking

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │    React Frontend    │
                         │      Vite + CSS      │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │    FastAPI Backend   │
                         │       Python         │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
      │  AI Agents   │      │   Database   │      │    Tools     │
      ├──────────────┤      ├──────────────┤      ├──────────────┤
      │ Planner      │      │ SQLAlchemy   │      │ Resume Parser│
      │ Evaluator    │      │ SQLite       │      │ Job Analyzer │
      │ Interviewer  │      │              │      │ Questions    │
      │ Adaptive     │      │              │      │ Practice     │
      │ Tool Executor│      │              │      │ Code Engine  │
      └──────┬───────┘      └──────────────┘      └──────────────┘
             │
             ▼
      ┌──────────────────┐
      │  Ollama / Qwen3  │
      │       4B         │
      └──────────────────┘
```

---

## 🔄 Application Workflow

```text
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
```

---

## 🤖 AI Agent Workflow

### 🧭 Planner Agent

Understands the student's request and creates an appropriate execution plan.

```text
Student Request
      ↓
Understand User Intent
      ↓
Create Execution Plan
      ↓
Select Required Tool
      ↓
Execute Tool
      ↓
Generate Response
```

### 📊 Evaluator Agent

Evaluates student performance across:

* Technical answers
* Coding performance
* Interview responses
* Practice progress

It identifies weak areas and provides improvement recommendations.

### 🎤 Interviewer Agent

Provides AI-powered interview preparation by:

* Generating interview questions
* Conducting interview-style interactions
* Evaluating responses
* Providing feedback
* Identifying improvement areas

### 🧠 Adaptive Learning Agent

Adjusts the student's preparation based on their performance.

```text
Student Performance
        ↓
Analyze Performance
        ↓
Identify Weak Areas
        ↓
Recommend Topics
        ↓
Generate Practice
        ↓
Evaluate Results
        ↓
Update Recommendations
```

### ⚙️ Tool Executor

Connects the AI agents with the application's tools and executes the appropriate tool based on the generated plan.

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* JWT Authentication

### AI

* Ollama
* Qwen3:4b
* Agent-based AI architecture

---

## 🧰 Application Tools

| Tool               | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| Resume Parser      | Extract and analyze resume information                |
| Job Analyzer       | Analyze job requirements and identify relevant skills |
| Question Generator | Generate technical practice questions                 |
| Practice Engine    | Manage coding and technical practice                  |
| Code Executor      | Execute and evaluate submitted code                   |

---

## 💻 Coding Practice

PlacementPilot AI includes a coding practice system containing **616 programming problems**.

Problems are available in:

* 🟢 Easy
* 🟡 Medium
* 🔴 Hard

### Supported Features

* Problem statements
* Examples
* Constraints
* Test cases
* Code execution
* Output comparison

### Supported Languages

* Python
* C++
* JavaScript

---

## 🔐 Authentication

The application uses **JWT-based authentication** for protected APIs.

```text
Signup
   ↓
Login
   ↓
JWT Access Token
   ↓
Protected APIs
   ↓
Student Profile
```

---

## 📂 Project Structure

```text
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
│   └── .env.example
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
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Mohid223/PlacementPilot-AI.git
cd PlacementPilot-AI
```

---

## 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Ollama Setup

PlacementPilot AI currently uses **Ollama with the Qwen3 4B model** for local AI responses.

Download the model:

```bash
ollama pull qwen3:4b
```

Start the model:

```bash
ollama run qwen3:4b
```

Ollama runs locally at:

```text
http://localhost:11434
```

> Ollama and the Qwen3 model are not included in this repository.

---

## 4. Environment Variables

Create a `.env` file inside the `backend` directory.

```env
OLLAMA_URL=http://localhost:11434/api/chat
OLLAMA_MODEL=qwen3:4b
```

Use `.env.example` as a template.

> **Do not commit `.env`, API keys, passwords, or private credentials to GitHub.**

---

## 5. Run the Backend

Inside the `backend` directory:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 6. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🚀 Run the Complete Application

Run the following components in separate terminals.

### Terminal 1 — Ollama

```bash
ollama run qwen3:4b
```

### Terminal 2 — Backend

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

### Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 🔎 Job Matching

PlacementPilot AI includes job analysis functionality for comparing job requirements with student skills.

The planned workflow is:

```text
Student Profile
      ↓
Job Requirements
      ↓
Job Analyzer
      ↓
Skill Matching
      ↓
Match Analysis
      ↓
Skill Gap Recommendations
```

For future real-time job search functionality, external job APIs such as **SerpApi** can be integrated.

---

# 🔮 Future Improvements

* 🌐 Real-time job search integration
* 📄 Advanced resume scoring
* 🧠 Improved AI skill-gap analysis
* 💻 Additional programming languages
* 🎤 Advanced AI interview evaluation
* 🎙️ Voice-based mock interviews
* 📊 Advanced placement analytics
* 🗺️ Personalized learning roadmap
* 🔒 Production-grade secure code sandbox
* ☁️ Cloud deployment
* 🗄️ PostgreSQL support
* ⚡ Improved multi-agent orchestration

---

# ⚠️ Security Note

The current code execution engine is intended for **development and hackathon use**.

Before production deployment, arbitrary user code should be executed inside a properly isolated and secure sandbox or containerized execution environment.

### Never commit:

```text
.env
*.db
node_modules/
__pycache__/
venv/
*.pyc
API keys
Passwords
Private credentials
Large AI model files
```

---

# 👨‍💻 Project

## PlacementPilot AI

### Agentic AI Placement Assistant

An AI-powered placement preparation platform designed to help students prepare for technical placement opportunities through:

* AI-powered career assistance
* Adaptive learning
* Coding practice
* Resume analysis
* Job matching
* Interview preparation
* Personalized career guidance

### Built With

```text
React + Vite + JavaScript + CSS
                +
Python + FastAPI + SQLAlchemy + SQLite
                +
AI Agents + Ollama + Qwen3 4B
```

---

## 📜 License

This project is developed for **educational, learning, and hackathon purposes**.

