import json
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR.parent
    / "frontend"
    / "public"
    / "data"
    / "problems.json"
)


def load_problems():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Problems dataset not found: {DATASET_PATH}"
        )

    with open(DATASET_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("problems.json must contain a JSON list.")

    return data


def get_all_problems():
    return load_problems()


def get_problem_by_id(problem_id: int):
    problems = load_problems()

    for problem in problems:
        try:
            if int(problem.get("id")) == problem_id:
                return problem
        except (TypeError, ValueError):
            continue

    return None

def get_all_coding_problems():
    """
    Return all coding problems from problems.json.
    """
    return PROBLEMS

def parse_examples(problem):
    examples = problem.get("examples", [])

    if not isinstance(examples, list):
        return []

    normalized = []

    for index, example in enumerate(examples, start=1):

        if isinstance(example, dict):

            input_data = example.get("input", "")
            output_data = example.get(
                "output",
                example.get("expected_output", "")
            )

            normalized.append({
                "id": index,
                "input": input_data,
                "output": output_data
            })

        else:
            normalized.append({
                "id": index,
                "input": "",
                "output": str(example)
            })

    return normalized


def parse_test_cases(problem):
    test_cases = problem.get("test_cases", [])

    if not isinstance(test_cases, list):
        return []

    normalized = []

    for index, test_case in enumerate(test_cases, start=1):

        if not isinstance(test_case, dict):
            continue

        input_data = test_case.get(
            "input",
            test_case.get("inputs", "")
        )

        expected_output = test_case.get(
            "expected_output",
            test_case.get(
                "output",
                test_case.get("expected", "")
            )
        )

        normalized.append({
            "id": index,
            "input": input_data,
            "expected_output": expected_output
        })

    return normalized


def serialize_input(value: Any) -> str:
    """
    Convert structured dataset input into JSON text.

    Example:

    {
        "k": 1,
        "target_sum": 7
    }

    becomes:

    {"k":1,"target_sum":7}
    """

    if value is None:
        return ""

    if isinstance(value, str):
        return value

    try:
        return json.dumps(
            value,
            ensure_ascii=False
        )
    except Exception:
        return str(value)


def normalize_output(value: Any) -> str:

    if value is None:
        return ""

    if isinstance(value, bool):
        return "true" if value else "false"

    if isinstance(value, (dict, list)):

        try:
            return json.dumps(
                value,
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":")
            )
        except Exception:
            return str(value).strip()

    return str(value).strip()


def compare_output(actual, expected) -> bool:

    actual_text = normalize_output(actual)
    expected_text = normalize_output(expected)

    # Exact match
    if actual_text == expected_text:
        return True

    # JSON comparison
    try:

        actual_json = json.loads(actual_text)
        expected_json = json.loads(expected_text)

        return actual_json == expected_json

    except Exception:
        pass

    # Numeric comparison
    try:

        return (
            abs(
                float(actual_text)
                - float(expected_text)
            )
            < 1e-9
        )

    except Exception:
        pass

    return False


def calculate_score(passed: int, total: int):

    if total <= 0:
        return 0

    return round(
        (passed / total) * 100
    )


def get_problem_summary(problem):

    examples = parse_examples(problem)
    test_cases = parse_test_cases(problem)

    return {
        "id": problem.get("id"),
        "title": problem.get("title", ""),
        "description": problem.get(
            "description",
            ""
        ),
        "difficulty": problem.get(
            "difficulty",
            "Medium"
        ),
        "topic": problem.get(
            "topic",
            "General"
        ),
        "examples": examples,
        "constraints": problem.get(
            "constraints",
            []
        ),
        "test_case_count": len(test_cases)
    }


def get_coding_problem(problem):

    """
    Convert raw Kaggle problem into the
    format required by PlacementPilot.
    """

    if not problem:
        return None

    examples = parse_examples(problem)
    test_cases = parse_test_cases(problem)

    return {
        "id": problem.get("id"),

        "title": problem.get(
            "title",
            "Untitled Problem"
        ),

        "description": problem.get(
            "description",
            ""
        ),

        "difficulty": problem.get(
            "difficulty",
            "Medium"
        ),

        "topic": problem.get(
            "topic",
            "General"
        ),

        "examples": examples,

        "constraints": problem.get(
            "constraints",
            []
        ),

        "test_cases": test_cases,

        "test_case_count": len(test_cases),

        "supported_languages": [
            "Python",
            "C++",
            "JavaScript"
        ],

        "starter_code": {
            "Python": (
                "def solution():\n"
                "    # Write your solution here\n"
                "    pass\n"
            ),

            "C++": (
                "#include <bits/stdc++.h>\n"
                "using namespace std;\n\n"
                "int main() {\n"
                "    // Write your solution here\n"
                "    return 0;\n"
                "}\n"
            ),

            "JavaScript": (
                "function solution() {\n"
                "    // Write your solution here\n"
                "}\n"
            )
        }
    }