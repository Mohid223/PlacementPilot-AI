from typing import Dict


def adapt_next_action(evaluation: Dict) -> Dict:

    if not evaluation:
        raise ValueError("Evaluation result is required.")

    score = evaluation.get(
        "percentage",
        evaluation.get("score", 0)
    )

    weak_topics = evaluation.get("weak_topics", [])

    if score >= 80:

        level = "advanced"
        next_action = "Generate advanced questions"
        reason = "Student performed strongly."

    elif score >= 60:

        level = "intermediate"
        next_action = "Generate medium-difficulty questions"
        reason = "Student has a reasonable understanding but needs more practice."

    else:

        level = "beginner"
        next_action = "Revise fundamentals and generate easy questions"
        reason = "Student needs improvement in the fundamentals."

    return {
        "level": level,
        "next_action": next_action,
        "reason": reason,
        "weak_topics": weak_topics
    }