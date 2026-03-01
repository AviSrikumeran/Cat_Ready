const fs = require("fs");
const path = require("path");
const OpenAI = require("openai").default;

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_VISION_MODEL || "gpt-4o";

function getMime(ext) {
  const m = { ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp" };
  return m[ext.toLowerCase()] || "image/jpeg";
}

async function describeImage(imagePath) {
  if (!apiKey || !apiKey.trim()) return "";
  if (!imagePath || !fs.existsSync(imagePath)) return "";
  try {
    const client = new OpenAI({ apiKey });
    const buf = fs.readFileSync(imagePath);
    const b64 = buf.toString("base64");
    const ext = path.extname(imagePath);
    const mime = getMime(ext);
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this image briefly for a vehicle pre-start inspection: note condition, any visible damage, wear, or concerns. One or two sentences.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${mime};base64,${b64}` },
            },
          ],
        },
      ],
      max_tokens: 300,
    });
    const text = response.choices?.[0]?.message?.content;
    return (text || "").trim();
  } catch (e) {
    console.error("Vision failed:", e);
    return "";
  }
}

module.exports = { describeImage };
