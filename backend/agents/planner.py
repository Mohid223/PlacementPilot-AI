import json
from services.llm_service import ask_llm


def create_plan(user_request: str) -> dict:

    if not user_request or not user_request.strip():
        raise ValueError("User request is required.")

    prompt = f"""
You are the Planner Agent of PlacementPilot AI.

Your job is to understand the student's goal and create the
best step-by-step execution plan.

Available tools:

1. resume_parser
   - Analyze a student's resume.

2. job_analyzer
   - Analyze a job description.
   - Compare a job with a resume when resume information is available.

3. question_generator
   - Generate technical questions.
   - Generate coding questions.
   - Generate MCQs.
   - Generate interview questions.
   - Generate placement practice questions.

4. evaluator
   - Evaluate student answers.

5. adaptive_agent
   - Decide the next difficulty and learning action based on evaluation.

6. llm
   - Handle general career, placement, or reasoning tasks.

Student request:
{user_request}

IMPORTANT:

Think about whether the request requires one step or multiple steps.

For simple requests:
Use one appropriate tool.

For complex requests:
Create a sequence of multiple actions.

Examples:

Request:
"Give me Python interview questions"

Plan:
question_generator

Request:
"Analyze this job description and tell me what I should prepare"

Plan:
job_analyzer → llm

Request:
"Analyze my resume and suggest interview topics"

Plan:
resume_parser → question_generator

Request:
"Evaluate my answers and then generate questions for my weak topics"

Plan:
evaluator → adaptive_agent → question_generator

The output of an earlier action may be useful for a later action.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "goal": "main goal of the student",
    "actions": [
        {{
            "step": 1,
            "tool": "tool_name",
            "action": "action_name",
            "reason": "why this step is needed"
        }},
        {{
            "step": 2,
            "tool": "tool_name",
            "action": "action_name",
            "reason": "why this step is needed"
        }}
    ]
}}

Rules:

- Use only the available tools.
- Use multiple actions when the goal requires multiple steps.
- Keep the order logical.
- Do not create unnecessary steps.
- The plan must move toward the student's actual goal.
- Never invent tools.
- Return ONLY JSON.
"""

    result = ask_llm(prompt)

    result = result.strip()

    # Remove Markdown code fences if Gemini adds them
    if result.startswith("```"):
        result = result.replace("```json", "", 1)
        result = result.replace("```", "", 1)
        result = result.strip()

    try:
        return json.loads(result)

    except json.JSONDecodeError:

        return {
            "goal": user_request,
            "actions": [
                {
                    "step": 1,
                    "tool": "llm",
                    "action": "answer_user",
                    "reason": "Planner returned invalid JSON."
                }
            ]
        }