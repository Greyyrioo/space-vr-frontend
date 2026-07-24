import axios from 'axios';

const API_BASE_URL = 'https://space-vr-benin.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAppConfig = () => api.get('/config');
export const createBooking = (bookingData) => api.post('/book', bookingData);
export const getReceipt = (refId) => api.get(`/receipt/${refId}`);
export const markBookingPaid = (refId) => api.post(`/receipt/${refId}/mark-paid`);
export const submitTicket = (ticketData) => api.post('/support/ticket', ticketData);

export default api;
