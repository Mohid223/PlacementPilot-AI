import subprocess
import tempfile
import shutil
import time

from pathlib import Path


# Maximum execution time for one test case
TIME_LIMIT_SECONDS = 3


SUPPORTED_LANGUAGES = {
    "Python",
    "C++",
    "JavaScript",
}


def execute_code(
    language: str,
    code: str,
    stdin_data: str = "",
):
    """
    Execute student code with a time limit.

    Supported:
    - Python
    - C++
    - JavaScript
    """

    if language not in SUPPORTED_LANGUAGES:
        return {
            "success": False,
            "status": "error",
            "message": f"Unsupported language: {language}",
            "stdout": "",
            "stderr": "",
            "runtime_ms": 0,
        }

    if not code or not code.strip():
        return {
            "success": False,
            "status": "error",
            "message": "Code cannot be empty.",
            "stdout": "",
            "stderr": "",
            "runtime_ms": 0,
        }

    temp_dir = tempfile.mkdtemp(
        prefix="placementpilot_"
    )

    try:

        if language == "Python":
            return execute_python(
                code,
                stdin_data,
                temp_dir,
            )

        elif language == "C++":
            return execute_cpp(
                code,
                stdin_data,
                temp_dir,
            )

        elif language == "JavaScript":
            return execute_javascript(
                code,
                stdin_data,
                temp_dir,
            )

    finally:

        shutil.rmtree(
            temp_dir,
            ignore_errors=True,
        )


# ==========================================
# PYTHON
# ==========================================

def execute_python(
    code: str,
    stdin_data: str,
    temp_dir: str,
):

    file_path = (
        Path(temp_dir) / "solution.py"
    )

    file_path.write_text(
        code,
        encoding="utf-8",
    )

    return run_process(
        [
            "python",
            str(file_path),
        ],
        stdin_data,
    )


# ==========================================
# C++
# ==========================================

def execute_cpp(
    code: str,
    stdin_data: str,
    temp_dir: str,
):

    source_path = (
        Path(temp_dir) / "solution.cpp"
    )

    executable_path = (
        Path(temp_dir) / "solution.exe"
    )

    source_path.write_text(
        code,
        encoding="utf-8",
    )

    compile_result = run_process(
        [
            "g++",
            str(source_path),
            "-std=c++17",
            "-O2",
            "-o",
            str(executable_path),
        ],
        "",
    )

    if not compile_result["success"]:

        return {
            "success": False,
            "status": "compile_error",
            "message": "C++ compilation failed.",
            "stdout": compile_result["stdout"],
            "stderr": compile_result["stderr"],
            "runtime_ms": compile_result["runtime_ms"],
        }

    return run_process(
        [
            str(executable_path),
        ],
        stdin_data,
    )


# ==========================================
# JAVASCRIPT
# ==========================================

def execute_javascript(
    code: str,
    stdin_data: str,
    temp_dir: str,
):

    file_path = (
        Path(temp_dir) / "solution.js"
    )

    file_path.write_text(
        code,
        encoding="utf-8",
    )

    return run_process(
        [
            "node",
            str(file_path),
        ],
        stdin_data,
    )


# ==========================================
# PROCESS RUNNER
# ==========================================

def run_process(
    command,
    stdin_data: str,
):

    start_time = time.perf_counter()

    try:

        process = subprocess.run(
            command,
            input=stdin_data,
            text=True,
            capture_output=True,
            timeout=TIME_LIMIT_SECONDS,
            shell=False,
        )

        runtime_ms = round(
            (
                time.perf_counter()
                - start_time
            )
            * 1000,
            2,
        )

        stdout = (
            process.stdout or ""
        ).strip()

        stderr = (
            process.stderr or ""
        ).strip()

        # Program crashed
        if process.returncode != 0:

            return {
                "success": False,
                "status": "runtime_error",
                "message": (
                    stderr
                    or "Program exited with an error."
                ),
                "stdout": stdout,
                "stderr": stderr,
                "runtime_ms": runtime_ms,
            }

        return {
            "success": True,
            "status": "executed",
            "message": "Code executed successfully.",
            "stdout": stdout,
            "stderr": stderr,
            "runtime_ms": runtime_ms,
        }

    except subprocess.TimeoutExpired:

        runtime_ms = round(
            (
                time.perf_counter()
                - start_time
            )
            * 1000,
            2,
        )

        return {
            "success": False,
            "status": "timeout",
            "message": (
                "Time limit exceeded. "
                f"Maximum allowed time is "
                f"{TIME_LIMIT_SECONDS} seconds."
            ),
            "stdout": "",
            "stderr": "",
            "runtime_ms": runtime_ms,
        }

    except FileNotFoundError as error:

        return {
            "success": False,
            "status": "environment_error",
            "message": (
                "Required compiler/runtime "
                f"was not found: {error}"
            ),
            "stdout": "",
            "stderr": str(error),
            "runtime_ms": 0,
        }

    except Exception as error:

        return {
            "success": False,
            "status": "error",
            "message": str(error),
            "stdout": "",
            "stderr": str(error),
            "runtime_ms": 0,
        }