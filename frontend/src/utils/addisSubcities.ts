import { ADDIS_ABABA_SUBCITIES } from "@awtarprop/shared";

export type AddisSubCityName = (typeof ADDIS_ABABA_SUBCITIES)[number];

// Polygon Vertices [latitude, longitude] for Addis Ababa 11 Sub-cities
export const ADDIS_SUBCITY_POLYGONS: Record<
  AddisSubCityName,
  [number, number][]
> = {
  Bole: [
    [8.95, 38.765],
    [9.02, 38.765],
    [9.035, 38.82],
    [8.98, 38.86],
    [8.93, 38.82],
  ],
  Yeka: [
    [9.01, 38.775],
    [9.06, 38.77],
    [9.08, 38.84],
    [9.02, 38.88],
    [9.005, 38.82],
  ],
  Kirkos: [
    [9.0, 38.745],
    [9.025, 38.745],
    [9.025, 38.775],
    [8.995, 38.77],
  ],
  Lideta: [
    [9.0, 38.725],
    [9.03, 38.725],
    [9.025, 38.745],
    [8.995, 38.745],
  ],
  Arada: [
    [9.025, 38.74],
    [9.055, 38.74],
    [9.05, 38.765],
    [9.025, 38.76],
  ],
  Gullele: [
    [9.035, 38.71],
    [9.09, 38.71],
    [9.09, 38.765],
    [9.04, 38.75],
  ],
  "Addis Ketema": [
    [9.02, 38.715],
    [9.045, 38.715],
    [9.045, 38.74],
    [9.02, 38.735],
  ],
  "Nifas Silk-Lafto": [
    [8.93, 38.7],
    [9.005, 38.71],
    [9.005, 38.755],
    [8.94, 38.75],
  ],
  "Kolfe Keraniyo": [
    [8.98, 38.66],
    [9.06, 38.66],
    [9.05, 38.72],
    [8.98, 38.715],
  ],
  "Akaky Kaliti": [
    [8.84, 38.72],
    [8.95, 38.72],
    [8.95, 38.83],
    [8.84, 38.83],
  ],
  "Lemi Kura": [
    [9.0, 38.83],
    [9.05, 38.83],
    [9.05, 38.9],
    [8.99, 38.9],
  ],
};

// Sub-city Centroids [lat, lon] for distance fallback
export const SUBCITY_CENTROIDS: Record<AddisSubCityName, [number, number]> = {
  Bole: [8.9961, 38.7885],
  Yeka: [9.0207, 38.8021],
  Kirkos: [9.0105, 38.7618],
  Lideta: [9.0125, 38.7423],
  Arada: [9.0345, 38.7519],
  Gullele: [9.055, 38.73],
  "Addis Ketema": [9.03, 38.725],
  "Nifas Silk-Lafto": [8.975, 38.725],
  "Kolfe Keraniyo": [9.02, 38.69],
  "Akaky Kaliti": [8.89, 38.77],
  "Lemi Kura": [9.025, 38.86],
};

/**
 * Ray-Casting Point-in-Polygon Algorithm.
 * @param point [lat, lon]
 * @param polygon Array of [lat, lon] vertices
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][],
): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Finds exact Addis Ababa Sub-city name from GPS coordinates [lat, lon].
 */
export function findSubCityByCoordinates(
  lat: number,
  lon: number,
): AddisSubCityName {
  const point: [number, number] = [lat, lon];

  // 1. Ray-Casting Polygon Check
  for (const [subCity, polygon] of Object.entries(ADDIS_SUBCITY_POLYGONS)) {
    if (isPointInPolygon(point, polygon)) {
      return subCity as AddisSubCityName;
    }
  }

  // 2. Fallback: Find Nearest Sub-city Centroid by Euclidean Distance
  let nearestSubCity: AddisSubCityName = "Bole";
  let minDistance = Infinity;

  for (const [subCity, centroid] of Object.entries(SUBCITY_CENTROIDS)) {
    const dLat = lat - centroid[0];
    const dLon = lon - centroid[1];
    const dist = dLat * dLat + dLon * dLon;

    if (dist < minDistance) {
      minDistance = dist;
      nearestSubCity = subCity as AddisSubCityName;
    }
  }

  return nearestSubCity;
}
