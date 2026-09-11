 import { useEffect, useMemo, useState } from "react";
import "./Practice.css";

const API_URL = "http://127.0.0.1:8000";

const starterCode = {
  Python: `import json

def solution():
    # Write your solution here
    pass


# Read input and call your solution
data = input().strip()
`,

  "C++": `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}
`,

  JavaScript: `function solution() {
    // Write your solution here
}


// Read input and call your solution
`,
};

const difficultyClass = (difficulty) => {
  const value = difficulty?.toLowerCase();

  if (value === "easy") return "easy";
  if (value === "medium") return "medium";
  if (value === "hard") return "hard";

  return "";
};

const formatValue = (value) => {
  if (value === undefined || value === null) {
    return "No data";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

function Practice() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");

  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState(starterCode.Python);

  const [activeTab, setActiveTab] = useState("description");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [completedProblems, setCompletedProblems] = useState([]);

  /* =====================================================
     LOAD PROBLEMS
  ===================================================== */

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/data/problems.json");

        if (!response.ok) {
          throw new Error("Could not load problems dataset.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid problems dataset.");
        }

        setProblems(data);

        // Keep first problem internally selected,
        // but user can search from the sidebar.
        if (data.length > 0) {
          setSelectedProblem(data[0]);
        }
      } catch (err) {
        console.error(err);

        setError(
          "Problems dataset could not be loaded. Make sure problems.json is inside frontend/public/data/"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProblems();
  }, []);

  /* =====================================================
     LOAD SAVED PROGRESS
  ===================================================== */

  useEffect(() => {
    const saved = localStorage.getItem(
      "placementpilot_completed_problems"
    );

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setCompletedProblems(parsed);
      }
    } catch {
      setCompletedProblems([]);
    }
  }, []);

  /* =====================================================
     ESCAPE FULLSCREEN
  ===================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  /* =====================================================
     TOPICS
  ===================================================== */

  const topics = useMemo(() => {
    const uniqueTopics = [
      ...new Set(
        problems
          .map((problem) => problem.topic)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueTopics.sort()];
  }, [problems]);

  /* =====================================================
     FILTER PROBLEMS
  ===================================================== */

  const filteredProblems = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return problems.filter((problem) => {
      const title =
        problem.title?.toLowerCase() || "";

      const description =
        problem.description?.toLowerCase() || "";

      const problemTopic =
        problem.topic?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        description.includes(searchValue) ||
        problemTopic.includes(searchValue);

      const matchesDifficulty =
        difficulty === "All" ||
        problem.difficulty?.toLowerCase() ===
          difficulty.toLowerCase();

      const matchesTopic =
        topic === "All" ||
        problem.topic === topic;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesTopic
      );
    });
  }, [problems, search, difficulty, topic]);

  /* =====================================================
     SELECT PROBLEM
  ===================================================== */

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setActiveTab("description");
    setRunResult(null);
    setCode(starterCode[language]);
  };

  /* =====================================================
     LANGUAGE CHANGE
  ===================================================== */

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(starterCode[newLanguage]);
    setRunResult(null);
  };

  /* =====================================================
     SAVE COMPLETED
  ===================================================== */

  const saveCompletedProblem = (problemId) => {
    const updated = [
      ...new Set([
        ...completedProblems,
        problemId,
      ]),
    ];

    setCompletedProblems(updated);

    localStorage.setItem(
      "placementpilot_completed_problems",
      JSON.stringify(updated)
    );
  };

  /* =====================================================
     RUN CODE
  ===================================================== */

  const handleRunCode = async () => {
    if (!selectedProblem) return;

    if (!code.trim()) {
      setRunResult({
        status: "error",
        message: "Please write some code first.",
      });

      return;
    }

    setIsRunning(true);
    setRunResult(null);

    try {
      const response = await fetch(
        `${API_URL}/api/practice/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problem_id: selectedProblem.id,
            language,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Code execution failed."
        );
      }

      setRunResult(data);
    } catch (err) {
      console.error(err);

      setRunResult({
        status: "error",
        message:
          err.message ||
          "Could not connect to the code execution backend.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  /* =====================================================
     SUBMIT CODE
  ===================================================== */

  const handleSubmit = async () => {
    if (!selectedProblem) return;

    if (!code.trim()) {
      setRunResult({
        status: "error",
        message: "Please write your solution first.",
      });

      return;
    }

    setIsRunning(true);
    setRunResult(null);

    try {
      const response = await fetch(
        `${API_URL}/api/practice/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problem_id: selectedProblem.id,
            language,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Submission failed."
        );
      }

      setRunResult(data);

      if (
        data.status === "accepted" ||
        data.accepted === true
      ) {
        saveCompletedProblem(selectedProblem.id);
      }
    } catch (err) {
      console.error(err);

      setRunResult({
        status: "error",
        message:
          err.message ||
          "Could not connect to the submission backend.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  /* =====================================================
     EXAMPLES
  ===================================================== */

  const renderExamples = () => {
    if (!selectedProblem?.examples) {
      return (
        <div className="empty-content">
          No examples available.
        </div>
      );
    }

    const examples = selectedProblem.examples;

    if (!Array.isArray(examples)) {
      return (
        <pre className="example-code">
          {formatValue(examples)}
        </pre>
      );
    }

    if (examples.length === 0) {
      return (
        <div className="empty-content">
          No examples available.
        </div>
      );
    }

    return examples.map((example, index) => (
      <div
        className="example-block"
        key={index}
      >
        <div className="example-title">
          <span>Example {index + 1}</span>
        </div>

        <pre className="example-code">
          {formatValue(example)}
        </pre>
      </div>
    ));
  };

  /* =====================================================
     TEST CASES
  ===================================================== */

  const renderTestCases = () => {
    const testCases =
      selectedProblem?.test_cases;

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return (
        <div className="empty-content">
          No test cases available.
        </div>
      );
    }

    return (
      <div className="test-case-list">
        {testCases.map((testCase, index) => {
          const input =
            testCase?.input ??
            testCase?.inputs ??
            "";

          const expected =
            testCase?.expected_output ??
            testCase?.output ??
            testCase?.expected ??
            "";

          return (
            <div
              className="test-case-card"
              key={index}
            >
              <div className="test-case-card-header">
                <span>
                  Test Case {index + 1}
                </span>

                <span className="test-case-badge">
                  Sample
                </span>
              </div>

              <div className="test-case-row">
                <span className="test-case-label">
                  Input
                </span>

                <pre>
                  {formatValue(input)}
                </pre>
              </div>

              <div className="test-case-row">
                <span className="test-case-label">
                  Expected Output
                </span>

                <pre>
                  {formatValue(expected)}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* =====================================================
     CONSTRAINTS
  ===================================================== */

  const renderConstraints = () => {
    if (!selectedProblem?.constraints) {
      return (
        <div className="empty-content">
          No constraints available.
        </div>
      );
    }

    const constraints =
      selectedProblem.constraints;

    if (!Array.isArray(constraints)) {
      return (
        <div className="constraint-text">
          {formatValue(constraints)}
        </div>
      );
    }

    if (constraints.length === 0) {
      return (
        <div className="empty-content">
          No constraints available.
        </div>
      );
    }

    return (
      <ul className="constraints-list">
        {constraints.map(
          (constraint, index) => (
            <li key={index}>
              {formatValue(constraint)}
            </li>
          )
        )}
      </ul>
    );
  };

  /* =====================================================
     RESULT STATUS
  ===================================================== */

  const getResultClass = () => {
    if (!runResult) return "";

    if (
      runResult.status === "accepted" ||
      runResult.accepted === true
    ) {
      return "accepted";
    }

    if (
      runResult.status === "wrong_answer"
    ) {
      return "wrong";
    }

    if (
      runResult.status === "error" ||
      runResult.status === "runtime_error"
    ) {
      return "error";
    }

    return "info";
  };

  const getResultTitle = () => {
    if (!runResult) return "";

    if (
      runResult.status === "accepted" ||
      runResult.accepted === true
    ) {
      return "Accepted";
    }

    if (
      runResult.status === "wrong_answer"
    ) {
      return "Wrong Answer";
    }

    if (
      runResult.status === "error" ||
      runResult.status === "runtime_error"
    ) {
      return "Runtime Error";
    }

    return "Execution Result";
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {
    return (
      <div className="practice-loading">
        <div className="practice-loader"></div>

        <h2>
          Loading Practice Arena
        </h2>

        <p>
          Preparing coding problems...
        </p>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="practice-page">
        <div className="practice-error">
          <div className="error-icon">
            ⚠
          </div>

          <h2>
            Dataset not found
          </h2>

          <p>{error}</p>

          <div className="dataset-path">
            frontend/public/data/problems.json
          </div>
        </div>
      </div>
    );
  }

  const isSearching =
    search.trim().length > 0;

  return (
    <div className="practice-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="practice-heading">
        <div className="practice-heading-left">
          <div className="practice-eyebrow">
            AI CODING PRACTICE
          </div>

          <h1>
            Practice Arena
          </h1>

          <p>
            Solve coding problems and improve
            your placement preparation.
          </p>
        </div>

        <div className="practice-stats">
          <div className="practice-stat">
            <strong>
              {problems.length}
            </strong>

            <span>
              Problems
            </span>
          </div>

          <div className="practice-stat">
            <strong>
              {completedProblems.length}
            </strong>

            <span>
              Solved
            </span>
          </div>

          <div className="practice-stat">
            <strong>
              {problems.length
                ? Math.round(
                    (completedProblems.length /
                      problems.length) *
                      100
                  )
                : 0}
              %
            </strong>

            <span>
              Progress
            </span>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="practice-layout">

        {/* =================================================
            PROBLEM SIDEBAR
        ================================================= */}

        <aside className="problem-sidebar">

          <div className="sidebar-header">
            <div>
              <h2>
                Problems
              </h2>

              <span>
                {isSearching
                  ? `${filteredProblems.length} result(s)`
                  : "Search to find a problem"}
              </span>
            </div>
          </div>

          {/* SEARCH */}

          <div className="problem-search">
            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {isSearching && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}
          </div>

          {/* FILTERS */}

          <div className="practice-filters">

            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Difficulty
              </option>

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>
            </select>

            <select
              value={topic}
              onChange={(event) =>
                setTopic(event.target.value)
              }
            >
              {topics.map((item) => (
                <option
                  value={item}
                  key={item}
                >
                  {item}
                </option>
              ))}
            </select>

          </div>

          {/* PROBLEM LIST */}

          <div className="problem-list">

            {!isSearching ? (
              <div className="search-prompt-state">
                <div className="prompt-icon">
                  🔎
                </div>

                <strong>
                  Search for a problem
                </strong>

                <span>
                  Type a problem name,
                  topic or keyword above.
                </span>
              </div>
            ) : filteredProblems.length === 0 ? (
              <div className="no-problems">
                <div>
                  🔍
                </div>

                <strong>
                  No problems found
                </strong>

                <span>
                  Try another keyword.
                </span>
              </div>
            ) : (
              filteredProblems.map(
                (problem) => {

                  const isSelected =
                    selectedProblem?.id ===
                    problem.id;

                  const isCompleted =
                    completedProblems.includes(
                      problem.id
                    );

                  return (
                    <button
                      type="button"
                      key={problem.id}
                      className={`problem-item ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleProblemSelect(
                          problem
                        )
                      }
                    >
                      <div className="problem-item-top">

                        <span className="problem-number">
                          #{problem.id}
                        </span>

                        {isCompleted && (
                          <span className="solved-icon">
                            ✓
                          </span>
                        )}

                      </div>

                      <div className="problem-item-title">
                        {problem.title}
                      </div>

                      <div className="problem-item-meta">

                        <span
                          className={`difficulty-badge ${difficultyClass(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>

                        <span>
                          {problem.topic ||
                            "General"}
                        </span>

                      </div>
                    </button>
                  );
                }
              )
            )}

          </div>
        </aside>

        {/* =================================================
            PROBLEM PANEL
        ================================================= */}

        <main className="problem-workspace">

          {selectedProblem ? (
            <>
              <div className="problem-header">

                <div className="problem-header-main">

                  <div className="problem-title-row">

                    <span className="problem-id">
                      #{selectedProblem.id}
                    </span>

                    <span
                      className={`difficulty-badge ${difficultyClass(
                        selectedProblem.difficulty
                      )}`}
                    >
                      {selectedProblem.difficulty}
                    </span>

                  </div>

                  <h2>
                    {selectedProblem.title}
                  </h2>

                </div>

                <span className="problem-topic">
                  {selectedProblem.topic ||
                    "General"}
                </span>

              </div>

              {/* TABS */}

              <div className="problem-tabs">

                <button
                  type="button"
                  className={
                    activeTab === "description"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "description"
                    )
                  }
                >
                  Description
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "examples"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("examples")
                  }
                >
                  Examples
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "testcases"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("testcases")
                  }
                >
                  Test Cases
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "constraints"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "constraints"
                    )
                  }
                >
                  Constraints
                </button>

              </div>

              {/* CONTENT */}

              <div className="problem-content">

                {activeTab ===
                  "description" && (
                  <section>
                    <h3>
                      Problem
                    </h3>

                    <p className="problem-description">
                      {
                        selectedProblem.description
                      }
                    </p>

                    <h3>
                      Examples
                    </h3>

                    {renderExamples()}
                  </section>
                )}

                {activeTab ===
                  "examples" && (
                  <section>
                    <h3>
                      Examples
                    </h3>

                    {renderExamples()}
                  </section>
                )}

                {activeTab ===
                  "testcases" && (
                  <section>
                    <div className="section-heading-row">
                      <div>
                        <h3>
                          Test Cases
                        </h3>

                        <p>
                          Sample inputs and expected outputs.
                        </p>
                      </div>

                      <span className="test-count">
                        {selectedProblem.test_cases
                          ?.length || 0}{" "}
                        cases
                      </span>
                    </div>

                    {renderTestCases()}
                  </section>
                )}

                {activeTab ===
                  "constraints" && (
                  <section>
                    <h3>
                      Constraints
                    </h3>

                    {renderConstraints()}
                  </section>
                )}

              </div>
            </>
          ) : (
            <div className="empty-workspace">
              <div>
                Select a problem to start coding.
              </div>
            </div>
          )}

        </main>

        {/* =================================================
            CODE PANEL
        ================================================= */}

        <section
          className={`code-panel ${
            isFullscreen
              ? "is-fullscreen"
              : ""
          }`}
        >

          {/* CODE HEADER */}

          <div className="code-header">

            <div className="editor-title">

              <div className="code-icon">
                {"</>"}
              </div>

              <div>
                <strong>
                  Code Editor
                </strong>

                <small>
                  {language} • Ready
                </small>
              </div>

            </div>

            <div className="code-header-right">

              <select
                value={language}
                onChange={(event) =>
                  handleLanguageChange(
                    event.target.value
                  )
                }
              >
                <option value="Python">
                  Python
                </option>

                <option value="C++">
                  C++
                </option>

                <option value="JavaScript">
                  JavaScript
                </option>
              </select>

              <button
                type="button"
                className="fullscreen-toggle-btn"
                onClick={() =>
                  setIsFullscreen(
                    !isFullscreen
                  )
                }
                title={
                  isFullscreen
                    ? "Exit Fullscreen"
                    : "Open Fullscreen"
                }
              >
                {isFullscreen
                  ? "✕ Exit"
                  : "⛶ Fullscreen"}
              </button>

            </div>

          </div>

          {/* EDITOR */}

          <div className="editor-wrapper">

            <div className="line-numbers">
              {code
                .split("\n")
                .map((_, index) => (
                  <span key={index}>
                    {index + 1}
                  </span>
                ))}
            </div>

            <textarea
              className="code-editor"
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              spellCheck="false"
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
            />

          </div>

          {/* RESULT */}

          {runResult && (
            <div
              className={`execution-result ${getResultClass()}`}
            >
              <div className="result-top">

                <div className="result-title">

                  <span>
                    {getResultClass() ===
                    "accepted"
                      ? "✓"
                      : getResultClass() ===
                        "wrong"
                      ? "!"
                      : getResultClass() ===
                        "error"
                      ? "✕"
                      : "ℹ"}
                  </span>

                  {getResultTitle()}

                </div>

                {runResult.passed !==
                  undefined &&
                  runResult.total !==
                    undefined && (
                    <span className="result-count">
                      {runResult.passed}/
                      {runResult.total} passed
                    </span>
                  )}

              </div>

              <p>
                {runResult.message ||
                  runResult.feedback ||
                  "Execution completed."}
              </p>

              {runResult.output !==
                undefined && (
                <div className="result-output-box">

                  <span>
                    Output
                  </span>

                  <pre>
                    {formatValue(
                      runResult.output
                    )}
                  </pre>

                </div>
              )}

              {runResult.expected_output !==
                undefined && (
                <div className="result-output-box">

                  <span>
                    Expected
                  </span>

                  <pre>
                    {formatValue(
                      runResult.expected_output
                    )}
                  </pre>

                </div>
              )}

            </div>
          )}

          {/* ACTIONS */}

          <div className="editor-actions">

            <button
              type="button"
              className="run-button"
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning
                ? "Running..."
                : "▶ Run Code"}
            </button>

            <button
              type="button"
              className="submit-button"
              onClick={handleSubmit}
              disabled={isRunning}
            >
              {isRunning
                ? "Please wait..."
                : "✓ Submit"}
            </button>

          </div>

        </section>

      </div>

      {/* AI FOOTER */}

      <div className="ai-practice-panel">

        <div className="ai-practice-icon">
          ✦
        </div>

        <div className="ai-practice-content">

          <strong>
            AI Adaptive Practice
          </strong>

          <p>
            PlacementPilot analyzes your
            coding performance and can adapt
            future practice based on your
            weak topics.
          </p>

        </div>

        <div className="ai-practice-status">
          AI Ready
        </div>

      </div>

    </div>
  );
}

export default Practice;