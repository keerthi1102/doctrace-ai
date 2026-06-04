import json
import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompt.txt"
load_dotenv(ENV_PATH, override=True)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


def _strip_json_fence(text: str):
    text = text.strip()

    if text.startswith("```json"):
        return text.replace("```json", "", 1).removesuffix("```").strip()

    if text.startswith("```"):
        return text.replace("```", "", 1).removesuffix("```").strip()

    return text


def _get_api_key() -> str | None:
    load_dotenv(ENV_PATH, override=True)
    return os.getenv("GEMINI_API_KEY")


def _load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8").strip()


def _build_ocr_data(
    ocr_text: str,
    blocks: list[dict] | None,
    metadata: dict | None = None,
) -> dict:
    return {
        "text": ocr_text,
        "blocks": blocks or [],
        "metadata": metadata or {},
    }


class LLMExtractor:

    @staticmethod
    def extract_fields(
        ocr_text: str,
        blocks: list[dict] | None = None,
        file_bytes: bytes | None = None,
        mime_type: str | None = None,
        filename: str | None = None,
        metadata: dict | None = None,
    ) -> dict:
        api_key = _get_api_key()

        if not api_key:
            raise RuntimeError(
                "GOOGLE_API_KEY or GEMINI_API_KEY is not configured in backend/.env"
            )

        client = genai.Client(api_key=api_key)
        ocr_data = _build_ocr_data(ocr_text, blocks, metadata)
        prompt = _load_prompt()

        parts = [
            types.Part.from_text(text=prompt),
            types.Part.from_text(
                text=(
                    "OCR/Layout extraction output follows as JSON. "
                    "Return the ocr_data field exactly as this JSON object:\n"
                    f"{json.dumps(ocr_data, ensure_ascii=False)}"
                )
            ),
        ]

        if file_bytes:
            parts.insert(
                1,
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type or "application/pdf",
                ),
            )

        if filename:
            parts.insert(
                1,
                types.Part.from_text(text=f"Original uploaded filename: {filename}")
            )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=types.Content(role="user", parts=parts),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        text = _strip_json_fence(response.text)
        extracted_json = json.loads(text)

        if isinstance(extracted_json, dict):
            extracted_json["ocr_data"] = ocr_data

        return extracted_json
