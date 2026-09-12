import { useState } from "react";
import "./App.css";
import Practice from "./pages/Practice";
import Resume from "./pages/Resume";
import JobMatch from "./pages/JobMatch";
import Interview from "./pages/Interview";
// import Profile from "./pages/Profile";
  

const API_URL = "http://127.0.0.1:8000";

function App() {
  

  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

   

  const navigation = [
    {
      name: "Dashboard",
      icon: "⌂",
    },
    {
      name: "AI Assistant",
      icon: "✦",
    },
    {
      name: "Practice",
      icon: "◉",
    },
    {
      name: "Resume",
      icon: "▤",
    },
    {
      name: "Job Match",
      icon: "⌁",
    },
    {
      name: "Interview",
      icon: "◎",
    },
    {
      name: "Profile",
      icon: "●",
    },
  ];

  const changePage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };
 

  const sendMessage = async () => {
    const userMessage = input.trim();

    if (!userMessage || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Backend request failed."
        );
      }

      let aiResponse = "No response received.";

      if (
        data.results &&
        data.results.length > 0
      ) {
        const lastResult =
          data.results[data.results.length - 1].result;

        if (typeof lastResult === "string") {
          aiResponse = lastResult;
        } else {
          aiResponse = JSON.stringify(
            lastResult,
            null,
            2
          );
        }
      } else if (data.response) {
        aiResponse = data.response;
      } else if (data.message) {
        aiResponse = data.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message ||
            "Could not connect to the backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  

  const renderDashboard = () => (
    <div className="page">
      <div className="page-heading">
        <p className="eyebrow">AGENTIC AI</p>

        <h1>Dashboard</h1>

        <p>
          Your intelligent placement preparation workspace.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card large-card">
          <div className="card-top">
            <div>
              <p className="eyebrow">
                PLACEMENT READINESS
              </p>

              <h2>Keep improving</h2>
            </div>

            <div className="card-icon">✦</div>
          </div>

          <div className="progress-area">
            <div className="progress-info">
              <span>Overall preparation</span>

              <strong>68%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "68%" }}
              />
            </div>
          </div>

          <p className="card-description">
            Practice technical questions, improve your resume
            and prepare for AI-powered mock interviews.
          </p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">◉</div>

          <p className="eyebrow">PRACTICE</p>

          <h2>24</h2>

          <p className="card-description">
            Questions completed
          </p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon blue-icon">
            ▤
          </div>

          <p className="eyebrow">RESUME</p>

          <h2>82/100</h2>

          <p className="card-description">
            Current resume score
          </p>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">QUICK ACTIONS</p>

          <h2>What do you want to do?</h2>
        </div>
      </div>

      <div className="quick-actions">

        <button
          className="quick-action"
          onClick={() =>
            changePage("AI Assistant")
          }
        >
          <span>✦</span>

          <div>
            <strong>Ask AI Assistant</strong>

            <small>
              Get a personalized placement plan
            </small>
          </div>

          <b>→</b>
        </button>

        <button
          className="quick-action"
          onClick={() =>
            changePage("Practice")
          }
        >
          <span>◉</span>

          <div>
            <strong>Start Practice</strong>

            <small>
              Solve coding problems and improve your skills
            </small>
          </div>

          <b>→</b>
        </button>

        <button
          className="quick-action"
          onClick={() =>
            changePage("Resume")
          }
        >
          <span>▤</span>

          <div>
            <strong>Analyze Resume</strong>

            <small>
              Improve your resume with AI
            </small>
          </div>

          <b>→</b>
        </button>

      </div>
    </div>
  );

   

  const renderAssistant = () => (
    <div className="page assistant-page">

      <div className="page-heading">
        <p className="eyebrow">AGENTIC AI</p>

        <h1>AI Assistant</h1>

        <p>
          Tell PlacementPilot what you want to achieve and
          let the agent decide the next steps.
        </p>
      </div>

      <div className="assistant-container">

        <div className="assistant-header">

          <div>
            <div className="assistant-status">
              <span className="status-dot" />

              Agent Online
            </div>

            <h2>PlacementPilot Agent</h2>
          </div>

          <span className="powered">
             Ollama powered
          </span>

        </div>

        <div className="chat-area">

          {messages.length === 0 && (
            <div className="empty-chat">

              <div className="empty-icon">
                ✦
              </div>

              <h3>How can I help?</h3>

              <p>
                Ask me to create a study plan, generate
                interview questions, analyze a job or improve
                your placement preparation.
              </p>

              <div className="suggestions">

                <button
                  onClick={() =>
                    setInput(
                      "Give me Python OOP interview questions"
                    )
                  }
                >
                  Python interview questions
                </button>

                <button
                  onClick={() =>
                    setInput(
                      "Create a placement preparation plan for me"
                    )
                  }
                >
                  Create placement plan
                </button>

                <button
                  onClick={() =>
                    setInput(
                      "What should I prepare for a software engineer role?"
                    )
                  }
                >
                  Software engineer preparation
                </button>

              </div>

            </div>
          )}

          {messages.map(
            (message, index) => (
              <div
                className={`message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
                key={index}
              >

                <div className="message-label">
                  {message.role === "user"
                    ? "YOU"
                    : "PLACEMENTPILOT"}
                </div>

                <div className="message-content">
                  {message.content}
                </div>

              </div>
            )
          )}

          {loading && (
            <div className="message assistant-message">

              <div className="message-label">
                PLACEMENTPILOT
              </div>

              <div className="message-content loading-text">
                Agent is thinking...
              </div>

            </div>
          )}

        </div>

        <div className="chat-input-area">

          <textarea
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={handleInputKeyDown}
            placeholder="Tell me what you want to achieve..."
            rows="1"
          />

          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={
              loading ||
              !input.trim()
            }
          >
            →
          </button>

        </div>

      </div>
    </div>
  );
 

  const renderResume = () => (
    <div className="page">

      <div className="page-heading">
        <p className="eyebrow">
          CAREER INTELLIGENCE
        </p>

        <h1>Resume</h1>

        <p>
          Analyze your resume and identify areas that can
          improve your placement chances.
        </p>
      </div>

      <div className="simple-page-card">

        <div className="card-icon">
          ▤
        </div>

        <h2>AI Resume Analyzer</h2>

        <p>
          Upload your resume and PlacementPilot will analyze
          your skills, projects, experience, strengths and
          missing areas.
        </p>

        <button
          className="primary-btn"
          onClick={() => {
            setActivePage("AI Assistant");

            setInput(
              "Analyze my resume and tell me what I should improve."
            );
          }}
        >
          Analyze Resume →
        </button>

      </div>
    </div>
  );

  

  const renderJobMatch = () => (
    <div className="page">

      <div className="page-heading">
        <p className="eyebrow">
          CAREER MATCHING
        </p>

        <h1>Job Match</h1>

        <p>
          Compare your skills against a job description and
          identify what you need to prepare.
        </p>
      </div>

      <div className="simple-page-card">

        <div className="card-icon blue-icon">
          ⌁
        </div>

        <h2>AI Job Matcher</h2>

        <p>
          PlacementPilot can analyze a job description,
          identify required skills and calculate your
          preparation priorities.
        </p>

        <button
          className="primary-btn"
          onClick={() => {
            setActivePage("AI Assistant");

            setInput(
              "Analyze this job description and tell me what skills I need to prepare."
            );
          }}
        >
          Analyze Job →
        </button>

      </div>
    </div>
  );

   

  const renderInterview = () => (
    <div className="page">

      <div className="page-heading">
        <p className="eyebrow">
          INTERVIEW AGENT
        </p>

        <h1>Mock Interview</h1>

        <p>
          Practice technical and HR interviews with
          PlacementPilot.
        </p>
      </div>

      <div className="simple-page-card">

        <div className="card-icon">
          ◎
        </div>

        <h2>AI Mock Interview</h2>

        <p>
          Start a role-specific interview and receive
          feedback based on your answers.
        </p>

        <button
          className="primary-btn"
          onClick={() => {
            setActivePage("AI Assistant");

            setInput(
              "Start a mock software engineer interview for me."
            );
          }}
        >
          Start Interview →
        </button>

      </div>
    </div>
  );

 

  const renderProfile = () => (
    <div className="page">

      <div className="page-heading">
        <p className="eyebrow">
          STUDENT PROFILE
        </p>

        <h1>Profile</h1>

        <p>
          Manage your placement profile and career
          information.
        </p>
      </div>

      <div className="profile-card">

        <div className="profile-avatar">
          M
        </div>

        <div className="profile-info">

          <p className="eyebrow">
            STUDENT
          </p>

          <h2>Mohiuddin</h2>

          <p>
            Computer Science & Engineering
          </p>

          <span>
            PlacementPilot AI Student
          </span>

        </div>

      </div>

    </div>
  );

 

  const renderPage = () => {

    switch (activePage) {

      case "Dashboard":
        return renderDashboard();

      case "AI Assistant":
        return renderAssistant();

      case "Practice":
        return <Practice />;

      case "Resume":
        return <Resume />;

      case "Job Match":
        return <JobMatch />;

      case "Interview":
        return <Interview />;

      case "Profile":
        return renderProfile();

      default:
        return renderDashboard();
    }
  };

 

  return (
    <div className="app">

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="brand">

          <div className="brand-mark">
            P
          </div>

          <div>
            <h2>PlacementPilot</h2>
            <span>AI</span>
          </div>

        </div>

        <div className="sidebar-section">

          <p className="sidebar-label">
            WORKSPACE
          </p>

          <nav>

            {navigation.map(
              (item) => (
                <button
                  key={item.name}
                  className={`nav-item ${
                    activePage === item.name
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    changePage(item.name)
                  }
                >

                  <span className="nav-icon">
                    {item.icon}
                  </span>

                  <span>
                    {item.name}
                  </span>

                </button>
              )
            )}

          </nav>

        </div>

        <div className="sidebar-bottom">

          <div className="agent-status">

            <span className="status-dot" />

            <div>
              <strong>
                Agent Online
              </strong>

              <small>
                Gemini powered
              </small>
            </div>

          </div>

          <div className="sidebar-user">

            <div className="user-avatar">
              M
            </div>

            <div>
              <strong>
                Mohiuddin
              </strong>

              <small>
                Student
              </small>
            </div>

          </div>

        </div>

      </aside>

      <main className="main">

        <header className="topbar">

          <button
            className="menu-btn"
            onClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
          >
            ☰
          </button>

          <div className="topbar-page">
            {activePage}
          </div>

          <div className="topbar-right">

            <span className="online-indicator">

              <span className="status-dot" />

              Agent Online

            </span>

            <button className="notification-btn">
              ♢
            </button>

          </div>

        </header>

        {renderPage()}

      </main>

    </div>
  );
}

export default App;
