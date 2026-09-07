import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// --- Cuentas ---
export const getAccounts = () => api.get('/accounts').then((r) => r.data);
export const getAccount = (id) => api.get(`/accounts/${id}`).then((r) => r.data);
export const createAccount = (data) => api.post('/accounts', data).then((r) => r.data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data).then((r) => r.data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

// --- Contactos ---
export const getContacts = (accountId) =>
  api.get('/contacts', { params: accountId ? { accountId } : {} }).then((r) => r.data);
export const createContact = (data) => api.post('/contacts', data).then((r) => r.data);
export const updateContact = (id, data) => api.put(`/contacts/${id}`, data).then((r) => r.data);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

// --- Oportunidades (Deals) ---
export const getDeals = () => api.get('/deals').then((r) => r.data);
export const createDeal = (data) => api.post('/deals', data).then((r) => r.data);
export const updateDeal = (id, data) => api.put(`/deals/${id}`, data).then((r) => r.data);
export const updateDealStage = (id, data) => api.patch(`/deals/${id}/stage`, data).then((r) => r.data);
export const deleteDeal = (id) => api.delete(`/deals/${id}`);

// --- Actividades ---
export const getActivities = (params) => api.get('/activities', { params }).then((r) => r.data);
export const createActivity = (data) => api.post('/activities', data).then((r) => r.data);

// --- Dashboard ---
export const getDashboardStats = () => api.get('/dashboard/stats').then((r) => r.data);

// --- Búsqueda ---
export const search = (params) => api.get('/search', { params }).then((r) => r.data);
