export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { items } = req.body;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "Suggest simple recipes to reduce food waste" },
            { role: "user", content: `Use these items: ${items}` },
          ],
        }),
      }
    );

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch {
    res.status(500).json({ error: "AI failed" });
  }
}
