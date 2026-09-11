import json
import re
import urllib.request
import urllib.error
import os

from dotenv import load_dotenv


# Load environment variables
load_dotenv()

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434/api/chat"
)

MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen3:4b"
)


def clean_answer(text: str) -> str:
    if not text:
        return ""

    # Remove <think>...</think> blocks
    text = re.sub(
        r"<think>.*?</think>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Remove remaining think tags
    text = re.sub(
        r"</?think>",
        "",
        text,
        flags=re.IGNORECASE
    )

    # Remove common reasoning prefixes
    text = re.sub(
        r"^(analysis|reasoning|final answer)\s*:\s*",
        "",
        text.strip(),
        flags=re.IGNORECASE
    )

    # Remove Markdown code fences
    text = re.sub(
        r"```(?:text|markdown)?",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = text.replace("```", "")

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:
        return ""

    # Extract numbered items
    numbered_items = []

    for line in lines:
        match = re.match(
            r"^\d+[\.\)]\s+(.+)$",
            line
        )

        if match:
            numbered_items.append(
                match.group(1).strip()
            )

    # Renumber correctly
    if numbered_items:
        return "\n".join(
            f"{index}. {item}"
            for index, item in enumerate(
                numbered_items,
                start=1
            )
        )

    return "\n".join(lines).strip()


def ask_llm(prompt: str) -> str:

    if not prompt or not prompt.strip():
        raise ValueError("Prompt is required.")

    system_prompt = """
You are PlacementPilot AI.

Answer the user's request directly.

Rules:
- Give ONLY the final answer.
- Do NOT show reasoning.
- Do NOT show analysis.
- Do NOT mention instructions.
- Do NOT mention prompts.
- Do NOT mention internal thinking.
- Do NOT explain your selection.
- Do NOT add introductory text.
- Do NOT add a conclusion.
- If the user asks for one question, return exactly one question.
- If the user asks for multiple questions, return only the requested questions.
- Follow the requested number exactly.
- Do not provide answers unless the user asks for answers.
- Do not repeat questions.
- /no_think
"""

    data = {
        "model": MODEL,

        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": prompt.strip() + "\n/no_think"
            }
        ],

        "stream": False,

        # Disable thinking
        "think": False,

        "options": {
            "num_predict": 2000,
            "temperature": 0.1
        }
    }

    request = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(data).encode("utf-8"),
        headers={
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:

        with urllib.request.urlopen(
            request,
            timeout=300
        ) as response:

            result = json.loads(
                response.read().decode("utf-8")
            )

        message = result.get("message", {})

        # Only use final visible content
        answer = message.get("content", "")

        if not answer:
            return "Ollama returned an empty response."

        answer = clean_answer(answer)

        if not answer:
            return "No final answer was generated."

        return answer

    except urllib.error.URLError as error:

        return (
            f"Ollama connection error: {error}"
        )

    except TimeoutError:

        return (
            "Ollama request timed out. "
            "Please try again."
        )

    except json.JSONDecodeError:

        return (
            "Invalid JSON response received "
            "from Ollama."
        )

    except Exception as error:

        return f"Ollama error: {error}"