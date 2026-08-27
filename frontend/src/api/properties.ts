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

export async function updatePropertyListing(
  id: string,
  data: Partial<CreatePropertyInput>,
) {
  const response = await apiClient.put(`/properties/${id}`, data);
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
