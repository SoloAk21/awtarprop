import dns from "dns";
// Force IPv4 resolution for Google Gemini API connections
dns.setDefaultResultOrder("ipv4first");

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { ETHIOPIAN_REGIONS, ADDIS_ABABA_SUBCITIES } from "@awtarprop/shared";

export interface GeneratedAdResult {
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  category: string;
  purpose: string;
  priceETB: number;
  region: string;
  subCity?: string;
  areaName: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqMeters?: number;
  isFurnished?: boolean;
  amenities: string[];
  condition?: string;
  primaryLanguage: "EN" | "AM";
}

export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (
      env.GEMINI_API_KEY &&
      env.GEMINI_API_KEY !== "your_gemini_api_key_here"
    ) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  /**
   * Generates a structured bilingual property advertisement using Gemini 3.6 API endpoints.
   */
  public async generatePropertyAd(
    prompt: string,
    preferredLanguage: "EN" | "AM" = "EN",
  ): Promise<GeneratedAdResult> {
    if (!this.genAI) {
      logger.warn(
        "GEMINI_API_KEY unconfigured or placeholder used. Returning fallback template.",
      );
      return this.getFallbackAd(prompt, preferredLanguage);
    }

    const systemInstruction = `
You are the AI Real Estate Copywriter & Data Extractor for AwtarProp (Ethiopia's property marketplace).
Your job is to read the user's natural language input (which may be in English, Amharic, or a mix) and generate a structured JSON object for a property ad.

RULES:
1. ALWAYS generate BOTH English (titleEn, descriptionEn) and Amharic (titleAm, descriptionAm) versions.
2. The English and Amharic versions MUST be factually identical and consistent with the user's requirements.
3. If the user input is in Amharic, accurately translate and enrich into English, and vice versa.
4. Extract numeric values for priceETB, bedrooms, bathrooms, and areaSqMeters.
5. FURNISHED DETECTION: If prompt contains "furnished", "fully furnished", "ከነእቃው", "ከነ እቃው", "እቃ ያለው", "furnished unit", set isFurnished to true. Otherwise false.
6. Map category to ONE OF: ['APARTMENT', 'CONDOMINIUM', 'RESIDENTIAL_HOUSE', 'STUDIO', 'COMMERCIAL_SPACE', 'OFFICE', 'BUILDING', 'HOTEL', 'RESIDENTIAL_LAND', 'COMMERCIAL_LAND', 'AGRICULTURAL_LAND']. Default: 'APARTMENT'.
7. Map purpose to ONE OF: ['FOR_SALE', 'FOR_RENT', 'LOOKING_TO_BUY', 'LOOKING_TO_RENT']. Default: 'FOR_RENT'.
8. Map region to ONE OF: ${JSON.stringify(ETHIOPIAN_REGIONS)}. Default: 'Addis Ababa'.
9. Map subCity if in Addis Ababa to ONE OF: ${JSON.stringify(ADDIS_ABABA_SUBCITIES)}. Default: 'Bole'.
10. Extract areaName (landmark/neighborhood e.g. Bole Atlas, CMC, Sarbet).
11. Extract amenities array from hashtags/keywords e.g. ['Parking', 'Elevator', 'Backup Generator', 'Water Tank', 'Security CCTV', 'Balcony', 'Garden', 'Furnished', 'Modern Kitchen', 'Terrace'].
12. Return strictly a JSON object.
`;

    const modelsToTry = [
      "gemini-3.6-flash",
      "gemini-3.6-pro",
      "gemini-2.5-flash",
    ];

    for (const modelName of modelsToTry) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const fullPrompt = `${systemInstruction}\n\nUser Preferred Primary Language: ${preferredLanguage}\nUser Prompt Requirement: "${prompt}"`;

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text() || "";

        const cleanJson = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleanJson);

        logger.info(
          `✨ Successfully generated property ad using model [${modelName}]`,
        );

        return {
          titleEn: parsed.titleEn || "Property for Rent / Sale in Addis Ababa",
          titleAm: parsed.titleAm || "በአዲስ አበባ የሚገኝ ቤት",
          descriptionEn: parsed.descriptionEn || prompt,
          descriptionAm: parsed.descriptionAm || prompt,
          category: parsed.category || "APARTMENT",
          purpose: parsed.purpose || "FOR_RENT",
          priceETB: Number(parsed.priceETB) || 50000,
          region: parsed.region || "Addis Ababa",
          subCity: parsed.subCity || "Bole",
          areaName: parsed.areaName || "Bole Atlas",
          bedrooms: parsed.bedrooms ? Number(parsed.bedrooms) : undefined,
          bathrooms: parsed.bathrooms ? Number(parsed.bathrooms) : undefined,
          areaSqMeters: parsed.areaSqMeters
            ? Number(parsed.areaSqMeters)
            : undefined,
          isFurnished:
            parsed.isFurnished !== undefined
              ? Boolean(parsed.isFurnished)
              : prompt.toLowerCase().includes("furnished"),
          amenities: Array.isArray(parsed.amenities)
            ? parsed.amenities
            : ["Parking", "Water Tank"],
          condition: parsed.condition || "EXCELLENT",
          primaryLanguage: preferredLanguage,
        };
      } catch (error: any) {
        logger.warn(
          `Model candidate [${modelName}] failed: ${error.message}. Trying next model...`,
        );
      }
    }

    logger.error(
      "All Gemini AI model attempts failed. Returning structured fallback ad.",
    );
    return this.getFallbackAd(prompt, preferredLanguage);
  }

  private getFallbackAd(
    prompt: string,
    preferredLanguage: "EN" | "AM",
  ): GeneratedAdResult {
    const isFurnished =
      prompt.toLowerCase().includes("furnished") || prompt.includes("ከነእቃው");
    return {
      titleEn: "Modern Property in Addis Ababa",
      titleAm: "በአዲስ አበባ የሚገኝ ዘመናዊ ቤት",
      descriptionEn: `Property listing requirement: ${prompt}`,
      descriptionAm: `የቤት ፍላጎት ዝርዝር፦ ${prompt}`,
      category: "APARTMENT",
      purpose: "FOR_RENT",
      priceETB: 80000,
      region: "Addis Ababa",
      subCity: "Bole",
      areaName: "Bole Atlas",
      bedrooms: 2,
      bathrooms: 2,
      areaSqMeters: 110,
      isFurnished,
      amenities: ["Parking", "Backup Generator", "Water Tank"],
      condition: "EXCELLENT",
      primaryLanguage: preferredLanguage,
    };
  }
}

export const aiService = new AiService();
