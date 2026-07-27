import { callModeration } from "./openai.js";

export async function moderateMessage(message) {
  const response = await callModeration(message);

  const result = response.results?.[0];

  if (!result) {
    throw new Error("Invalid moderation response.");
  }

  return {
    flagged: result.flagged,
    categories: result.categories || {},
    categoryScores: result.category_scores || {},
    model: response.model || "omni-moderation-latest",
  };
}
