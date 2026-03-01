const fs = require("fs");
const OpenAI = require("openai").default;

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_STT_MODEL || "whisper-1";

async function transcribe(audioPath) {
  if (!apiKey || !apiKey.trim()) {
    console.warn("STT skipped: OPENAI_API_KEY is not set.");
    return "";
  }
  if (!audioPath || !fs.existsSync(audioPath)) {
    console.warn("STT skipped: no audio file at", audioPath);
    return "";
  }
  try {
    const stat = fs.statSync(audioPath);
    if (stat.size === 0) {
      console.warn("STT skipped: audio file is empty at", audioPath);
      return "";
    }
  } catch (e) {
    return "";
  }
  try {
    const client = new OpenAI({ apiKey: apiKey.trim() });
    const stream = fs.createReadStream(audioPath);
    const response = await client.audio.transcriptions.create({
      model,
      file: stream,
    });
    return (response.text || "").trim();
  } catch (e) {
    console.error("STT failed:", e);
    return "";
  }
}

module.exports = { transcribe };
