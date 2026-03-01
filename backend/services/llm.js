const OpenAI = require("openai").default;

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_LLM_MODEL || "gpt-4o-mini";
const VALID_RESULTS = ["PASS", "FAIL", "UNSURE"];

function parseResult(raw) {
  if (!raw) return "UNSURE";
  const upper = raw.toUpperCase();
  for (const token of VALID_RESULTS) {
    if (upper.includes(token)) return token;
  }
  return "UNSURE";
}

async function evaluateStep(stepName, transcript, imageDescriptions) {
  if (!apiKey || !apiKey.trim()) return ["UNSURE", "No API key configured."];
  const imageNotes =
    imageDescriptions.filter(Boolean).join(" ").trim() || "No images provided.";
  const prompt = `You are evaluating one step of a vehicle pre-start inspection.

Step: ${stepName || "Unnamed step"}
Operator said: ${transcript || "(no speech)"}
Image notes: ${imageNotes}

Respond with exactly one word: PASS, FAIL, or UNSURE. You may add one short sentence reason after the word.
- PASS: inspection step confirmed OK.
- FAIL: clear issue or concern.
- UNSURE: unclear or need more info.
`;
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    const raw = (response.choices?.[0]?.message?.content || "").trim();
    const result = parseResult(raw);
    return [result, raw];
  } catch (e) {
    return ["UNSURE", String(e)];
  }
}

module.exports = { evaluateStep };
