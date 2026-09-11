from typing import List, Optional

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Depends,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models

from models import User, StudentProfile
from auth import decode_access_token

import os
import tempfile


# =========================================================
# EXISTING PROJECT IMPORTS
# =========================================================

from schemas import (
    AssistantRequest,
    SignupRequest,
    LoginRequest,
)

from auth import (
    decode_access_token,
    hash_password,
    verify_password,
    create_access_token,
)

from agents.planner import create_plan
from agents.tool_executor import execute_tool
from agents.adaptive_agent import adapt_next_action

from tools.job_analyzer import analyze_job

from tools.practice_engine import (
    get_all_problems,
    get_problem_by_id,
    get_coding_problem,
    parse_test_cases,
    compare_output,
    calculate_score,
)

from tools.resume_parser import (
    extract_text_from_file,
    analyze_resume,
)

from tools.interview_engine import (
    generate_interview_question,
    evaluate_interview_answer,
    generate_final_interview_report,
)

from services.code_executor import execute_code


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="PlacementPilot AI",
    description="Agentic AI Placement Assistant",
    version="1.0.0",
)


# =========================================================
# AUTHENTICATION
# =========================================================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Get currently logged-in user from JWT token.
    """

    token = credentials.credentials

    user_id = decode_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found.",
        )

    return user


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST SCHEMAS
# =========================================================


class PracticeCodeRequest(BaseModel):
    problem_id: int
    language: str
    code: str


class PracticeEvaluationRequest(BaseModel):
    questions: List[str]
    answers: List[str]


class JobMatchRequest(BaseModel):
    job_description: str
    resume_text: Optional[str] = None


class InterviewQuestionRequest(BaseModel):
    role: str
    difficulty: str = "Medium"
    question_number: int = 1
    previous_questions: List[str] = []
    resume_text: Optional[str] = None


class InterviewEvaluationRequest(BaseModel):
    role: str
    question: str
    answer: str


class InterviewReportRequest(BaseModel):
    role: str
    evaluations: List[dict]


# =========================================================
# ROOT
# =========================================================


@app.get("/")
def root():
    return {
        "message": "PlacementPilot AI Backend is running",
        "status": "success",
    }


# =========================================================
# HEALTH CHECK
# =========================================================


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PlacementPilot AI",
    }


# =========================================================
# USER SIGNUP
# =========================================================

@app.post("/api/auth/signup")
def signup(
    request: SignupRequest,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # VALIDATE PASSWORD
    # -----------------------------------------------------

    if not request.password or not request.password.strip():
        raise HTTPException(
            status_code=400,
            detail="Password is required.",
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters.",
        )

    # -----------------------------------------------------
    # CHECK EXISTING EMAIL
    # -----------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == request.email.lower())
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    hashed_password = hash_password(
        request.password
    )

    new_user = User(
        name=request.name.strip(),
        email=request.email.lower(),
        password=hashed_password,
        role="student",
        target_role=request.target_role or "Software Engineer",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # -----------------------------------------------------
    # CREATE EMPTY STUDENT PROFILE
    # -----------------------------------------------------

    profile = StudentProfile(
        user_id=new_user.id,
        phone="",
        location="",
        university="",
        degree="",
        graduation_year="",
        cgpa=None,
        linkedin="",
        github="",
        portfolio="",
        about="",
        skills="",
        resume_path=None,
        profile_score=0.0,
    )

    db.add(profile)
    db.commit()

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "target_role": new_user.target_role,
        },
    }
# =========================================================
# MAIN AI ASSISTANT
# =========================================================


@app.post("/api/assistant")
def assistant(request: AssistantRequest):

    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message is required.",
        )

    try:

        # -------------------------------------------------
        # STEP 1: PLANNER
        # -------------------------------------------------

        plan = create_plan(request.message)

        if not isinstance(plan, dict):
            raise HTTPException(
                status_code=500,
                detail="Planner returned invalid response.",
            )

        results = []
        previous_result = None

        # -------------------------------------------------
        # STEP 2: EXECUTE PLAN
        # -------------------------------------------------

        for action in plan.get("actions", []):

            if not isinstance(action, dict):
                continue

            tool = action.get("tool")
            action_name = action.get("action", "")

            if not tool:
                continue

            context = request.message

            if previous_result:
                context += (
                    "\n\nPrevious agent result:\n"
                    + str(previous_result)
                )

            try:

                result = execute_tool(
                    tool=tool,
                    action=action_name,
                    user_request=context,
                )

            except Exception as error:

                result = {
                    "success": False,
                    "error": str(error),
                }

            results.append(
                {
                    "tool": tool,
                    "action": action_name,
                    "result": result,
                }
            )

            previous_result = result

        # -------------------------------------------------
        # STEP 3: RESPONSE
        # -------------------------------------------------

        return {
            "success": True,
            "message": request.message,
            "plan": plan,
            "results": results,
            "agent": "PlacementPilot AI",
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Assistant error: {str(error)}",
        )


# =========================================================
# GET ALL PRACTICE PROBLEMS
# =========================================================


@app.get("/api/practice/problems")
def get_practice_problems():

    try:

        problems = get_all_problems()

        summaries = []

        for problem in problems:

            summaries.append(
                {
                    "id": problem.get("id"),
                    "title": problem.get(
                        "title",
                        "Untitled Problem",
                    ),
                    "difficulty": problem.get(
                        "difficulty",
                        "Medium",
                    ),
                    "topic": problem.get(
                        "topic",
                        "General",
                    ),
                }
            )

        return {
            "success": True,
            "count": len(summaries),
            "problems": summaries,
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load problems: {str(error)}",
        )


# =========================================================
# GET SINGLE PRACTICE PROBLEM
# =========================================================


@app.get("/api/practice/problems/{problem_id}")
def get_single_practice_problem(problem_id: int):

    try:

        problem = get_problem_by_id(problem_id)

        if not problem:

            raise HTTPException(
                status_code=404,
                detail="Practice problem not found.",
            )

        coding_problem = get_coding_problem(problem)

        return {
            "success": True,
            "problem": coding_problem,
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load problem: {str(error)}",
        )


# =========================================================
# RUN CODE
# =========================================================


@app.post("/api/practice/run")
def run_practice_code(request: PracticeCodeRequest):

    if not request.code or not request.code.strip():

        raise HTTPException(
            status_code=400,
            detail="Code cannot be empty.",
        )

    supported_languages = [
        "Python",
        "C++",
        "JavaScript",
    ]

    if request.language not in supported_languages:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported language. "
                f"Supported languages: {supported_languages}"
            ),
        )

    problem = get_problem_by_id(
        request.problem_id
    )

    if not problem:

        raise HTTPException(
            status_code=404,
            detail="Practice problem not found.",
        )

    test_cases = parse_test_cases(problem)

    if not test_cases:

        return {
            "success": False,
            "status": "no_test_cases",
            "message": "No test cases available.",
            "passed": 0,
            "total": 0,
        }

    test_case = test_cases[0]

    input_data = test_case.get(
        "input",
        "",
    )

    expected_output = test_case.get(
        "expected_output",
        "",
    )

    if isinstance(
        input_data,
        (dict, list),
    ):

        import json

        stdin_data = json.dumps(
            input_data,
            ensure_ascii=False,
        )

    elif input_data is None:

        stdin_data = ""

    else:

        stdin_data = str(input_data)

    try:

        execution = execute_code(
            language=request.language,
            code=request.code,
            stdin_data=stdin_data,
        )

    except Exception as error:

        return {
            "success": False,
            "status": "execution_error",
            "message": str(error),
            "passed": 0,
            "total": 1,
        }

    if not execution.get(
        "success",
        False,
    ):

        return {
            "success": False,
            "status": execution.get(
                "status",
                "runtime_error",
            ),
            "message": execution.get(
                "message",
                "Code execution failed.",
            ),
            "passed": 0,
            "total": 1,
            "runtime_ms": execution.get(
                "runtime_ms",
                0,
            ),
            "output": execution.get(
                "stdout",
                "",
            ),
            "error": execution.get(
                "stderr",
                "",
            ),
        }

    actual_output = execution.get(
        "stdout",
        "",
    ).strip()

    passed = compare_output(
        actual_output,
        expected_output,
    )

    if passed:

        return {
            "success": True,
            "status": "accepted",
            "message": "Sample test case passed.",
            "passed": 1,
            "total": 1,
            "runtime_ms": execution.get(
                "runtime_ms",
                0,
            ),
            "output": actual_output,
            "expected_output": expected_output,
        }

    return {
        "success": True,
        "status": "wrong_answer",
        "message": "Sample test case failed.",
        "passed": 0,
        "total": 1,
        "runtime_ms": execution.get(
            "runtime_ms",
            0,
        ),
        "output": actual_output,
        "expected_output": expected_output,
    }


# =========================================================
# SUBMIT CODE
# =========================================================


@app.post("/api/practice/submit")
def submit_practice_code(
    request: PracticeCodeRequest,
):

    if not request.code or not request.code.strip():

        raise HTTPException(
            status_code=400,
            detail="Code cannot be empty.",
        )

    supported_languages = [
        "Python",
        "C++",
        "JavaScript",
    ]

    if request.language not in supported_languages:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported language. "
                f"Supported languages: {supported_languages}"
            ),
        )

    problem = get_problem_by_id(
        request.problem_id
    )

    if not problem:

        raise HTTPException(
            status_code=404,
            detail="Practice problem not found.",
        )

    test_cases = parse_test_cases(problem)

    if not test_cases:

        return {
            "success": False,
            "status": "no_test_cases",
            "message": "No test cases available.",
            "passed": 0,
            "total": 0,
            "score": 0,
        }

    passed = 0
    total = len(test_cases)

    failed_case = None
    final_output = ""
    final_runtime = 0

    for index, test_case in enumerate(
        test_cases,
        start=1,
    ):

        input_data = test_case.get(
            "input",
            "",
        )

        expected_output = test_case.get(
            "expected_output",
            "",
        )

        if isinstance(
            input_data,
            (dict, list),
        ):

            import json

            stdin_data = json.dumps(
                input_data,
                ensure_ascii=False,
            )

        elif input_data is None:

            stdin_data = ""

        else:

            stdin_data = str(input_data)

        try:

            execution = execute_code(
                language=request.language,
                code=request.code,
                stdin_data=stdin_data,
            )

        except Exception as error:

            return {
                "success": False,
                "status": "execution_error",
                "message": str(error),
                "passed": passed,
                "total": total,
                "score": calculate_score(
                    passed,
                    total,
                ),
            }

        final_runtime = execution.get(
            "runtime_ms",
            0,
        )

        if not execution.get(
            "success",
            False,
        ):

            failed_case = {
                "test_case": index,
                "status": execution.get(
                    "status",
                    "runtime_error",
                ),
                "message": execution.get(
                    "message",
                    "Code execution failed.",
                ),
                "output": execution.get(
                    "stdout",
                    "",
                ),
                "error": execution.get(
                    "stderr",
                    "",
                ),
            }

            break

        actual_output = execution.get(
            "stdout",
            "",
        ).strip()

        final_output = actual_output

        if compare_output(
            actual_output,
            expected_output,
        ):

            passed += 1

        else:

            failed_case = {
                "test_case": index,
                "status": "wrong_answer",
                "message": "Wrong answer.",
                "output": actual_output,
                "expected_output": expected_output,
            }

            break

    score = calculate_score(
        passed,
        total,
    )

    if passed == total:

        return {
            "success": True,
            "status": "accepted",
            "message": "All test cases passed.",
            "passed": passed,
            "total": total,
            "score": score,
            "runtime_ms": final_runtime,
            "output": final_output,
            "feedback": (
                "Excellent! Your solution passed "
                "all test cases."
            ),
        }

    failure_status = "wrong_answer"

    if failed_case:

        failure_status = failed_case.get(
            "status",
            "wrong_answer",
        )

    feedback = generate_practice_feedback(
        status=failure_status,
        passed=passed,
        total=total,
    )

    return {
        "success": True,
        "status": failure_status,
        "message": (
            failed_case.get(
                "message",
                "Some test cases failed.",
            )
            if failed_case
            else "Some test cases failed."
        ),
        "passed": passed,
        "total": total,
        "score": score,
        "runtime_ms": final_runtime,
        "output": final_output,
        "failed_case": failed_case,
        "feedback": feedback,
    }


# =========================================================
# PRACTICE FEEDBACK
# =========================================================


def generate_practice_feedback(
    status: str,
    passed: int,
    total: int,
):

    if status == "accepted":

        return (
            "Great work! All test cases passed. "
            "Your solution is ready."
        )

    if status == "wrong_answer":

        return (
            f"You passed {passed} out of {total} "
            "test cases. Check your logic, edge cases, "
            "and expected output."
        )

    if status == "timeout":

        return (
            "Your code took too long to execute. "
            "Try improving the time complexity."
        )

    if status == "compile_error":

        return (
            "Your code could not be compiled. "
            "Check the syntax and compiler errors."
        )

    if status == "runtime_error":

        return (
            "Your program crashed during execution. "
            "Check array bounds, input handling, "
            "and null/invalid values."
        )

    return (
        "Your solution needs improvement. "
        "Review the code and try again."
    )


# =========================================================
# AI PRACTICE EVALUATION
# =========================================================


@app.post("/api/practice/evaluate")
def evaluate_practice(
    request: PracticeEvaluationRequest,
):

    if not request.questions:

        raise HTTPException(
            status_code=400,
            detail="Questions are required.",
        )

    if not request.answers:

        raise HTTPException(
            status_code=400,
            detail="Answers are required.",
        )

    if len(request.questions) != len(
        request.answers
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Questions and answers must "
                "have the same length."
            ),
        )

    try:

        print(
            "STEP 1: Evaluation endpoint called"
        )

        print(
            "Questions:",
            request.questions,
        )

        print(
            "Answers:",
            request.answers,
        )

        evaluation = execute_tool(
            tool="evaluator",
            action="evaluate_answers",
            user_request="Evaluate student answers",
            questions=request.questions,
            answers=request.answers,
        )

        print(
            "STEP 2: Evaluation completed"
        )

        print(
            "Evaluation:",
            evaluation,
        )

        adaptation = adapt_next_action(
            evaluation
        )

        print(
            "STEP 3: Adaptation completed"
        )

        print(
            "Adaptation:",
            adaptation,
        )

        if not isinstance(
            adaptation,
            dict,
        ):

            adaptation = {
                "level": "medium",
                "weak_topics": [],
            }

        level = adaptation.get(
            "level",
            "medium",
        )

        weak_topics = adaptation.get(
            "weak_topics",
            [],
        )

        if not isinstance(
            weak_topics,
            list,
        ):

            weak_topics = []

        if weak_topics:

            topic = weak_topics[0]

        else:

            topic = "general placement"

        next_questions = execute_tool(
            tool="question_generator",
            action="generate_adaptive_questions",
            user_request=(
                f"Generate questions for weak topic: "
                f"{topic}"
            ),
            topic=topic,
            number_of_questions=3,
            difficulty=level,
        )

        print(
            "STEP 4: Question generation completed"
        )

        return {
            "success": True,
            "evaluation": evaluation,
            "adaptation": adaptation,
            "next_questions": next_questions,
            "agent": "PlacementPilot AI",
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Evaluation Error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Practice evaluation failed: "
                f"{str(error)}"
            ),
        )


# =========================================================
# RESUME ANALYZER
# =========================================================


@app.post("/api/resume/analyze")
async def analyze_resume_endpoint(
    file: UploadFile = File(...)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Please upload a resume file.",
        )

    allowed_extensions = {
        ".pdf",
        ".docx",
    }

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF and DOCX files are supported."
            ),
        )

    temp_path = None

    try:

        file_content = await file.read()

        max_file_size = 5 * 1024 * 1024

        if len(file_content) > max_file_size:

            raise HTTPException(
                status_code=400,
                detail="Resume file must be less than 5 MB.",
            )

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension,
        ) as temp_file:

            temp_file.write(file_content)
            temp_path = temp_file.name

        resume_text = extract_text_from_file(
            temp_path
        )

        if not resume_text or len(
            resume_text.strip()
        ) < 30:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract enough text "
                    "from the resume."
                ),
            )

        analysis = analyze_resume(
            resume_text
        )

        return {
            "success": True,
            "filename": file.filename,
            "analysis": analysis,
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Resume Analysis Error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Resume analysis failed: {str(error)}"
            ),
        )

    finally:

        if (
            temp_path
            and os.path.exists(temp_path)
        ):

            os.remove(temp_path)


# =========================================================
# JOB MATCH ANALYZER
# =========================================================


@app.post("/api/job-match")
def job_match(
    request: JobMatchRequest
):

    if not request.job_description.strip():

        raise HTTPException(
            status_code=400,
            detail="Job description is required.",
        )

    try:

        result = analyze_job(
            job_description=request.job_description,
            resume_text=request.resume_text,
        )

        return {
            "success": True,
            "analysis": result,
            "agent": "PlacementPilot AI",
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        print(
            "Job Match Error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=f"Job match failed: {str(error)}",
        )


# =========================================================
# INTERVIEW QUESTION
# =========================================================


@app.post("/api/interview/question")
def interview_question(
    request: InterviewQuestionRequest
):

    if not request.role.strip():

        raise HTTPException(
            status_code=400,
            detail="Role is required.",
        )

    try:

        result = generate_interview_question(
            role=request.role,
            difficulty=request.difficulty,
            question_number=request.question_number,
            previous_questions=request.previous_questions,
            resume_text=request.resume_text,
        )

        return {
            "success": True,
            "question": result,
            "agent": "PlacementPilot AI Interviewer",
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        print(
            "Interview Question Error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Interview question generation failed: "
                f"{str(error)}"
            ),
        )


# =========================================================
# INTERVIEW EVALUATION
# =========================================================


@app.post("/api/interview/evaluate")
def interview_evaluate(
    request: InterviewEvaluationRequest
):

    if not request.question.strip():

        raise HTTPException(
            status_code=400,
            detail="Question is required.",
        )

    if not request.answer.strip():

        raise HTTPException(
            status_code=400,
            detail="Answer is required.",
        )

    try:

        result = evaluate_interview_answer(
            question=request.question,
            answer=request.answer,
            role=request.role,
        )

        return {
            "success": True,
            "evaluation": result,
            "agent": "PlacementPilot AI Evaluator",
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        print(
            "Interview Evaluation Error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Interview evaluation failed: "
                f"{str(error)}"
            ),
        )


# =========================================================
# INTERVIEW REPORT
# =========================================================


@app.post("/api/interview/report")
def interview_report(
    request: InterviewReportRequest
):

    try:

        result = generate_final_interview_report(
            role=request.role,
            evaluations=request.evaluations,
        )

        return {
            "success": True,
            "report": result,
            "agent": "PlacementPilot AI Interview Coach",
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        print(
            "Interview Report Error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Interview report generation failed: "
                f"{str(error)}"
            ),
        )
# =========================================================
# USER LOGIN
# =========================================================

@app.post("/api/auth/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == request.email.lower())
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # -----------------------------------------------------
    # VERIFY PASSWORD
    # -----------------------------------------------------

    if not verify_password(
        request.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    access_token = create_access_token(
        user.id
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "target_role": user.target_role,
        },
    }