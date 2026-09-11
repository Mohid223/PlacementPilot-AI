from tools.question_generator import generate_questions
from tools.job_analyzer import analyze_job
from tools.resume_parser import analyze_resume
from services.llm_service import ask_llm

from agents.evaluator import evaluate_answers
from agents.adaptive_agent import adapt_next_action


def execute_tool(tool: str, action: str, user_request: str, **kwargs):

    # --------------------------------
    # QUESTION GENERATOR
    # --------------------------------
    if tool == "question_generator":

        return generate_questions(
            topic=kwargs.get("topic", "general placement"),
            number_of_questions=kwargs.get("number_of_questions", 5),
            difficulty=kwargs.get("difficulty", "medium"),
            user_request=user_request
        )

    # --------------------------------
    # JOB ANALYZER
    # --------------------------------
    elif tool == "job_analyzer":

        return analyze_job(
            job_description=kwargs.get(
                "job_description",
                user_request
            ),
            resume_text=kwargs.get("resume_text")
        )

    # --------------------------------
    # RESUME ANALYZER
    # --------------------------------
    elif tool == "resume_parser":

        resume_text = kwargs.get("resume_text")

        if not resume_text:
            return "Resume text is required for analysis."

        return analyze_resume(resume_text)

    # --------------------------------
    # EVALUATOR
    # --------------------------------
    elif tool == "evaluator":

        questions = kwargs.get("questions", [])
        answers = kwargs.get("answers", [])

        return evaluate_answers(
            questions=questions,
            answers=answers
        )

    # --------------------------------
    # ADAPTIVE AGENT
    # --------------------------------
    elif tool == "adaptive_agent":

        evaluation = kwargs.get("evaluation")

        if not evaluation:
            return "Evaluation result is required."

        return adapt_next_action(evaluation)

    # --------------------------------
    # GENERAL LLM
    # --------------------------------
    elif tool == "llm":

        return ask_llm(user_request)

    # --------------------------------
    # UNKNOWN TOOL
    # --------------------------------
    else:

        raise ValueError(
            f"Unknown tool: {tool}"
        )