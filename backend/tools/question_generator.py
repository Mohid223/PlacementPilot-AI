from typing import Optional
from services.llm_service import ask_llm


def generate_questions(
    topic: str,
    number_of_questions: int = 5,
    difficulty: str = "medium",
    user_request: Optional[str] = None
) -> str:

    if not topic or not topic.strip():
        raise ValueError("Topic is required.")

    if number_of_questions < 1:
        raise ValueError("Number of questions must be at least 1.")

    topic = topic.strip()
    difficulty = difficulty.strip()

    if user_request:
        request = user_request.strip()
    else:
        request = (
            f"Generate {number_of_questions} "
            f"{difficulty} interview questions about {topic}."
        )

    prompt = f"""
You are PlacementPilot AI, an expert placement preparation assistant.

Topic:
{topic}

Number of questions:
{number_of_questions}

Difficulty:
{difficulty}

Student request:
{request}

TASK:
Generate exactly {number_of_questions} questions.

IMPORTANT RULES:
- Generate exactly {number_of_questions} questions.
- Number them sequentially from 1 to {number_of_questions}.
- Do not generate fewer questions.
- Do not generate extra questions.
- Do not repeat questions.
- Do not show reasoning or analysis.
- Do not add an introduction.
- Do not add a conclusion.
- Keep questions relevant to the topic.
- Match the requested difficulty.

For each question provide:

Question:
<question>

Answer:
<correct answer>

Explanation:
<short explanation>

If the topic is programming:
- Include code only when it is useful.
- Keep code correct and interview-relevant.

If the student mentions a company or job role:
- Adapt the questions to that company or role.

The final response must contain ONLY the questions,
answers, and short explanations.
"""

    return ask_llm(prompt)