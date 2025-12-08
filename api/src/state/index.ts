// api/src/state/index.ts
import { Flux } from "@nlabs/arkhamjs";
import {
  EchoStore,
  type EchoState,
  type EchoDevice,
  type EchoModel,
  type EchoSession,
} from "./echoStore.js";
import { logger } from "../logging/logger.js";

let initialized = false;

export function initStateLayer(): void {
  if (initialized) return;

  Flux.init({
    name: "project-echo-api",
    stores: [EchoStore],
    debug: process.env.NODE_ENV !== "production",
  });

  initialized = true;
}

// --- Selectors / helpers ---

export function getEchoState(): EchoState {
  return (
    Flux.getState<EchoState>("echo") ?? {
      devices: {},
      models: {},
      sessions: {},
    }
  );
}

export function getDevices(): Record<string, EchoDevice> {
  return Flux.getState<Record<string, EchoDevice>>("echo.devices") ?? {};
}

export function getModels(): Record<string, EchoModel> {
  return Flux.getState<Record<string, EchoModel>>("echo.models") ?? {};
}

export function getSessions(): Record<string, EchoSession> {
  return Flux.getState<Record<string, EchoSession>>("echo.sessions") ?? {};
}

export function getDevice(id: string): EchoDevice | undefined {
  return Flux.getState<EchoDevice>(`echo.devices.${id}`);
}

export function getModel(id: string): EchoModel | undefined {
  return Flux.getState<EchoModel>(`echo.models.${id}`);
}

export function getSession(id: string): EchoSession | undefined {
  return Flux.getState<EchoSession>(`echo.sessions.${id}`);
}

// --- Dispatch helpers (nice for controllers & WS handlers) ---

export function registerDevice(device: EchoDevice): void {
  Flux.dispatch({ type: "ECHO/DEVICE_REGISTER", ...device });
  logger.deviceRegistered(device.id, device.name);
}

export function updateDevice(
  update: Partial<EchoDevice> & { id: string }
): void {
  Flux.dispatch({ type: "ECHO/DEVICE_UPDATE", ...update });
  logger.deviceUpdated(update.id, update);
}

export function markDeviceOffline(id: string): void {
  Flux.dispatch({ type: "ECHO/DEVICE_OFFLINE", id });
  logger.deviceOffline(id);
}

export function registerModel(model: EchoModel): void {
  Flux.dispatch({ type: "ECHO/MODEL_REGISTER", ...model });
  logger.modelRegistered(model.id, model.name, model.backend);
}

export function markModelLoaded(id: string, loaded = true): void {
  Flux.dispatch({ type: "ECHO/MODEL_LOADED", id, loaded });
  logger.modelLoaded(id, loaded);
}

export function startSession(session: EchoSession): void {
  Flux.dispatch({ type: "ECHO/SESSION_STARTED", ...session });
  logger.sessionStarted(session.id, session.deviceId, session.modelId);
}

export function endSession(id: string, endedAt?: number): void {
  const session = getSession(id);
  Flux.dispatch({ type: "ECHO/SESSION_ENDED", id, endedAt });
  logger.sessionEnded(id, session?.deviceId, session?.modelId);
}
