import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProperties,
  fetchPropertyById,
  fetchMyListings,
  createPropertyListing,
} from "../api/properties.js";
import type { PropertyQueryFilters } from "../api/properties.js";
import type { CreatePropertyInput } from "@awtarprop/shared";

export function usePropertiesQuery(filters: PropertyQueryFilters = {}) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => fetchProperties(filters),
  });
}

export function usePropertyDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => (id ? fetchPropertyById(id) : null),
    enabled: !!id,
  });
}

export function useMyListingsQuery() {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
  });
}

export function useCreatePropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyInput) => createPropertyListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
