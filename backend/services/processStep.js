const fs = require("fs");
const { transcribe } = require("./stt");
const { describeImage } = require("./vision");
const { evaluateStep } = require("./llm");

function shortReason(raw, result) {
  if (!raw || !raw.toUpperCase().includes(result)) return raw;
  const upper = raw.toUpperCase();
  for (const token of ["PASS", "FAIL", "UNSURE"]) {
    if (upper.includes(token)) {
      const idx = upper.indexOf(token);
      const after = raw.slice(idx + token.length).trim().replace(/^[.\s]+/, "");
      return after || raw;
    }
  }
  return raw;
}

async function processStep(audioPath, imagePaths, stepName) {
  let transcript = "";
  if (audioPath && fs.existsSync(audioPath)) {
    transcript = await transcribe(audioPath);
  }
  const imageDescriptions = [];
  for (const p of imagePaths || []) {
    if (fs.existsSync(p)) {
      const desc = await describeImage(p);
      imageDescriptions.push(desc || "(no description)");
    }
  }
  const [result, raw] = await evaluateStep(stepName, transcript, imageDescriptions);
  const result_reason = shortReason(raw, result);
  const log = {
    transcript,
    image_descriptions: imageDescriptions,
    llm_raw: raw,
  };
  return { result, result_reason, log };
}

module.exports = { processStep };
