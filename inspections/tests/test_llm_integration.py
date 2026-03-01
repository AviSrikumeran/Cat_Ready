"""
Integration tests: real LLM + vision with project images and fake audio transcripts.

Requires OPENAI_API_KEY in the environment (or .env). Skips all tests when not set.
Uses images from the project root images/ folder (e.g. HackIL26 Pass/Fail).
"""
import os
import tempfile
from unittest import skipIf
from unittest.mock import patch

from django.conf import settings
from django.test import TestCase

from inspections.services import process_step
from inspections.tests.helpers import list_project_images

# Skip entire module when no API key (avoid charging or failing in CI)
OPENAI_KEY = getattr(settings, "OPENAI_API_KEY", None) or os.environ.get("OPENAI_API_KEY")
SKIP_MSG = "OPENAI_API_KEY not set; set it to run LLM/vision integration tests"


@skipIf(not OPENAI_KEY, SKIP_MSG)
class LLMIntegrationTestCase(TestCase):
    """Call real vision + LLM with real images and fake transcripts."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._image_paths = [str(p) for p in list_project_images()]

    def _get_one_image_path(self):
        if not self._image_paths:
            self.skipTest("No images in project images/ folder")
        return self._image_paths[0]

    def test_process_step_real_image_no_audio(self):
        """Real image, no audio: vision + LLM run; result is PASS/FAIL/UNSURE."""
        path = self._get_one_image_path()
        result, result_reason, log = process_step(
            audio_path=None,
            image_paths=[path],
            step_name="Tires / Tracks",
        )
        self.assertIn(result, ("PASS", "FAIL", "UNSURE"))
        self.assertIsInstance(result_reason, str)
        self.assertIn("transcript", log)
        self.assertIn("image_descriptions", log)
        self.assertIn("llm_raw", log)
        self.assertEqual(log["transcript"], "")
        self.assertGreater(len(log["image_descriptions"]), 0)
        self.assertGreater(len(log["llm_raw"]), 0)

    def test_process_step_real_image_with_fake_transcript_pass_style(self):
        """Real image + fake 'pass' transcript: STT mocked to return operator OK."""
        path = self._get_one_image_path()
        fake_transcript = "Tire looks good, no visible damage or wear."
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(b"fake audio")
            audio_path = f.name
        try:
            with patch("inspections.services.stt.transcribe", return_value=fake_transcript):
                result, result_reason, log = process_step(
                    audio_path=audio_path,
                    image_paths=[path],
                    step_name="Tires / Tracks",
                )
        finally:
            os.unlink(audio_path)
        self.assertIn(result, ("PASS", "FAIL", "UNSURE"))
        self.assertEqual(log["transcript"], fake_transcript)
        self.assertGreater(len(log["image_descriptions"]), 0)
        self.assertGreater(len(log["llm_raw"]), 0)

    def test_process_step_real_image_with_fake_transcript_concern_style(self):
        """Real image + fake 'concern' transcript: operator reports possible issue."""
        path = self._get_one_image_path()
        fake_transcript = "I see a crack in the hose and some fluid seepage."
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(b"fake audio")
            audio_path = f.name
        try:
            with patch("inspections.services.stt.transcribe", return_value=fake_transcript):
                result, result_reason, log = process_step(
                    audio_path=audio_path,
                    image_paths=[path],
                    step_name="Hydraulics",
                )
        finally:
            os.unlink(audio_path)
        self.assertIn(result, ("PASS", "FAIL", "UNSURE"))
        self.assertEqual(log["transcript"], fake_transcript)
        self.assertGreater(len(log["llm_raw"]), 0)

    def test_process_step_multiple_images_fake_transcript(self):
        """Multiple real images + fake transcript: full pipeline run."""
        if len(self._image_paths) < 2:
            self.skipTest("Need at least 2 images in project images/ folder")
        paths = self._image_paths[:2]
        fake_transcript = "Steps and handrails look secure."
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(b"fake audio")
            audio_path = f.name
        try:
            with patch("inspections.services.stt.transcribe", return_value=fake_transcript):
                result, result_reason, log = process_step(
                    audio_path=audio_path,
                    image_paths=paths,
                    step_name="Steps and handrails",
                )
        finally:
            os.unlink(audio_path)
        self.assertIn(result, ("PASS", "FAIL", "UNSURE"))
        self.assertEqual(log["transcript"], fake_transcript)
        self.assertEqual(len(log["image_descriptions"]), 2)
        self.assertGreater(len(log["llm_raw"]), 0)

    def test_process_step_no_images_fake_transcript_only(self):
        """No images, only fake transcript: LLM evaluates from operator text."""
        fake_transcript = "Battery terminals are clean, charge level good."
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(b"fake audio")
            audio_path = f.name
        try:
            with patch("inspections.services.stt.transcribe", return_value=fake_transcript):
                result, result_reason, log = process_step(
                    audio_path=audio_path,
                    image_paths=[],
                    step_name="Battery",
                )
        finally:
            os.unlink(audio_path)
        self.assertIn(result, ("PASS", "FAIL", "UNSURE"))
        self.assertEqual(log["transcript"], fake_transcript)
        self.assertEqual(log["image_descriptions"], [])
        self.assertGreater(len(log["llm_raw"]), 0)
