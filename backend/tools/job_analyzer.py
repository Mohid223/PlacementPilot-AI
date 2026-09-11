import json
import re
from typing import Optional

from services.llm_service import ask_llm


def clean_json_response(response: str) -> str:

    if not response:
        return ""

    response = response.strip()

    # Remove markdown code fences
    response = re.sub(
        r"^```json\s*",
        "",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"^```\s*",
        "",
        response,
    )

    response = re.sub(
        r"\s*```$",
        "",
        response,
    )

    # Extract JSON object
    start = response.find("{")
    end = response.rfind("}")

    if start != -1 and end != -1:
        response = response[start:end + 1]

    return response.strip()


def analyze_job(
    job_description: str,
    resume_text: Optional[str] = None
) -> dict:

    if not job_description or not job_description.strip():
        raise ValueError("Job description is required.")

    job_description = job_description.strip()

    if resume_text and resume_text.strip():

        resume_section = f"""
CANDIDATE RESUME:
{resume_text.strip()}
"""

    else:

        resume_section = """
CANDIDATE RESUME:
Not provided.
"""

    prompt = f"""
You are PlacementPilot AI, an expert career and placement assistant.

Analyze the following job description.

JOB DESCRIPTION:
{job_description}

{resume_section}

Return ONLY valid JSON using exactly this structure:

{{
  "job_role": "",
  "required_technical_skills": [],
  "preferred_technical_skills": [],
  "required_soft_skills": [],
  "experience_requirements": "",
  "education_requirements": "",
  "matched_skills": [],
  "missing_skills": [],
  "important_keywords": [],
  "resume_improvement_suggestions": [],
  "recommended_preparation_topics": [],
  "job_match_score": 0,
  "recommendation": ""
}}

Rules:

- job_match_score must be between 0 and 100.
- Do not invent information.
- Clearly separate required and preferred skills.
- If a resume is provided, compare it with the job description.
- matched_skills must contain skills found in both the resume and job requirements.
- missing_skills must contain important job skills not found in the resume.
- If no resume is provided, matched_skills and missing_skills should be empty.
- Give practical preparation recommendations.
- Keep the response concise.
- Return JSON only.
"""

    response = ask_llm(prompt)

    cleaned_response = clean_json_response(response)

    try:

        result = json.loads(cleaned_response)

    except json.JSONDecodeError as error:

        raise ValueError(
            f"AI returned invalid JSON: {error}"
        )

    if not isinstance(result, dict):

        raise ValueError(
            "AI job analysis must return a JSON object."
        )

    return result