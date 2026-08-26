// Stage 1: Strictly focused on Addis Ababa
export const ETHIOPIAN_REGIONS = ["Addis Ababa"] as const;

export type EthiopianRegion = (typeof ETHIOPIAN_REGIONS)[number];

export const ADDIS_ABABA_SUBCITIES = [
  "Addis Ketema",
  "Akaky Kaliti",
  "Arada",
  "Bole",
  "Gullele",
  "Kirkos",
  "Kolfe Keraniyo",
  "Lideta",
  "Nifas Silk-Lafto",
  "Lemi Kura",
  "Yeka",
] as const;

export type AddisAbabaSubCity = (typeof ADDIS_ABABA_SUBCITIES)[number];
