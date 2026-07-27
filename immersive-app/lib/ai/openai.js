function getOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return apiKey;
}

async function callOpenAI(endpoint, payload) {
  const response = await fetch(
    `https://api.openai.com/v1/${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAIKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
  const errorDetails = {
    status: response.status,
    statusText: response.statusText,
    type: result?.error?.type || null,
    code: result?.error?.code || null,
    message:
      result?.error?.message ||
      "OpenAI request failed.",
  };

  console.error("OpenAI API error:", errorDetails);

  throw new Error(JSON.stringify(errorDetails));
}

  return result;
}

export async function callModeration(text) {
  return callOpenAI("moderations", {
    model: "omni-moderation-latest",
    input: text,
  });
}
