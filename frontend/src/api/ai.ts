import { apiClient } from "./client.js";

export async function generateAiAd(
  prompt: string,
  preferredLanguage: "EN" | "AM" = "EN",
) {
  const response = await apiClient.post("/properties/ai-generate-ad", {
    prompt,
    preferredLanguage,
  });
  return response.data.data;
}
