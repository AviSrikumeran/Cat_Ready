"""
Speech-to-text: transcribe audio to text (OpenAI Whisper).
"""
import logging
import os

from django.conf import settings

logger = logging.getLogger(__name__)


def transcribe(audio_path: str) -> str:
    """
    Transcribe audio file to text using OpenAI Whisper.
    Returns empty string if no API key or on error.
    """
    api_key = getattr(settings, "OPENAI_API_KEY", None) or os.environ.get("OPENAI_API_KEY")
    if not api_key or not api_key.strip():
        logger.warning(
            "STT skipped: OPENAI_API_KEY is not set. "
            "Add OPENAI_API_KEY=sk-... to your .env in the project root and restart the server."
        )
        return ""
    if not audio_path or not os.path.isfile(audio_path):
        logger.warning("STT skipped: no audio file at %s", audio_path)
        return ""
    if os.path.getsize(audio_path) == 0:
        logger.warning("STT skipped: audio file is empty (0 bytes) at %s", audio_path)
        return ""
    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key.strip())
        with open(audio_path, "rb") as f:
            response = client.audio.transcriptions.create(
                model=getattr(settings, "OPENAI_STT_MODEL", "whisper-1"),
                file=f,
            )
        return (response.text or "").strip()
    except Exception as e:
        logger.exception(
            "STT failed for %s: %s. Transcript will be empty.",
            audio_path,
            e,
        )
        return ""
