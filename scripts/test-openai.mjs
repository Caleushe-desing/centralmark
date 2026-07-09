import "dotenv/config";
import OpenAI from "openai";

const key = process.env.OPENAI_API_KEY;
if (!key || key === "sk-...") {
  console.log("FAIL: OPENAI_API_KEY missing or still placeholder");
  process.exit(1);
}

async function main() {
  const openai = new OpenAI({ apiKey: key });
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Responde solo: OK" }],
    max_tokens: 5,
  });
  console.log("GPT:", chat.choices[0]?.message?.content?.trim() ?? "no response");
  console.log("OPENAI_API_KEY: configured and working");
}

main().catch((e) => {
  console.log("FAIL:", e instanceof Error ? e.message : e);
  process.exit(1);
});
