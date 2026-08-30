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

/**
 * Structured filters extracted from a natural-language property search.
 */
export interface ParsedSearchFilters {
  category?: string;
  purpose?: string;
  providerType?: string;
  subCity?: string;
  areaName?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  isFurnished?: boolean;
  searchKeyword?: string;
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
   * Generates a structured bilingual property advertisement using Gemini.
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
You are the AI Real Estate Copywriter & Data Extractor for AwtarProp
(Ethiopia's property marketplace).

Your job is to read the user's natural language input, which may be in
English, Amharic, or a mixture of both, and generate a structured JSON
object for a property advertisement.

RULES:

1. ALWAYS generate BOTH English and Amharic:
   - titleEn
   - titleAm
   - descriptionEn
   - descriptionAm

2. The English and Amharic versions MUST be factually identical
   and consistent with the user's requirements.

3. If the user input is in Amharic, accurately translate and enrich
   it into English, and vice versa.

4. Extract numeric values for:
   - priceETB
   - bedrooms
   - bathrooms
   - areaSqMeters

5. FURNISHED DETECTION:
   If the prompt contains any of:
   - "furnished"
   - "fully furnished"
   - "ከነእቃው"
   - "ከነ እቃው"
   - "እቃ ያለው"
   - "furnished unit"

   set isFurnished to true.
   Otherwise set it to false.

6. Map category to ONE OF:
   [
     "APARTMENT",
     "CONDOMINIUM",
     "RESIDENTIAL_HOUSE",
     "STUDIO",
     "COMMERCIAL_SPACE",
     "OFFICE",
     "BUILDING",
     "HOTEL",
     "RESIDENTIAL_LAND",
     "COMMERCIAL_LAND",
     "AGRICULTURAL_LAND"
   ]

   Default: "APARTMENT"

7. Map purpose to ONE OF:
   [
     "FOR_SALE",
     "FOR_RENT",
     "LOOKING_TO_BUY",
     "LOOKING_TO_RENT"
   ]

   Default: "FOR_RENT"

8. Map region to ONE OF:
   ${JSON.stringify(ETHIOPIAN_REGIONS)}

   Default: "Addis Ababa"

9. If the property is in Addis Ababa, map subCity to ONE OF:
   ${JSON.stringify(ADDIS_ABABA_SUBCITIES)}

   Default: "Bole"

10. Extract areaName from landmarks/neighborhoods.
    Examples:
    - Bole Atlas
    - CMC
    - Sarbet
    - Mexico
    - Kazanchis

11. Extract amenities from hashtags, keywords, or descriptions.

    Examples:
    [
      "Parking",
      "Elevator",
      "Backup Generator",
      "Water Tank",
      "Security CCTV",
      "Balcony",
      "Garden",
      "Furnished",
      "Modern Kitchen",
      "Terrace"
    ]

12. Return STRICTLY a valid JSON object.
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

        const fullPrompt = `
${systemInstruction}

User Preferred Primary Language: ${preferredLanguage}

User Prompt Requirement:
"${prompt}"
`;

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
              : this.detectFurnished(prompt),

          amenities: Array.isArray(parsed.amenities)
            ? parsed.amenities
            : ["Parking", "Water Tank"],

          condition: parsed.condition || "EXCELLENT",

          primaryLanguage: preferredLanguage,
        };
      } catch (error: any) {
        logger.warn(
          `Model candidate [${modelName}] failed: ${
            error?.message || error
          }. Trying next model...`,
        );
      }
    }

    logger.error(
      "All Gemini AI model attempts failed. Returning structured fallback ad.",
    );

    return this.getFallbackAd(prompt, preferredLanguage);
  }

  /**
   * Parses a natural-language property search query into structured filters.
   *
   * Example:
   *
   * "3 bedroom apartment in Bole under 80k ETB furnished for rent by broker"
   *
   * Returns:
   *
   * {
   *   category: "APARTMENT",
   *   purpose: "FOR_RENT",
   *   providerType: "BROKER",
   *   subCity: "Bole",
   *   maxPrice: 80000,
   *   bedrooms: 3,
   *   isFurnished: true
   * }
   */
  public async parseSearchQuery(
    userQuery: string,
  ): Promise<ParsedSearchFilters> {
    const normalizedQuery = userQuery.trim();

    if (!normalizedQuery) {
      return {};
    }

    // If Gemini is not configured, preserve the complete query
    // so the normal search system can still perform keyword search.
    if (!this.genAI) {
      logger.warn(
        "GEMINI_API_KEY unconfigured. Using natural-language search as keyword.",
      );

      return {
        searchKeyword: normalizedQuery,
      };
    }

    const prompt = `
You are an AI Search Query Extractor for AwtarProp,
an Ethiopian real estate marketplace.

Analyze this natural-language property search query:

"${normalizedQuery}"

Extract only the criteria explicitly stated or strongly implied
by the user's query.

Use EXACTLY these enum values.

CATEGORY:
[
  "RESIDENTIAL_HOUSE",
  "CONDOMINIUM",
  "APARTMENT",
  "VILLA",
  "STUDIO",
  "COMMERCIAL_SPACE",
  "OFFICE",
  "SHOP",
  "WAREHOUSE",
  "BUILDING",
  "HOTEL",
  "RESIDENTIAL_LAND",
  "COMMERCIAL_LAND",
  "AGRICULTURAL_LAND"
]

PURPOSE:
[
  "FOR_SALE",
  "FOR_RENT",
  "LOOKING_TO_BUY",
  "LOOKING_TO_RENT"
]

PROVIDER TYPE:
[
  "OWNER",
  "BROKER",
  "AGENT",
  "AGENCY",
  "DEVELOPER"
]

ADDIS ABABA SUB-CITIES:
[
  "Bole",
  "Kirkos",
  "Arada",
  "Yeka",
  "Nifas Silk-Lafto",
  "Lideta",
  "Gullele",
  "Addis Ketema",
  "Akaky Kaliti",
  "Kolfe Keranio",
  "Lemi Kura"
]

FIELDS:

category:
Property category if explicitly mentioned.

purpose:
Whether the user wants to buy, sell, rent, or find a rental.

providerType:
OWNER, BROKER, AGENT, AGENCY, or DEVELOPER if mentioned.

subCity:
Addis Ababa sub-city if explicitly mentioned.

areaName:
Specific neighborhood, landmark, area, district, or location
that is more specific than the sub-city.

minPrice:
Minimum price if specified.

maxPrice:
Maximum price if specified.

bedrooms:
Number of bedrooms if specified.

bathrooms:
Number of bathrooms if specified.

isFurnished:
true if furnished is requested.
false if explicitly requesting unfurnished.
Otherwise OMIT this field.

searchKeyword:
Important remaining search terms, landmarks, or property
descriptors that cannot be represented by the structured fields.

PRICE RULES:

- "under 80k" => maxPrice: 80000
- "below 80,000" => maxPrice: 80000
- "up to 80k" => maxPrice: 80000
- "80k max" => maxPrice: 80000
- "above 50k" => minPrice: 50000
- "over 50,000" => minPrice: 50000
- "between 50k and 80k" =>
  minPrice: 50000,
  maxPrice: 80000

Convert:
- 1k = 1,000
- 10k = 10,000
- 50k = 50,000
- 80k = 80,000
- 1m = 1,000,000
- 1.5m = 1,500,000

ETHIOPIAN CONTEXT:

"በቦሌ" or "Bole" => subCity: "Bole"
"በካዛንቺስ" or "Kazanchis" =>
  searchKeyword or areaName: "Kazanchis"

"ኪራይ" / "rent" / "for rent" =>
  purpose: "FOR_RENT"

"ሽያጭ" / "sale" / "for sale" =>
  purpose: "FOR_SALE"

"የሚከራይ" / "looking to rent" =>
  purpose: "LOOKING_TO_RENT"

"ለመግዛት" / "looking to buy" =>
  purpose: "LOOKING_TO_BUY"

"ደላላ" / "broker" =>
  providerType: "BROKER"

"ባለቤት" / "owner" =>
  providerType: "OWNER"

"ኤጀንት" / "agent" =>
  providerType: "AGENT"

"ኤጀንሲ" / "agency" =>
  providerType: "AGENCY"

"አዘጋጅ" / "developer" =>
  providerType: "DEVELOPER"

"ከነእቃው", "ከነ እቃው", "እቃ ያለው",
"furnished", "fully furnished" =>
  isFurnished: true

IMPORTANT:

1. Do NOT invent missing filters.
2. Only return fields that can be determined from the query.
3. Numeric values must be JSON numbers, not strings.
4. Preserve important location names.
5. Understand both English and Amharic.
6. Return ONLY valid JSON.
7. Do NOT wrap the JSON in markdown.
`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const result = await model.generateContent(prompt);

      const responseText = result.response.text() || "";

      const cleanJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanJson);

      const filters: ParsedSearchFilters = {
        category: this.cleanString(parsed.category),
        purpose: this.cleanString(parsed.purpose),
        providerType: this.cleanString(parsed.providerType),
        subCity: this.cleanString(parsed.subCity),
        areaName: this.cleanString(parsed.areaName),
        minPrice: this.toOptionalNumber(parsed.minPrice),
        maxPrice: this.toOptionalNumber(parsed.maxPrice),
        bedrooms: this.toOptionalNumber(parsed.bedrooms),
        bathrooms: this.toOptionalNumber(parsed.bathrooms),
        isFurnished:
          typeof parsed.isFurnished === "boolean"
            ? parsed.isFurnished
            : undefined,
        searchKeyword: this.cleanString(parsed.searchKeyword),
      };

      logger.info(
        `🔎 Successfully parsed property search query: "${normalizedQuery}"`,
      );

      logger.debug(`Search filters: ${JSON.stringify(filters)}`);

      return filters;
    } catch (error: any) {
      logger.warn(
        `Gemini search query parse fallback triggered: ${
          error?.message || error
        }`,
      );

      return {
        searchKeyword: normalizedQuery,
      };
    }
  }

  /**
   * Detect furnished property from English or Amharic text.
   */
  private detectFurnished(prompt: string): boolean {
    const normalized = prompt.toLowerCase();

    return (
      normalized.includes("furnished") ||
      normalized.includes("fully furnished") ||
      prompt.includes("ከነእቃው") ||
      prompt.includes("ከነ እቃው") ||
      prompt.includes("እቃ ያለው")
    );
  }

  /**
   * Convert a possible Gemini value into a number.
   */
  private toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  /**
   * Clean optional string values returned by Gemini.
   */
  private cleanString(value: unknown): string | undefined {
    if (value === null || value === undefined || typeof value !== "string") {
      return undefined;
    }

    const cleaned = value.trim();

    return cleaned.length > 0 ? cleaned : undefined;
  }

  private getFallbackAd(
    prompt: string,
    preferredLanguage: "EN" | "AM",
  ): GeneratedAdResult {
    const isFurnished = this.detectFurnished(prompt);

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
