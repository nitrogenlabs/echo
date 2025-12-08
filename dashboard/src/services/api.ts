/**
 * Project Echo Dashboard – API Client
 * ------------------------------------
 *
 * REST API client for fetching devices, models, and sessions.
 */

const API_BASE_URL = process.env.ECHO_API_URL || "http://localhost:4000";

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchDevices() {
  return fetchJson<any[]>(`/api/devices`);
}

export async function fetchModels() {
  return fetchJson<any[]>(`/api/models`);
}

export async function fetchSessions() {
  return fetchJson<any[]>(`/api/sessions`);
}

export async function fetchState() {
  return fetchJson<any>(`/api/state`);
}

