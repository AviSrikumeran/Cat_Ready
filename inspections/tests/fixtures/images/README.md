# Fixture images for API tests

Drop image files here (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`) to use them in tests.

The test `StepCreateWithImageFilesTestCase.test_fixture_images_if_present` will:

- Discover all images in this folder
- Submit the first one to the step API (with `process_step` mocked)
- Assert the step and `StepImage` are created

If the folder is empty, that test is skipped.
