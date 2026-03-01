"""
REST endpoints: inspections and steps (multipart audio + images).
"""
import logging

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Inspection, InspectionStep, StepImage
from .services import process_step

logger = logging.getLogger(__name__)


class InspectionListCreateView(APIView):
    """POST: create inspection. GET: list inspections."""

    parser_classes = [JSONParser]

    def post(self, request):
        vehicle_id = (request.data.get("vehicle_id") or "").strip()
        inspection = Inspection.objects.create(vehicle_id=vehicle_id or "")
        return Response(
            {
                "id": inspection.id,
                "vehicle_id": inspection.vehicle_id,
                "started_at": inspection.started_at.isoformat(),
                "completed_at": inspection.completed_at.isoformat() if inspection.completed_at else None,
            },
            status=status.HTTP_201_CREATED,
        )

    def get(self, request):
        inspections = Inspection.objects.all()[:50]
        data = [
            {
                "id": i.id,
                "vehicle_id": i.vehicle_id,
                "started_at": i.started_at.isoformat(),
                "completed_at": i.completed_at.isoformat() if i.completed_at else None,
            }
            for i in inspections
        ]
        return Response(data)


class InspectionDetailView(APIView):
    """GET: single inspection with steps."""

    def get(self, request, pk):
        try:
            inspection = Inspection.objects.get(pk=pk)
        except Inspection.DoesNotExist:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        steps = [
            {
                "step_index": s.step_index,
                "step_name": s.step_name,
                "result": s.result,
                "result_reason": s.result_reason,
                "log": s.log,
                "created_at": s.created_at.isoformat(),
            }
            for s in inspection.steps.order_by("step_index")
        ]
        return Response(
            {
                "id": inspection.id,
                "vehicle_id": inspection.vehicle_id,
                "started_at": inspection.started_at.isoformat(),
                "completed_at": inspection.completed_at.isoformat() if inspection.completed_at else None,
                "steps": steps,
            }
        )


class StepCreateView(APIView):
    """POST: submit one step (multipart: step_index, step_name, audio, images)."""

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, inspection_id):
        try:
            inspection = Inspection.objects.get(pk=inspection_id)
        except Inspection.DoesNotExist:
            return Response(
                {"detail": "Inspection not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        step_index = request.data.get("step_index")
        if step_index is None:
            return Response(
                {"detail": "step_index is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            step_index = int(step_index)
        except (TypeError, ValueError):
            return Response(
                {"detail": "step_index must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        step_name = (request.data.get("step_name") or "").strip()

        # One audio file
        audio_file = request.FILES.get("audio")
        # Multiple images (getlist for multiple same key)
        image_files = request.FILES.getlist("images") or request.FILES.getlist("images[]") or []

        step = InspectionStep.objects.create(
            inspection=inspection,
            step_index=step_index,
            step_name=step_name,
        )
        if audio_file:
            size = getattr(audio_file, "size", None)
            logger.info("Step %s: received audio, size=%s bytes", step_index, size)
            step.audio = audio_file
            step.save(update_fields=["audio"])
        else:
            logger.info("Step %s: no audio file in request", step_index)

        for img in image_files:
            StepImage.objects.create(step=step, image=img)

        audio_path = step.audio.path if step.audio else None
        image_paths = [si.image.path for si in step.images.all()]

        result, result_reason, log = process_step(
            audio_path=audio_path,
            image_paths=image_paths,
            step_name=step_name,
        )

        step.transcript = log.get("transcript", "")
        step.result = result
        step.result_reason = result_reason
        step.log = log
        step.save(update_fields=["transcript", "result", "result_reason", "log"])

        return Response(
            {
                "step_index": step.step_index,
                "step_name": step.step_name,
                "result": step.result,
                "result_reason": step.result_reason,
                "log": step.log,
            },
            status=status.HTTP_200_OK,
        )
