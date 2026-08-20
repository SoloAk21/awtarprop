export const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'South Ethiopia',
  'South West Ethiopia Peoples',
  'Tigray'
] as const;

export type EthiopianRegion = (typeof ETHIOPIAN_REGIONS)[number];

export const ADDIS_ABABA_SUBCITIES = [
  'Addis Ketema',
  'Akaky Kaliti',
  'Arada',
  'Bole',
  'Gullele',
  'Kirkos',
  'Kolfe Keraniyo',
  'Lideta',
  'Nifas Silk-Lafto',
  'Lemi Kura',
  'Yeka'
] as const;

export type AddisAbabaSubCity = (typeof ADDIS_ABABA_SUBCITIES)[number];
