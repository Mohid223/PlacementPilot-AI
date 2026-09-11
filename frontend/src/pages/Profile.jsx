import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  Plus,
  X,
  Save,
  Edit3,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import "./Profile.css";

const API_BASE = "http://127.0.0.1:8000";

const defaultProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  university: "",
  degree: "",
  graduation_year: "",
  cgpa: "",
  github: "",
  linkedin: "",
  portfolio: "",
  target_role: "Software Engineer",
  about: "",
  skills: [],
};

function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [newSkill, setNewSkill] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load profile.");
      }

      setProfile({
        ...defaultProfile,
        ...data,
        skills: Array.isArray(data.skills) ? data.skills : [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    const skill = newSkill.trim();

    if (!skill) return;

    const alreadyExists = profile.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setNewSkill("");
      return;
    }

    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const saveProfile = async () => {
    if (!token) {
      setError("Please login first.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        phone: profile.phone,
        location: profile.location,
        university: profile.university,
        degree: profile.degree,
        graduation_year: profile.graduation_year,
        cgpa:
          profile.cgpa === "" || profile.cgpa === null
            ? null
            : Number(profile.cgpa),
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        target_role: profile.target_role,
        about: profile.about,
        skills: profile.skills,
      };

      const response = await fetch(`${API_BASE}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save profile.");
      }

      setProfile((prev) => ({
        ...prev,
        ...data,
        skills: Array.isArray(data.skills) ? data.skills : prev.skills,
      }));

      setEditing(false);
      setMessage("Profile updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.location,
      profile.university,
      profile.degree,
      profile.graduation_year,
      profile.cgpa,
      profile.target_role,
      profile.about,
      profile.github,
      profile.linkedin,
    ];

    const filled = fields.filter(
      (value) => value !== undefined && value !== null && String(value).trim()
    ).length;

    let score = Math.round((filled / fields.length) * 90);

    if (profile.skills.length > 0) {
      score += 10;
    }

    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 className="loading-icon" size={32} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-header">
        <div>
          <p className="profile-eyebrow">YOUR PROFILE</p>
          <h1>Profile</h1>
          <p className="profile-subtitle">
            Manage your career information and build your placement profile.
          </p>
        </div>

        <button
          className={editing ? "cancel-btn" : "edit-btn"}
          onClick={() => {
            setEditing(!editing);
            setError("");
            setMessage("");
          }}
        >
          {editing ? (
            <>
              <X size={17} />
              Cancel
            </>
          ) : (
            <>
              <Edit3 size={17} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="success-message">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Profile Overview */}
      <div className="profile-overview">

        <div className="avatar">
          {profile.name
            ? profile.name.charAt(0).toUpperCase()
            : "U"}
        </div>

        <div className="overview-info">
          <h2>{profile.name || "Your Name"}</h2>
          <p>{profile.target_role || "Software Engineer"}</p>

          <div className="overview-email">
            <Mail size={15} />
            {profile.email || "your.email@example.com"}
          </div>
        </div>

        <div className="completion-box">
          <div className="completion-top">
            <span>Profile Completion</span>
            <strong>{calculateCompletion()}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${calculateCompletion()}%` }}
            />
          </div>

          <p>
            Complete your profile to improve job matching.
          </p>
        </div>
      </div>

      <div className="profile-grid">

        {/* Personal Information */}
        <section className="profile-card">
          <div className="card-title">
            <div className="title-icon">
              <User size={19} />
            </div>

            <div>
              <h3>Personal Information</h3>
              <p>Your basic personal details</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon">
                <User size={17} />
                <input
                  value={profile.name}
                  disabled
                  placeholder="Full name"
                />
              </div>
              <small>Name is managed from your account.</small>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-icon">
                <Mail size={17} />
                <input
                  value={profile.email}
                  disabled
                  placeholder="Email"
                />
              </div>
              <small>Email is managed from your account.</small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <div className="input-icon">
                <Phone size={17} />
                <input
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <div className="input-icon">
                <MapPin size={17} />
                <input
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="City, State"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Education */}
        <section className="profile-card">
          <div className="card-title">
            <div className="title-icon">
              <GraduationCap size={19} />
            </div>

            <div>
              <h3>Education</h3>
              <p>Your academic background</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group full">
              <label>University</label>
              <div className="input-icon">
                <GraduationCap size={17} />
                <input
                  name="university"
                  value={profile.university || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="University name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Degree</label>
              <input
                name="degree"
                value={profile.degree || ""}
                onChange={handleChange}
                disabled={!editing}
                placeholder="B.Tech Computer Science"
              />
            </div>

            <div className="form-group">
              <label>Graduation Year</label>
              <input
                name="graduation_year"
                value={profile.graduation_year || ""}
                onChange={handleChange}
                disabled={!editing}
                placeholder="2027"
              />
            </div>

            <div className="form-group">
              <label>CGPA</label>
              <input
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa ?? ""}
                onChange={handleChange}
                disabled={!editing}
                placeholder="8.07"
              />
            </div>

          </div>
        </section>

        {/* Career */}
        <section className="profile-card">
          <div className="card-title">
            <div className="title-icon">
              <Briefcase size={19} />
            </div>

            <div>
              <h3>Career Preferences</h3>
              <p>Tell PlacementPilot what you're targeting</p>
            </div>
          </div>

          <div className="form-group">
            <label>Target Role</label>

            <select
              name="target_role"
              value={profile.target_role || ""}
              onChange={handleChange}
              disabled={!editing}
            >
              <option>Software Engineer</option>
              <option>Python Developer</option>
              <option>Machine Learning Engineer</option>
              <option>Data Scientist</option>
              <option>Data Science</option>
              <option>Backend Developer</option>
              <option>Frontend Developer</option>
            </select>
          </div>
        </section>

        {/* Skills */}
        <section className="profile-card">
          <div className="card-title">
            <div className="title-icon">
              <Briefcase size={19} />
            </div>

            <div>
              <h3>Technical Skills</h3>
              <p>Add technologies and areas you're comfortable with</p>
            </div>
          </div>

          <div className="skills-container">

            <div className="skill-list">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <span className="skill-tag" key={skill}>
                    {skill}

                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="empty-skills">
                  No skills added yet.
                </p>
              )}
            </div>

            {editing && (
              <div className="add-skill">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. Python"
                />

                <button type="button" onClick={addSkill}>
                  <Plus size={17} />
                  Add
                </button>
              </div>
            )}

          </div>
        </section>

        {/* About */}
        <section className="profile-card full-width-card">
          <div className="card-title">
            <div className="title-icon">
              <User size={19} />
            </div>

            <div>
              <h3>About Me</h3>
              <p>Short professional introduction</p>
            </div>
          </div>

          <textarea
            name="about"
            value={profile.about || ""}
            onChange={handleChange}
            disabled={!editing}
            rows="5"
            placeholder="Write a short introduction about yourself..."
          />
        </section>

        {/* Links */}
        <section className="profile-card full-width-card">
          <div className="card-title">
            <div className="title-icon">
              <Globe size={19} />
            </div>

            <div>
              <h3>Professional Links</h3>
              <p>Connect your online profiles</p>
            </div>
          </div>

          <div className="links-grid">

            <div className="form-group">
              <label>GitHub</label>

              <div className="input-icon">
                <Github size={17} />
                <input
                  name="github"
                  value={profile.github || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div className="form-group">
              <label>LinkedIn</label>

              <div className="input-icon">
                <Linkedin size={17} />
                <input
                  name="linkedin"
                  value={profile.linkedin || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Portfolio</label>

              <div className="input-icon">
                <Globe size={17} />
                <input
                  name="portfolio"
                  value={profile.portfolio || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Save */}
      {editing && (
        <div className="save-area">
          <button
            className="save-profile-btn"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}

export default Profile;