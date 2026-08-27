import { apiClient } from "./client.js";

export async function initializeChapaCheckout(propertyId: string) {
  const response = await apiClient.post("/payments/initialize-chapa", {
    propertyId,
  });
  return response.data.data;
}

export async function verifyChapaPayment(txRef: string) {
  const response = await apiClient.post("/payments/verify-chapa", { txRef });
  return response.data.data;
}
