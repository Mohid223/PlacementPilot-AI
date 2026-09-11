import { useState } from "react";
import "./JobMatch.css";

const API_URL = "http://127.0.0.1:8000";

const JobMatch = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeJob = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(`${API_URL}/api/job-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: jobDescription,
          resume_text: resumeText || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Job analysis failed.");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "score-high";
    if (score >= 60) return "score-medium";
    return "score-low";
  };

  return (
    <div className="job-match-page">
      <div className="job-match-header">
        <div>
          <p className="eyebrow">AI CAREER ANALYSIS</p>
          <h1>Job Match</h1>
          <p>
            Compare a job description with your skills and discover what you
            need to improve before applying.
          </p>
        </div>

        <div className="job-ai-badge">
          <span>✦</span>
          AI Powered
        </div>
      </div>

      <div className="job-match-grid">
        {/* LEFT INPUT */}
        <div className="job-input-section">
          <div className="job-card">
            <div className="card-title">
              <div>
                <h2>Job Description</h2>
                <p>Paste the complete job posting here.</p>
              </div>
              <span className="card-icon">💼</span>
            </div>

            <textarea
              className="job-textarea"
              placeholder={`Example:

We are looking for a Python Developer with knowledge of Django, REST APIs, SQL and Git.

Requirements:
• Strong Python programming
• Knowledge of Django or Flask
• SQL and MySQL
• REST API development
• Git and GitHub
• Good problem solving skills`}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <div className="character-count">
              {jobDescription.length} characters
            </div>
          </div>

          <div className="job-card">
            <div className="card-title">
              <div>
                <h2>Your Resume</h2>
                <p>
                  Optional — add resume text for a personalized match score.
                </p>
              </div>
              <span className="card-icon">📄</span>
            </div>

            <textarea
              className="job-textarea resume-input"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />

            <div className="character-count">
              {resumeText.length} characters
            </div>
          </div>

          <button
            className="analyze-job-btn"
            onClick={analyzeJob}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing Job...
              </>
            ) : (
              <>
                <span>✦</span>
                Analyze Job Match
              </>
            )}
          </button>

          {error && <div className="job-error">{error}</div>}
        </div>

        {/* RIGHT RESULTS */}
        <div className="job-results-section">
          {!analysis && !loading && (
            <div className="empty-job-state">
              <div className="empty-icon">🎯</div>
              <h2>Ready to analyze</h2>
              <p>
                Paste a job description and optionally your resume. PlacementPilot
                AI will identify your strengths, missing skills and preparation
                areas.
              </p>

              <div className="analysis-features">
                <div>
                  <span>✓</span>
                  Skill matching
                </div>
                <div>
                  <span>✓</span>
                  Missing skills
                </div>
                <div>
                  <span>✓</span>
                  Match score
                </div>
                <div>
                  <span>✓</span>
                  Preparation plan
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="empty-job-state loading-state">
              <div className="large-spinner"></div>
              <h2>Analyzing your job match...</h2>
              <p>
                PlacementPilot AI is comparing the requirements and candidate
                profile.
              </p>
            </div>
          )}

          {analysis && !loading && (
            <div className="analysis-results">
              {/* SCORE */}
              <div className="score-card">
                <div>
                  <p className="result-label">JOB MATCH SCORE</p>
                  <h2>{analysis.job_role || "Job Opportunity"}</h2>
                  <p className="score-description">
                    Based on the provided job description
                    {resumeText ? " and your resume." : "."}
                  </p>
                </div>

                <div
                  className={`score-circle ${getScoreClass(
                    analysis.job_match_score
                  )}`}
                >
                  <strong>{analysis.job_match_score}</strong>
                  <span>/100</span>
                </div>
              </div>

              {/* MATCHED / MISSING */}
              <div className="result-two-column">
                <div className="result-card">
                  <div className="result-card-header">
                    <h3>✓ Matching Skills</h3>
                    <span>{analysis.matched_skills?.length || 0}</span>
                  </div>

                  <div className="tag-container">
                    {analysis.matched_skills?.length > 0 ? (
                      analysis.matched_skills.map((skill, index) => (
                        <span className="skill-tag matched" key={index}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="no-data">No matching skills found.</p>
                    )}
                  </div>
                </div>

                <div className="result-card">
                  <div className="result-card-header">
                    <h3>⚠ Missing Skills</h3>
                    <span>{analysis.missing_skills?.length || 0}</span>
                  </div>

                  <div className="tag-container">
                    {analysis.missing_skills?.length > 0 ? (
                      analysis.missing_skills.map((skill, index) => (
                        <span className="skill-tag missing" key={index}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="no-data">No major missing skills found.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* REQUIRED SKILLS */}
              <div className="result-card">
                <div className="result-card-header">
                  <div>
                    <h3>Technical Skills Required</h3>
                    <p>Important technologies mentioned in the job.</p>
                  </div>
                </div>

                <div className="tag-container">
                  {analysis.required_technical_skills?.map(
                    (skill, index) => (
                      <span className="skill-tag technical" key={index}>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* PREFERRED SKILLS */}
              {analysis.preferred_technical_skills?.length > 0 && (
                <div className="result-card">
                  <div className="result-card-header">
                    <div>
                      <h3>Preferred Skills</h3>
                      <p>Additional skills that can improve your chances.</p>
                    </div>
                  </div>

                  <div className="tag-container">
                    {analysis.preferred_technical_skills.map(
                      (skill, index) => (
                        <span className="skill-tag preferred" key={index}>
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* REQUIREMENTS */}
              <div className="result-two-column">
                <div className="result-card">
                  <h3>🎓 Education</h3>
                  <p className="normal-result-text">
                    {analysis.education_requirements ||
                      "No specific education requirement detected."}
                  </p>
                </div>

                <div className="result-card">
                  <h3>💼 Experience</h3>
                  <p className="normal-result-text">
                    {analysis.experience_requirements ||
                      "No specific experience requirement detected."}
                  </p>
                </div>
              </div>

              {/* KEYWORDS */}
              <div className="result-card">
                <div className="result-card-header">
                  <div>
                    <h3>Important Keywords</h3>
                    <p>Useful keywords for your resume and preparation.</p>
                  </div>
                </div>

                <div className="tag-container">
                  {analysis.important_keywords?.map((keyword, index) => (
                    <span className="skill-tag keyword" key={index}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* RESUME SUGGESTIONS */}
              <div className="result-card">
                <div className="result-card-header">
                  <div>
                    <h3>📝 Resume Improvement Suggestions</h3>
                    <p>How you can improve your resume for this role.</p>
                  </div>
                </div>

                {analysis.resume_improvement_suggestions?.length > 0 ? (
                  <div className="suggestion-list">
                    {analysis.resume_improvement_suggestions.map(
                      (suggestion, index) => (
                        <div className="suggestion-item" key={index}>
                          <span>{index + 1}</span>
                          <p>{suggestion}</p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="no-data">No suggestions available.</p>
                )}
              </div>

              {/* PREPARATION */}
              <div className="result-card">
                <div className="result-card-header">
                  <div>
                    <h3>🚀 Recommended Preparation</h3>
                    <p>Topics you should focus on before the interview.</p>
                  </div>
                </div>

                {analysis.recommended_preparation_topics?.length > 0 ? (
                  <div className="preparation-list">
                    {analysis.recommended_preparation_topics.map(
                      (topic, index) => (
                        <div className="preparation-item" key={index}>
                          <div className="topic-number">{index + 1}</div>
                          <span>{topic}</span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="no-data">
                    No preparation topics generated.
                  </p>
                )}
              </div>

              {/* FINAL RECOMMENDATION */}
              {analysis.recommendation && (
                <div className="recommendation-card">
                  <div className="recommendation-icon">✦</div>
                  <div>
                    <p className="result-label">AI RECOMMENDATION</p>
                    <p>{analysis.recommendation}</p>
                  </div>
                </div>
              )}

              <button
                className="reset-job-btn"
                onClick={() => {
                  setAnalysis(null);
                  setError("");
                }}
              >
                Analyze Another Job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatch;