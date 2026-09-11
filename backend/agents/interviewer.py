from typing import Dict, List


def start_interview(
    role: str,
    difficulty: str = "medium"
) -> Dict:
    """
    Start an adaptive mock interview.
    """

    if not role or not role.strip():
        raise ValueError("Interview role is required.")

    return {
        "role": role.strip(),
        "difficulty": difficulty,
        "status": "started",
        "message": (
            f"Your {difficulty} level {role} mock interview has started."
        ),
        "current_question": None,
        "questions_asked": 0,
        "score": 0
    }


def evaluate_interview_answer(
    question: str,
    answer: str
) -> Dict:
    """
    Evaluate an interview answer.
    Detailed evaluation will be handled by the LLM API later.
    """

    if not question:
        raise ValueError("Question is required.")

    if not answer:
        raise ValueError("Answer is required.")

    answer_length = len(answer.strip())

    if answer_length >= 100:
        score = 8
        feedback = "Good explanation. Try to make your answer more precise."
    elif answer_length >= 50:
        score = 6
        feedback = "Reasonable answer. Add more technical details."
    else:
        score = 4
        feedback = "Answer is too short. Explain your reasoning with an example."

    return {
        "score": score,
        "max_score": 10,
        "feedback": feedback,
        "answer_length": answer_length
    }


def get_next_question(
    previous_score: int
) -> Dict:
    """
    Select the next difficulty based on the previous answer.
    """

    if previous_score >= 8:
        difficulty = "hard"

    elif previous_score >= 6:
        difficulty = "medium"

    else:
        difficulty = "easy"

    return {
        "next_difficulty": difficulty,
        "action": f"Generate a {difficulty} level interview question."
    }