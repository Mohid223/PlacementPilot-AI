from typing import Dict, List
import json

from services.llm_service import ask_llm


def evaluate_answers(
    questions: List[str],
    answers: List[str]
) -> Dict:

    if not questions:
        raise ValueError("Questions are required.")

    if not answers:
        raise ValueError("Answers are required.")

    prompt = f"""
You are the Evaluator Agent of PlacementPilot AI.

Evaluate the student's answers against the questions.

Questions:
{json.dumps(questions, indent=2)}

Student Answers:
{json.dumps(answers, indent=2)}

For every question:

1. Decide whether the answer is:
   - Correct
   - Partially Correct
   - Incorrect

2. Give a score from 0 to 10.
3. Give short constructive feedback.
4. Identify the topic tested.

Then calculate:
- Total score
- Maximum score
- Percentage
- Overall level
- Weak topics
- Strong topics
- Overall feedback

Level rules:
- 80% or above = Strong
- 60% to 79% = Moderate
- Below 60% = Needs Improvement

Return ONLY valid JSON.

Use exactly this structure:

{{
    "questions": [
        {{
            "question": "question text",
            "answer": "student answer",
            "topic": "topic",
            "result": "Correct",
            "score": 10,
            "feedback": "short feedback"
        }}
    ],
    "total_score": 0,
    "maximum_score": 0,
    "percentage": 0,
    "level": "Strong",
    "weak_topics": [],
    "strong_topics": [],
    "overall_feedback": "feedback"
}}

Do not invent information.
Evaluate only what the student actually answered.
"""

    result = ask_llm(prompt)

    # Remove Markdown code fences if Gemini adds them
    result = result.strip()

    if result.startswith("```"):
        result = result.replace("```json", "", 1)
        result = result.replace("```", "", 1)
        result = result.strip()

    try:
        return json.loads(result)

    except json.JSONDecodeError:
        return {
            "error": "Evaluator returned invalid JSON.",
            "raw_response": result
        }