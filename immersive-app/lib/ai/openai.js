const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

export async function callModeration(text) {
  const response = await fetch(
    "https://api.openai.com/v1/moderations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input: text,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}
