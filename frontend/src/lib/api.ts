// Prefer explicit VITE_API_URL when provided (dev). Otherwise use a relative '/api'
// path so the frontend can be served from any host and talk to the backend via the
// same origin proxy (recommended for production builds behind nginx/Caddy).
const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function handleResp(resp: Response) {
  const text = await resp.text();
  const json = text ? JSON.parse(text) : null;
  if (!resp.ok) {
    const err = (json && (json.detail || json.error || json.message)) || resp.statusText;
    throw new Error(err);
  }
  return json;
}

export async function registerUser(payload: { name: string; email: string; phone: string; id_type: string }) {
  const resp = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResp(resp);
}

export async function getClinics() {
  const resp = await fetch(`${API_BASE}/clinics/nearby`);
  return handleResp(resp);
}

export async function triage(payload: { user_id?: number | null; symptoms: string }) {
  const resp = await fetch(`${API_BASE}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResp(resp);
}

export async function bookAppointment(user_id: number, clinic_id: number) {
  const resp = await fetch(`${API_BASE}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, clinic_id }),
  });
  return handleResp(resp);
}

export async function getAppointment(appointment_id: number) {
  const resp = await fetch(`${API_BASE}/appointments/${appointment_id}`);
  return handleResp(resp);
}

export async function cancelAppointment(appointment_id: number) {
  const resp = await fetch(`${API_BASE}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appointment_id }),
  });
  return handleResp(resp);
}

export default {
  registerUser,
  getClinics,
  triage,
  bookAppointment,
  getAppointment,
  cancelAppointment,
};
