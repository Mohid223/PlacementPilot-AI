import json
import re

from services.llm_service import ask_llm


def clean_json_response(text: str) -> dict:
    if not text:
        raise ValueError("Empty AI response.")

    # Remove thinking blocks
    text = re.sub(
        r"<think>.*?</think>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE
    )

    text = re.sub(
        r"<\|think\|>.*?<\|/think\|>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Remove markdown code fences
    text = text.replace("```json", "")
    text = text.replace("```JSON", "")
    text = text.replace("```", "").strip()

    # Find first JSON object
    start = text.find("{")

    if start == -1:
        raise ValueError(
            f"AI did not return JSON. Response: {text[:500]}"
        )

    # Extract ONLY the first complete JSON object.
    # This prevents "Extra data" when model adds text after JSON.
    depth = 0
    in_string = False
    escape = False
    end = -1

    for i in range(start, len(text)):
        char = text[i]

        if escape:
            escape = False
            continue

        if char == "\\" and in_string:
            escape = True
            continue

        if char == '"':
            in_string = not in_string
            continue

        if in_string:
            continue

        if char == "{":
            depth += 1

        elif char == "}":
            depth -= 1

            if depth == 0:
                end = i
                break

    if end == -1:
        raise ValueError(
            f"Incomplete JSON response from AI: {text[:500]}"
        )

    json_text = text[start:end + 1]

    try:
        return json.loads(json_text)

    except json.JSONDecodeError as error:
        raise ValueError(
            f"Invalid AI JSON response: {error}\n"
            f"Raw response: {json_text[:1000]}"
        )


def generate_interview_question(
    role: str,
    difficulty: str = "Medium",
    question_number: int = 1,
    previous_questions=None,
    resume_text: str = None,
):
    previous_questions = previous_questions or []

    previous_text = "\n".join(
        f"- {question}"
        for question in previous_questions
    )

    if not previous_text:
        previous_text = "None"

    resume_section = resume_text.strip() if resume_text else "Not provided."

    prompt = f"""
You are the Interviewer Agent of PlacementPilot AI.

Generate ONE realistic placement interview question.

Role:
{role}

Difficulty:
{difficulty}

Question Number:
{question_number}

Previous Questions:
{previous_text}

Candidate Resume:
{resume_section}

Return ONLY ONE JSON OBJECT.

Required JSON format:

{{
  "question": "your question here",
  "category": "Technical",
  "difficulty": "{difficulty}",
  "expected_topics": ["topic1", "topic2"]
}}

Rules:
- Generate exactly ONE question.
- Do not repeat previous questions.
- The question must be relevant to the role.
- Use Technical, HR, Behavioral, Project, or Problem Solving as category.
- Do not provide the answer.
- Do not provide explanation.
- Do not use Markdown.
- Do not write anything before or after the JSON.
"""

    raw_response = ask_llm(prompt)

    result = clean_json_response(raw_response)

    question = str(result.get("question", "")).strip()

    if not question:
        raise ValueError("AI generated an empty interview question.")

    expected_topics = result.get("expected_topics", [])

    if not isinstance(expected_topics, list):
        expected_topics = []

    return {
        "question": question,
        "category": result.get("category", "Technical"),
        "difficulty": result.get("difficulty", difficulty),
        "expected_topics": expected_topics,
    }


def evaluate_interview_answer(
    question: str,
    answer: str,
    role: str,
):
    if not question or not question.strip():
        raise ValueError("Question is required.")

    if not answer or not answer.strip():
        raise ValueError("Answer is required.")

    prompt = f"""
You are the Interview Evaluator Agent of PlacementPilot AI.

Evaluate the candidate's answer.

Role:
{role}

Question:
{question}

Candidate Answer:
{answer}

Return ONLY ONE JSON OBJECT.

Required format:

{{
  "score": 0,
  "rating": "Good",
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "improvement": "short practical improvement",
  "ideal_points": ["point1", "point2"],
  "follow_up_question": "one follow-up question"
}}

Rules:
- Score must be between 0 and 100.
- Evaluate correctness.
- Evaluate relevance.
- Evaluate clarity.
- Evaluate communication.
- Do not invent candidate experience.
- Keep feedback practical.
- Do not provide unnecessary explanation.
- Do not use Markdown.
- Do not write anything before or after the JSON.
"""

    raw_response = ask_llm(prompt)

    result = clean_json_response(raw_response)

    try:
        score = int(result.get("score", 0))
    except (TypeError, ValueError):
        score = 0

    score = max(0, min(100, score))

    strengths = result.get("strengths", [])
    weaknesses = result.get("weaknesses", [])
    ideal_points = result.get("ideal_points", [])

    if not isinstance(strengths, list):
        strengths = []

    if not isinstance(weaknesses, list):
        weaknesses = []

    if not isinstance(ideal_points, list):
        ideal_points = []

    return {
        "score": score,
        "rating": result.get("rating", "Needs Improvement"),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement": result.get("improvement", ""),
        "ideal_points": ideal_points,
        "follow_up_question": result.get(
            "follow_up_question",
            ""
        ),
    }


def generate_final_interview_report(
    role: str,
    evaluations: list,
):
    if not evaluations:
        return {
            "overall_score": 0,
            "performance": "No interview data available.",
            "strengths": [],
            "weak_areas": [],
            "recommendations": [],
        }

    scores = []

    for evaluation in evaluations:
        try:
            scores.append(int(evaluation.get("score", 0)))
        except (TypeError, ValueError):
            continue

    if scores:
        overall_score = round(sum(scores) / len(scores))
    else:
        overall_score = 0

    prompt = f"""
You are the Interview Coach Agent of PlacementPilot AI.

Create a final mock interview performance report.

Role:
{role}

Interview Evaluations:
{json.dumps(evaluations, ensure_ascii=False)}

Return ONLY ONE JSON OBJECT.

Required format:

{{
  "overall_score": {overall_score},
  "performance": "short overall performance summary",
  "strengths": ["strength1", "strength2"],
  "weak_areas": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"]
}}

Rules:
- Overall score must be between 0 and 100.
- Analyze the interview performance.
- Identify the strongest areas.
- Identify weak areas.
- Give practical recommendations.
- Do not use Markdown.
- Do not write anything before or after the JSON.
"""

    raw_response = ask_llm(prompt)

    result = clean_json_response(raw_response)

    try:
        final_score = int(result.get("overall_score", overall_score))
    except (TypeError, ValueError):
        final_score = overall_score

    final_score = max(0, min(100, final_score))

    strengths = result.get("strengths", [])
    weak_areas = result.get("weak_areas", [])
    recommendations = result.get("recommendations", [])

    if not isinstance(strengths, list):
        strengths = []

    if not isinstance(weak_areas, list):
        weak_areas = []

    if not isinstance(recommendations, list):
        recommendations = []

    return {
        "overall_score": final_score,
        "performance": result.get("performance", ""),
        "strengths": strengths,
        "weak_areas": weak_areas,
        "recommendations": recommendations,
    }