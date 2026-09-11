import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  Briefcase,
  Code2,
  Award,
  ChevronRight,
  X,
} from "lucide-react";
import "./Resume.css";

function Resume() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(pdf|doc|docx)$/i)
    ) {
      alert("Please upload a PDF, DOC or DOCX resume.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Resume size must be less than 5 MB.");
      return;
    }

    setFile(selectedFile);
    setAnalyzed(false);
  };

  const handleInputChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  const handleAnalyze = () => {
    if (!file) return;

    setAnalyzing(true);

    // Temporary frontend simulation.
    // Later this will call FastAPI resume analyzer.
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1800);
  };

  const removeFile = () => {
    setFile(null);
    setAnalyzed(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  };

  return (
    <div className="resume-page">

      {/* HEADER */}
      <div className="resume-heading">
        <div>
          <div className="resume-eyebrow">
            CAREER TOOL
          </div>

          <h1>Resume Analyzer</h1>

          <p>
            Upload your resume and get AI-powered feedback
            to improve your placement chances.
          </p>
        </div>

        <div className="resume-heading-badge">
          <Sparkles size={14} />
          AI Powered
        </div>
      </div>

      {/* MAIN UPLOAD SECTION */}
      <div className="resume-main-grid">

        {/* LEFT */}
        <section className="resume-upload-card">

          <div className="card-title">
            <div className="card-title-icon">
              <Upload size={17} />
            </div>

            <div>
              <h2>Upload your resume</h2>
              <p>PDF, DOC or DOCX • Maximum 5 MB</p>
            </div>
          </div>

          {!file ? (
            <div
              className={`resume-dropzone ${
                dragActive ? "drag-active" : ""
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleInputChange}
                hidden
              />

              <div className="upload-icon">
                <Upload size={25} />
              </div>

              <h3>
                Drop your resume here
              </h3>

              <p>
                or click to browse from your computer
              </p>

              <button
                type="button"
                className="browse-button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Resume
              </button>
            </div>
          ) : (
            <div className="uploaded-file">

              <div className="uploaded-file-icon">
                <FileText size={24} />
              </div>

              <div className="uploaded-file-info">
                <strong>
                  {file.name}
                </strong>

                <span>
                  {formatFileSize(file.size)}
                </span>
              </div>

              <button
                type="button"
                className="remove-file"
                onClick={removeFile}
              >
                <X size={16} />
              </button>

            </div>
          )}

          {file && (
            <button
              type="button"
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <span className="button-spinner" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze Resume
                </>
              )}
            </button>
          )}

          <div className="upload-security">
            <CheckCircle2 size={13} />

            <span>
              Your resume is used only for analysis
              within PlacementPilot.
            </span>
          </div>

        </section>

        {/* RIGHT */}
        <section className="resume-info-card">

          <div className="info-header">
            <div className="info-icon">
              <Target size={18} />
            </div>

            <div>
              <h2>
                What you'll get
              </h2>

              <p>
                Actionable feedback for your resume
              </p>
            </div>
          </div>

          <div className="analysis-features">

            <div className="analysis-feature">
              <div className="feature-icon blue">
                <Target size={16} />
              </div>

              <div>
                <strong>ATS Score</strong>
                <span>
                  See how well your resume performs
                  against ATS systems.
                </span>
              </div>
            </div>

            <div className="analysis-feature">
              <div className="feature-icon purple">
                <Code2 size={16} />
              </div>

              <div>
                <strong>Skills Analysis</strong>
                <span>
                  Identify your technical and
                  professional skills.
                </span>
              </div>
            </div>

            <div className="analysis-feature">
              <div className="feature-icon orange">
                <AlertCircle size={16} />
              </div>

              <div>
                <strong>Missing Skills</strong>
                <span>
                  Discover skills you should improve
                  for target roles.
                </span>
              </div>
            </div>

            <div className="analysis-feature">
              <div className="feature-icon green">
                <Briefcase size={16} />
              </div>

              <div>
                <strong>Job Match</strong>
                <span>
                  Understand which roles match your
                  current profile.
                </span>
              </div>
            </div>

          </div>

        </section>
      </div>

      {/* ANALYSIS RESULT */}
      {analyzed && (
        <section className="resume-results">

          <div className="results-header">
            <div>
              <div className="results-eyebrow">
                AI ANALYSIS COMPLETE
              </div>

              <h2>
                Resume Analysis
              </h2>

              <p>
                Here is an overview of your current
                resume quality.
              </p>
            </div>

            <div className="analysis-complete">
              <CheckCircle2 size={15} />
              Analysis Complete
            </div>
          </div>

          {/* SCORE CARDS */}
          <div className="score-grid">

            <div className="score-card main-score">
              <div className="score-card-top">
                <span>ATS Score</span>
                <Target size={16} />
              </div>

              <div className="score-number">
                78
                <small>/100</small>
              </div>

              <div className="score-progress">
                <div
                  className="score-progress-fill"
                  style={{ width: "78%" }}
                />
              </div>

              <p>
                Good resume. A few improvements
                can make it stronger.
              </p>
            </div>

            <div className="score-card">
              <div className="score-card-top">
                <span>Skills Found</span>
                <Code2 size={16} />
              </div>

              <div className="simple-number">
                12
              </div>

              <p>
                Relevant technical skills detected
              </p>
            </div>

            <div className="score-card">
              <div className="score-card-top">
                <span>Job Match</span>
                <Briefcase size={16} />
              </div>

              <div className="simple-number">
                84%
              </div>

              <p>
                Strong match for software roles
              </p>
            </div>

            <div className="score-card">
              <div className="score-card-top">
                <span>Suggestions</span>
                <Award size={16} />
              </div>

              <div className="simple-number">
                6
              </div>

              <p>
                Improvements recommended
              </p>
            </div>

          </div>

          {/* RESULTS DETAILS */}
          <div className="results-grid">

            <div className="result-detail-card">
              <div className="result-detail-heading">
                <div className="detail-heading-icon green">
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <h3>
                    Strengths
                  </h3>

                  <span>
                    Things your resume already does well
                  </span>
                </div>
              </div>

              <ul className="result-list">
                <li>
                  <CheckCircle2 size={14} />
                  Strong technical skills section
                </li>

                <li>
                  <CheckCircle2 size={14} />
                  Relevant academic projects
                </li>

                <li>
                  <CheckCircle2 size={14} />
                  Good use of programming keywords
                </li>

                <li>
                  <CheckCircle2 size={14} />
                  Clear education information
                </li>
              </ul>
            </div>

            <div className="result-detail-card">
              <div className="result-detail-heading">
                <div className="detail-heading-icon orange">
                  <AlertCircle size={16} />
                </div>

                <div>
                  <h3>
                    Improvements
                  </h3>

                  <span>
                    Recommended changes
                  </span>
                </div>
              </div>

              <ul className="result-list">
                <li>
                  <AlertCircle size={14} />
                  Add measurable project achievements
                </li>

                <li>
                  <AlertCircle size={14} />
                  Improve experience bullet points
                </li>

                <li>
                  <AlertCircle size={14} />
                  Add more role-specific keywords
                </li>

                <li>
                  <AlertCircle size={14} />
                  Keep the resume within 1–2 pages
                </li>
              </ul>
            </div>

          </div>

          {/* NEXT ACTION */}
          <div className="resume-next-action">

            <div className="next-action-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <strong>
                Ready for the next step?
              </strong>

              <p>
                Use your resume to analyze job
                descriptions and prepare for interviews.
              </p>
            </div>

            <button type="button">
              Job Match
              <ChevronRight size={15} />
            </button>

          </div>

        </section>
      )}

    </div>
  );
}

export default Resume;