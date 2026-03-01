const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { db } = require("../db");
const { processStep } = require("../services/processStep");

const router = express.Router();

const mediaRoot = path.join(__dirname, "..", "..", "media");
const audioDir = path.join(mediaRoot, "steps", "audio");
const imagesDir = path.join(mediaRoot, "steps", "images");

function datePath() {
  const d = new Date();
  return path.join(
    String(d.getFullYear()),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  );
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === "audio"
      ? path.join(audioDir, datePath())
      : path.join(imagesDir, datePath());
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    if (file.fieldname === "audio") {
      cb(null, `audio_${Date.now()}${path.extname(file.originalname) || ".webm"}`);
    } else {
      const base = path.basename(file.originalname, path.extname(file.originalname));
      cb(null, `${base}_${Date.now()}${path.extname(file.originalname) || ".jpg"}`);
    }
  },
});

const uploadStep = multer({ storage }).fields([
  { name: "audio", maxCount: 1 },
  { name: "images", maxCount: 20 },
]);

// POST /api/inspections/
router.post("/inspections/", (req, res) => {
  const vehicle_id = (req.body.vehicle_id || "").trim();
  const stmt = db.prepare("INSERT INTO inspections (vehicle_id) VALUES (?)");
  const run = stmt.run(vehicle_id || "");
  const row = db.prepare("SELECT id, vehicle_id, started_at, completed_at FROM inspections WHERE id = ?").get(run.lastInsertRowid);
  res.status(201).json({
    id: row.id,
    vehicle_id: row.vehicle_id,
    started_at: row.started_at,
    completed_at: row.completed_at,
  });
});

// GET /api/inspections/
router.get("/inspections/", (req, res) => {
  const rows = db.prepare(
    "SELECT id, vehicle_id, started_at, completed_at FROM inspections ORDER BY started_at DESC LIMIT 50"
  ).all();
  res.json(rows);
});

// GET /api/inspections/:id/
router.get("/inspections/:id/", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ detail: "Invalid id." });
  const inspection = db.prepare(
    "SELECT id, vehicle_id, started_at, completed_at FROM inspections WHERE id = ?"
  ).get(id);
  if (!inspection) return res.status(404).json({ detail: "Not found." });
  const steps = db.prepare(
    "SELECT step_index, step_name, result, result_reason, log, created_at FROM inspection_steps WHERE inspection_id = ? ORDER BY step_index"
  ).all(id);
  const stepsWithLog = steps.map((s) => ({
    step_index: s.step_index,
    step_name: s.step_name,
    result: s.result,
    result_reason: s.result_reason,
    log: s.log ? JSON.parse(s.log) : null,
    created_at: s.created_at,
  }));
  res.json({
    id: inspection.id,
    vehicle_id: inspection.vehicle_id,
    started_at: inspection.started_at,
    completed_at: inspection.completed_at,
    steps: stepsWithLog,
  });
});

// POST /api/inspections/:id/steps/ (multipart: step_index, step_name, audio, images)
router.post("/inspections/:id/steps/", (req, res, next) => {
  uploadStep(req, res, async (err) => {
    if (err) return next(err);
    const inspectionId = parseInt(req.params.id, 10);
    if (Number.isNaN(inspectionId)) return res.status(400).json({ detail: "Invalid inspection id." });
    const inspection = db.prepare("SELECT id FROM inspections WHERE id = ?").get(inspectionId);
    if (!inspection) return res.status(404).json({ detail: "Inspection not found." });

    let stepIndex = req.body.step_index;
    if (stepIndex === undefined || stepIndex === null) {
      return res.status(400).json({ detail: "step_index is required." });
    }
    stepIndex = parseInt(stepIndex, 10);
    if (Number.isNaN(stepIndex)) {
      return res.status(400).json({ detail: "step_index must be an integer." });
    }
    const stepName = (req.body.step_name || "").trim();

    const insertStep = db.prepare(
      "INSERT INTO inspection_steps (inspection_id, step_index, step_name) VALUES (?, ?, ?)"
    );
    insertStep.run(inspectionId, stepIndex, stepName);
    const stepId = db.prepare("SELECT last_insert_rowid() as id").get().id;

    let audioPath = null;
    const audioFiles = req.files && req.files.audio;
    if (audioFiles && audioFiles[0] && audioFiles[0].path) {
      audioPath = audioFiles[0].path;
      db.prepare("UPDATE inspection_steps SET audio_path = ? WHERE id = ?").run(audioPath, stepId);
    }

    const imagePaths = [];
    const imageFiles = req.files && req.files.images;
    if (Array.isArray(imageFiles)) {
      for (const f of imageFiles) {
        if (f.path) {
          imagePaths.push(f.path);
          db.prepare("INSERT INTO step_images (step_id, image_path) VALUES (?, ?)").run(stepId, f.path);
        }
      }
    }

    try {
      const { result, result_reason, log } = await processStep(audioPath, imagePaths, stepName);
      db.prepare(
        "UPDATE inspection_steps SET transcript = ?, result = ?, result_reason = ?, log = ? WHERE id = ?"
      ).run(log.transcript || "", result, result_reason, JSON.stringify(log), stepId);

      const step = db.prepare(
        "SELECT step_index, step_name, result, result_reason, log FROM inspection_steps WHERE id = ?"
      ).get(stepId);
      res.status(200).json({
        step_index: step.step_index,
        step_name: step.step_name,
        result: step.result,
        result_reason: step.result_reason,
        log: step.log ? JSON.parse(step.log) : null,
      });
    } catch (e) {
      next(e);
    }
  });
});

module.exports = router;
