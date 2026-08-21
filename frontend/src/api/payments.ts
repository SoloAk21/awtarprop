import { apiClient } from './client.js';

export async function createCheckout(propertyId: string) {
  const response = await apiClient.post('/payments/create-checkout', { propertyId });
  return response.data.data;
}

export async function verifyPayment(transactionId: string) {
  const response = await apiClient.post('/payments/verify', { transactionId });
  return response.data.data;
}
