import { ADDIS_ABABA_SUBCITIES } from "@awtarprop/shared";

/**
 * Intelligent keyword-based Sub-city detector for Addis Ababa landmarks.
 */
export function detectAddisSubCity(text: string): string {
  if (!text) return "Bole";
  const lower = text.toLowerCase();

  const subcityKeywords: Record<string, string[]> = {
    Bole: [
      "bole",
      "atlas",
      "medhanialem",
      "airport",
      "olympia",
      "rwanda",
      "gerji",
      "hayahulet",
      "jackros",
      "imperial",
      "brass",
    ],
    Kirkos: [
      "kirkos",
      "meskel",
      "kazanchis",
      "gotera",
      "lagahar",
      "sarbet",
      "beklo bet",
      "meshualekia",
    ],
    Lideta: ["lideta", "mexico", "abnet", "tor hayloch", "balcha"],
    Yeka: [
      "yeka",
      "megenagna",
      "cmc",
      "kotebe",
      "ferensay",
      "sholla",
      "salite mehret",
      "gurrd shola",
    ],
    Arada: [
      "arada",
      "piazza",
      "piassa",
      "churchill",
      "4 kilo",
      "6 kilo",
      "ras mekonnen",
    ],
    Gullele: [
      "gullele",
      "shiro meda",
      "semien mazegaja",
      "addisu mebrahie",
      "18 mazoria",
    ],
    "Addis Ketema": ["addis ketema", "merkato", "teklehaimanot", "sebategna"],
    "Nifas Silk-Lafto": [
      "nifas silk",
      "lafto",
      "sarbet",
      "bisrate gabriel",
      "jemo",
      "kera",
      "gotera",
      "hana maru",
    ],
    "Kolfe Keraniyo": ["kolfe", "keraniyo", "welete", "zenebework", "ayertena"],
    "Akaky Kaliti": ["akaky", "kaliti", "kality", "saris", "kera"],
    "Lemi Kura": ["lemi kura", "ayat", "cmc", "summit", "tafo", "locust"],
  };

  for (const [subcity, keywords] of Object.entries(subcityKeywords)) {
    if (keywords.some((k) => lower.includes(k))) {
      return subcity;
    }
  }

  // Fallback match against official sub-city list
  const directMatch = ADDIS_ABABA_SUBCITIES.find((sc) =>
    lower.includes(sc.toLowerCase()),
  );
  return directMatch || "Bole";
}

/**
 * Reverse geocodes GPS coordinates into an Addis Ababa landmark and sub-city.
 */
export async function reverseGeocodeAddis(
  lat: number,
  lon: number,
): Promise<{ name: string; subCity: string }> {
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const p = data.features[0].properties;
      const name = p.name || p.street || p.district || "Addis Ababa Landmark";
      const fullText = `${name} ${p.district || ""} ${p.suburb || ""}`;
      const subCity = detectAddisSubCity(fullText);

      return { name, subCity };
    }
  } catch (error) {
    console.warn("Reverse geocode error:", error);
  }

  return { name: "Addis Ababa Landmark", subCity: "Bole" };
}
