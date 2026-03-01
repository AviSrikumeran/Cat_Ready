"""
Test helpers: in-memory image file, fixture image discovery.
"""
import io
import os
from pathlib import Path

from PIL import Image


def make_image_file(filename="test.jpg", width=10, height=10, format="JPEG"):
    """Create an in-memory image file suitable for upload in tests. Caller can use as file-like."""
    buffer = io.BytesIO()
    img = Image.new("RGB", (width, height), color="red")
    img.save(buffer, format=format)
    buffer.seek(0)
    buffer.name = filename
    return buffer


def get_fixture_images_dir():
    """Return the path to the fixture images directory (same folder as this file)."""
    return Path(__file__).resolve().parent / "fixtures" / "images"


def list_fixture_images():
    """
    List image files in inspections/tests/fixtures/images/.
    Drop your test images there to use them in tests.
    """
    folder = get_fixture_images_dir()
    if not folder.is_dir():
        return []
    exts = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    return sorted(
        [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in exts],
        key=lambda p: p.name,
    )


def open_fixture_image(path):
    """Open a fixture image file for use in multipart uploads. Returns a file-like object."""
    return open(path, "rb")


def get_project_images_dir():
    """Return the path to the project root images/ folder (HackIL26 images)."""
    from django.conf import settings
    return Path(settings.BASE_DIR) / "images"


def list_project_images():
    """List image files in project root images/ folder. Used for LLM/vision integration tests."""
    folder = get_project_images_dir()
    if not folder.is_dir():
        return []
    exts = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    return sorted(
        [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in exts],
        key=lambda p: p.name,
    )
