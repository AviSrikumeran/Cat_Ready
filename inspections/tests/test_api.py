"""
API tests for inspections: create, list, get, submit step (with and without images).
Uses in-memory images by default; optional fixtures in inspections/tests/fixtures/images/.
"""
from pathlib import Path
from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from inspections.models import Inspection, InspectionStep, StepImage
from inspections.tests.helpers import (
    get_fixture_images_dir,
    list_fixture_images,
    make_image_file,
)


# Base URL for the inspections API (matches config/urls.py)
API = "/api/inspections"


class InspectionAPITestCase(TestCase):
    """Test inspection list/create and detail endpoints."""

    def setUp(self):
        self.client = APIClient()

    def test_create_inspection_returns_201(self):
        response = self.client.post(
            f"{API}/",
            {"vehicle_id": "CAT-D6-0472"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["vehicle_id"], "CAT-D6-0472")
        self.assertIn("started_at", data)
        self.assertIsNone(data["completed_at"])

    def test_create_inspection_empty_vehicle_id_ok(self):
        response = self.client.post(f"{API}/", {}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["vehicle_id"], "")

    def test_list_inspections_returns_200(self):
        Inspection.objects.create(vehicle_id="CAT-1")
        response = self.client.get(f"{API}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        self.assertEqual(data[0]["vehicle_id"], "CAT-1")

    def test_get_inspection_detail_returns_200(self):
        insp = Inspection.objects.create(vehicle_id="CAT-2")
        response = self.client.get(f"{API}/{insp.id}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], insp.id)
        self.assertEqual(data["vehicle_id"], "CAT-2")
        self.assertEqual(data["steps"], [])

    def test_get_inspection_detail_404(self):
        response = self.client.get(f"{API}/99999/")
        self.assertEqual(response.status_code, 404)


@patch("inspections.views.process_step")
class StepCreateAPITestCase(TestCase):
    """Test step submission with mocked AI pipeline (no real OpenAI calls)."""

    def setUp(self):
        self.client = APIClient()
        self.inspection = Inspection.objects.create(vehicle_id="CAT-TEST")

    def test_submit_step_no_files_returns_200(self, process_step_mock):
        process_step_mock.return_value = (
            "PASS",
            "OK",
            {"transcript": "", "image_descriptions": [], "llm_raw": "PASS OK"},
        )
        response = self.client.post(
            f"{API}/{self.inspection.id}/steps/",
            {"step_index": 0, "step_name": "Tires"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["step_index"], 0)
        self.assertEqual(data["step_name"], "Tires")
        self.assertEqual(data["result"], "PASS")
        self.assertEqual(data["result_reason"], "OK")
        step = InspectionStep.objects.get(inspection=self.inspection, step_index=0)
        self.assertEqual(step.result, "PASS")

    def test_submit_step_requires_step_index(self, process_step_mock):
        response = self.client.post(
            f"{API}/{self.inspection.id}/steps/",
            {"step_name": "Tires"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("step_index", response.json().get("detail", ""))

    def test_submit_step_invalid_step_index_returns_400(self, process_step_mock):
        response = self.client.post(
            f"{API}/{self.inspection.id}/steps/",
            {"step_index": "not_a_number", "step_name": "Tires"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 400)

    def test_submit_step_nonexistent_inspection_returns_404(self, process_step_mock):
        response = self.client.post(
            f"{API}/99999/steps/",
            {"step_index": 0, "step_name": "Tires"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 404)

    def test_submit_step_with_one_image_returns_200(self, process_step_mock):
        process_step_mock.return_value = (
            "PASS",
            "No damage seen.",
            {"transcript": "", "image_descriptions": ["Tire tread visible."], "llm_raw": "PASS No damage seen."},
        )
        img = make_image_file("tire.jpg")
        data = {"step_index": 0, "step_name": "Tires", "images": img}
        response = self.client.post(
            f"{API}/{self.inspection.id}/steps/",
            data,
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)
        step = InspectionStep.objects.get(inspection=self.inspection, step_index=0)
        self.assertEqual(step.step_name, "Tires")
        self.assertEqual(step.images.count(), 1)


class StepCreateWithImageFilesTestCase(TestCase):
    """
    Test step submission with real image file uploads.
    Uses in-memory PNG/JPEG; optional: add images to inspections/tests/fixtures/images/.
    """

    def setUp(self):
        self.client = APIClient()
        self.inspection = Inspection.objects.create(vehicle_id="CAT-IMAGE-TEST")

    @patch("inspections.views.process_step")
    def test_submit_step_with_in_memory_jpeg(self, process_step_mock):
        process_step_mock.return_value = (
            "PASS",
            "OK",
            {"transcript": "", "image_descriptions": ["test"], "llm_raw": "PASS OK"},
        )
        img = make_image_file("test.jpg")
        response = self.client.post(
            f"{API}/{self.inspection.id}/steps/",
            {"step_index": 0, "step_name": "Engine", "images": img},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200, response.content.decode())
        self.assertEqual(response.json()["result"], "PASS")
        self.assertEqual(StepImage.objects.filter(step__inspection=self.inspection).count(), 1)

    @patch("inspections.views.process_step")
    def test_submit_step_with_in_memory_png(self, process_step_mock):
        process_step_mock.return_value = (
            "FAIL",
            "Damage detected.",
            {"transcript": "", "image_descriptions": ["crack visible"], "llm_raw": "FAIL Damage detected."},
        )
        img = make_image_file("test.png", format="PNG")
        response = self.client.post(
            f"{API}/{self.inspection.id}/steps/",
            {"step_index": 1, "step_name": "Hydraulics", "images": img},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["result"], "FAIL")
        step = InspectionStep.objects.get(inspection=self.inspection, step_index=1)
        self.assertEqual(step.images.count(), 1)

    @patch("inspections.views.process_step")
    def test_submit_step_with_two_images_same_step(self, process_step_mock):
        """Submit one step with two image files (images key sent as list)."""
        process_step_mock.return_value = (
            "PASS",
            "OK",
            {"transcript": "", "image_descriptions": ["img1", "img2"], "llm_raw": "PASS OK"},
        )
        img1 = make_image_file("one.jpg")
        img2 = make_image_file("two.jpg")
        # Multiple files: pass as list so parser can getlist("images")
        response = self.client.post(
            f"{API}/{self.inspection.id}/steps/",
            {"step_index": 0, "step_name": "Tires", "images": [img1, img2]},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200, response.content.decode())
        step = InspectionStep.objects.get(inspection=self.inspection, step_index=0)
        self.assertEqual(step.images.count(), 2)

    @patch("inspections.views.process_step")
    def test_fixture_images_if_present(self, process_step_mock):
        """If you add images to inspections/tests/fixtures/images/, they are used here."""
        fixture_paths = list_fixture_images()
        if not fixture_paths:
            self.skipTest("No fixture images in inspections/tests/fixtures/images/")
        process_step_mock.return_value = (
            "PASS",
            "Fixture image processed.",
            {"transcript": "", "image_descriptions": ["from fixture"], "llm_raw": "PASS Fixture image processed."},
        )
        with open(fixture_paths[0], "rb") as f:
            f.name = fixture_paths[0].name
            response = self.client.post(
                f"{API}/{self.inspection.id}/steps/",
                {"step_index": 0, "step_name": "Fixture test"},
                format="multipart",
                files={"images": f},
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(StepImage.objects.filter(step__inspection=self.inspection).count(), 1)
