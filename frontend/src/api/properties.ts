import { apiClient } from "./client.js";
import type { CreatePropertyInput } from "@awtarprop/shared";

export interface PropertyQueryFilters {
  category?: string;
  purpose?: string;
  region?: string;
  subCity?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function fetchProperties(filters: PropertyQueryFilters = {}) {
  const response = await apiClient.get("/properties", {
    params: {
      ...filters,
      _t: Date.now(),
    },
  });

  const rawData = response.data?.data;
  const firstProp = rawData?.properties?.[0];

  console.log("[api/properties.ts] rawData keys:", Object.keys(rawData || {}));
  if (firstProp) {
    console.log(
      "[api/properties.ts] firstProp.id:",
      firstProp.id,
      "firstProp.images:",
      firstProp.images,
    );
  }

  return response.data.data;
}

export async function fetchPropertyById(id: string) {
  const response = await apiClient.get(`/properties/${id}`, {
    params: { _t: Date.now() },
  });
  return response.data.data.property;
}

export async function createPropertyListing(data: CreatePropertyInput) {
  const response = await apiClient.post("/properties", data);
  return response.data.data.property;
}

export async function uploadPropertyImages(
  propertyId: string,
  formData: FormData,
) {
  const response = await apiClient.post(
    `/properties/${propertyId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.data.images;
}

export async function fetchMyListings() {
  const response = await apiClient.get("/properties/user/my-listings", {
    params: { _t: Date.now() },
  });
  return response.data.data.properties;
}
