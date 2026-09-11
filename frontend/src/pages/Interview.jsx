import { useState } from "react";
import {
  Brain,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Trophy,
  RotateCcw,
  Send,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";

import "./Interview.css";

const API_BASE = "http://127.0.0.1:8000";

const TOTAL_QUESTIONS = 5;

const Interview = () => {
  const [role, setRole] = useState("Python Developer");
  const [difficulty, setDifficulty] = useState("Medium");

  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [questionNumber, setQuestionNumber] = useState(1);
  const [question, setQuestion] = useState(null);

  const [answer, setAnswer] = useState("");
  const [evaluations, setEvaluations] = useState([]);

  const [evaluation, setEvaluation] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);

  const [report, setReport] = useState(null);
  const [interviewFinished, setInterviewFinished] = useState(false);

  const [error, setError] = useState("");

  // ---------------------------------------
  // Generate Question
  // ---------------------------------------
  const generateQuestion = async (number, previousQuestions = []) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/interview/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          difficulty,
          question_number: number,
          previous_questions: previousQuestions,
          resume_text: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate question.");
      }

      setQuestion(data.question);
      setAnswer("");
      setEvaluation(null);
      setShowEvaluation(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // Start Interview
  // ---------------------------------------
  const startInterview = async () => {
    setStarted(true);
    setQuestionNumber(1);
    setEvaluations([]);
    setReport(null);
    setInterviewFinished(false);

    await generateQuestion(1, []);
  };

  // ---------------------------------------
  // Evaluate Answer
  // ---------------------------------------
  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please write your answer first.");
      return;
    }

    if (!question?.question) {
      setError("Question not available.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/interview/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          question: question.question,
          answer: answer.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to evaluate answer.");
      }

      const newEvaluation = {
        question_number: questionNumber,
        question: question.question,
        answer: answer.trim(),
        ...data.evaluation,
      };

      setEvaluation(data.evaluation);
      setShowEvaluation(true);

      setEvaluations((prev) => [...prev, newEvaluation]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // Next Question
  // ---------------------------------------
  const nextQuestion = async () => {
    if (questionNumber >= TOTAL_QUESTIONS) {
      await generateReport();
      return;
    }

    const previousQuestions = [
      ...evaluations.map((item) => item.question),
      question?.question,
    ].filter(Boolean);

    const nextNumber = questionNumber + 1;

    setQuestionNumber(nextNumber);

    await generateQuestion(nextNumber, previousQuestions);
  };

  // ---------------------------------------
  // Generate Final Report
  // ---------------------------------------
  const generateReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/interview/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          evaluations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate report.");
      }

      setReport(data.report);
      setInterviewFinished(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // Reset
  // ---------------------------------------
  const resetInterview = () => {
    setStarted(false);
    setLoading(false);
    setQuestionNumber(1);
    setQuestion(null);
    setAnswer("");
    setEvaluations([]);
    setEvaluation(null);
    setShowEvaluation(false);
    setReport(null);
    setInterviewFinished(false);
    setError("");
  };

  // ---------------------------------------
  // Start Screen
  // ---------------------------------------
  if (!started) {
    return (
      <div className="interview-page">
        <div className="interview-header">
          <div>
            <p className="interview-eyebrow">
              <Sparkles size={15} />
              AI MOCK INTERVIEW
            </p>

            <h1>Practice like a real interview.</h1>

            <p className="interview-subtitle">
              Get AI-generated questions, answer them naturally, and receive
              instant feedback on your performance.
            </p>
          </div>
        </div>

        <div className="interview-start-grid">
          <div className="interview-info-card">
            <div className="big-ai-icon">
              <Brain size={38} />
            </div>

            <h2>AI Interview Coach</h2>

            <p>
              PlacementPilot will conduct a realistic technical interview and
              evaluate your answers using AI.
            </p>

            <div className="interview-features">
              <div>
                <CheckCircle2 size={18} />
                AI-generated questions
              </div>

              <div>
                <CheckCircle2 size={18} />
                Answer evaluation
              </div>

              <div>
                <CheckCircle2 size={18} />
                Strength & weakness analysis
              </div>

              <div>
                <CheckCircle2 size={18} />
                Final performance report
              </div>
            </div>
          </div>

          <div className="interview-setup-card">
            <div className="card-title">
              <Target size={20} />
              <h2>Interview Setup</h2>
            </div>

            <div className="form-group">
              <label>Target Role</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Python Developer</option>
                <option>Software Engineer</option>
                <option>Machine Learning Engineer</option>
                <option>Data Science</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>

              <div className="difficulty-buttons">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <button
                    key={level}
                    className={
                      difficulty === level
                        ? "difficulty-btn active"
                        : "difficulty-btn"
                    }
                    onClick={() => setDifficulty(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="interview-meta">
              <div>
                <Clock size={17} />
                <span>Approx. 10–15 min</span>
              </div>

              <div>
                <Brain size={17} />
                <span>{TOTAL_QUESTIONS} AI questions</span>
              </div>
            </div>

            <button
              className="start-interview-btn"
              onClick={startInterview}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Interview"}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------
  // Final Report
  // ---------------------------------------
  if (interviewFinished && report) {
    return (
      <div className="interview-page">
        <div className="report-header">
          <div className="report-trophy">
            <Trophy size={38} />
          </div>

          <p className="interview-eyebrow">INTERVIEW COMPLETE</p>

          <h1>Your Interview Report</h1>

          <p>
            Here is your AI-generated performance analysis for{" "}
            <strong>{role}</strong>.
          </p>
        </div>

        <div className="report-score-card">
          <div className="score-circle">
            <span>{report.overall_score ?? 0}</span>
            <small>/100</small>
          </div>

          <div>
            <p className="score-label">Overall Score</p>
            <h2>{report.performance || "Interview completed successfully."}</h2>
          </div>
        </div>

        <div className="report-grid">
          <div className="report-card">
            <div className="report-card-title">
              <CheckCircle2 size={20} />
              <h3>Strengths</h3>
            </div>

            {report.strengths?.length > 0 ? (
              <ul>
                {report.strengths.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No strengths available.</p>
            )}
          </div>

          <div className="report-card">
            <div className="report-card-title">
              <AlertCircle size={20} />
              <h3>Weak Areas</h3>
            </div>

            {report.weak_areas?.length > 0 ? (
              <ul>
                {report.weak_areas.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No major weak areas detected.</p>
            )}
          </div>

          <div className="report-card full-width">
            <div className="report-card-title">
              <Sparkles size={20} />
              <h3>Recommendations</h3>
            </div>

            {report.recommendations?.length > 0 ? (
              <ul>
                {report.recommendations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Keep practicing and improving your technical answers.</p>
            )}
          </div>
        </div>

        <div className="report-actions">
          <button className="secondary-btn" onClick={resetInterview}>
            <RotateCcw size={18} />
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------
  // Interview Screen
  // ---------------------------------------
  return (
    <div className="interview-page">
      <div className="live-interview-header">
        <div>
          <p className="interview-eyebrow">
            <Brain size={15} />
            LIVE AI INTERVIEW
          </p>

          <h1>{role} Interview</h1>

          <p>
            {difficulty} difficulty · Question {questionNumber} of{" "}
            {TOTAL_QUESTIONS}
          </p>
        </div>

        <button className="reset-btn" onClick={resetInterview}>
          <RotateCcw size={17} />
          Exit
        </button>
      </div>

      <div className="progress-wrapper">
        <div className="progress-info">
          <span>Interview Progress</span>
          <strong>
            {Math.round((questionNumber / TOTAL_QUESTIONS) * 100)}%
          </strong>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%`,
            }}
          />
        </div>
      </div>

      {error && (
        <div className="error-box">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="interview-layout">
        <main className="question-section">
          <div className="question-card">
            <div className="question-top">
              <span className="question-number">
                Question {questionNumber}
              </span>

              {question?.category && (
                <span className="category-badge">
                  {question.category}
                </span>
              )}
            </div>

            {loading && !question ? (
              <div className="question-loading">
                <div className="loading-spinner"></div>
                <p>AI is preparing your question...</p>
              </div>
            ) : (
              <>
                <h2>
                  {question?.question ||
                    "Unable to load the interview question."}
                </h2>

                {question?.expected_topics?.length > 0 && (
                  <div className="expected-topics">
                    <span>Topics:</span>

                    {question.expected_topics.map((topic, index) => (
                      <span className="topic-chip" key={index}>
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="answer-card">
            <div className="answer-heading">
              <div>
                <h3>Your Answer</h3>
                <p>Answer as if you are speaking to an interviewer.</p>
              </div>

              <span>{answer.length} characters</span>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              disabled={loading || showEvaluation}
            />

            {!showEvaluation && (
              <button
                className="submit-answer-btn"
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
              >
                <Send size={18} />

                {loading ? "Evaluating..." : "Submit Answer"}
              </button>
            )}
          </div>

          {showEvaluation && evaluation && (
            <div className="evaluation-card">
              <div className="evaluation-header">
                <div>
                  <p className="interview-eyebrow">AI FEEDBACK</p>
                  <h2>Answer Evaluation</h2>
                </div>

                <div className="evaluation-score">
                  <strong>{evaluation.score ?? 0}</strong>
                  <span>/10</span>
                </div>
              </div>

              <div className="rating-badge">
                {evaluation.rating || "Evaluated"}
              </div>

              <div className="feedback-grid">
                <div>
                  <h4>
                    <CheckCircle2 size={17} />
                    Strengths
                  </h4>

                  {evaluation.strengths?.length > 0 ? (
                    <ul>
                      {evaluation.strengths.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No specific strengths provided.</p>
                  )}
                </div>

                <div>
                  <h4>
                    <AlertCircle size={17} />
                    Weaknesses
                  </h4>

                  {evaluation.weaknesses?.length > 0 ? (
                    <ul>
                      {evaluation.weaknesses.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No major weaknesses identified.</p>
                  )}
                </div>
              </div>

              <div className="improvement-box">
                <h4>How to improve</h4>
                <p>
                  {evaluation.improvement ||
                    "Try to make your answer more structured and specific."}
                </p>
              </div>

              {evaluation.ideal_points?.length > 0 && (
                <div className="ideal-points">
                  <h4>Ideal Answer Should Cover</h4>

                  <ul>
                    {evaluation.ideal_points.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.follow_up_question && (
                <div className="follow-up-box">
                  <span>Possible follow-up</span>
                  <p>{evaluation.follow_up_question}</p>
                </div>
              )}

              <button
                className="next-question-btn"
                onClick={nextQuestion}
                disabled={loading}
              >
                {questionNumber >= TOTAL_QUESTIONS
                  ? "View Final Report"
                  : "Next Question"}

                <ChevronRight size={19} />
              </button>
            </div>
          )}
        </main>

        <aside className="interview-sidebar">
          <div className="sidebar-card">
            <h3>Interview Progress</h3>

            <div className="mini-progress">
              <div
                style={{
                  width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%`,
                }}
              />
            </div>

            <p>
              {questionNumber} / {TOTAL_QUESTIONS} questions
            </p>
          </div>

          <div className="sidebar-card">
            <h3>Interview Tips</h3>

            <div className="tip">
              <span>01</span>
              <p>Understand the question before answering.</p>
            </div>

            <div className="tip">
              <span>02</span>
              <p>Explain your thought process clearly.</p>
            </div>

            <div className="tip">
              <span>03</span>
              <p>Use examples whenever possible.</p>
            </div>

            <div className="tip">
              <span>04</span>
              <p>Keep your answer structured and concise.</p>
            </div>
          </div>

          <div className="sidebar-card ai-coach-card">
            <Sparkles size={24} />

            <h3>AI Coach</h3>

            <p>
              Your answers are evaluated for correctness, clarity, depth and
              interview readiness.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;