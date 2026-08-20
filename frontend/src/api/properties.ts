import { apiClient } from './client.js';
import type { CreatePropertyInput } from '@awtarprop/shared';

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
  const response = await apiClient.get('/properties', { params: filters });
  return response.data.data;
}

export async function fetchPropertyById(id: string) {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data.data.property;
}

export async function createPropertyListing(data: CreatePropertyInput) {
  const response = await apiClient.post('/properties', data);
  return response.data.data.property;
}

export async function fetchMyListings() {
  const response = await apiClient.get('/properties/user/my-listings');
  return response.data.data.properties;
}
