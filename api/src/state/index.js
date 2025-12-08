// api/src/state/index.ts
import { Flux } from "@nlabs/arkhamjs";
import { EchoStore } from "./echoStore";
import { logger } from "../logging/logger";
let initialized = false;
export function initStateLayer() {
    if (initialized) return;
    Flux.init({
        name: "project-echo-api",
        stores: [
            EchoStore
        ],
        debug: process.env.NODE_ENV !== "production"
    });
    initialized = true;
}
// --- Selectors / helpers ---
export function getEchoState() {
    return Flux.getState("echo") ?? {
        devices: {},
        models: {},
        sessions: {}
    };
}
export function getDevices() {
    return Flux.getState("echo.devices") ?? {};
}
export function getModels() {
    return Flux.getState("echo.models") ?? {};
}
export function getSessions() {
    return Flux.getState("echo.sessions") ?? {};
}
export function getDevice(id) {
    return Flux.getState(`echo.devices.${id}`);
}
export function getModel(id) {
    return Flux.getState(`echo.models.${id}`);
}
export function getSession(id) {
    return Flux.getState(`echo.sessions.${id}`);
}
// --- Dispatch helpers (nice for controllers & WS handlers) ---
export function registerDevice(device) {
    Flux.dispatch({
        type: "ECHO/DEVICE_REGISTER",
        ...device
    });
    logger.deviceRegistered(device.id, device.name);
}
export function updateDevice(update) {
    Flux.dispatch({
        type: "ECHO/DEVICE_UPDATE",
        ...update
    });
    logger.deviceUpdated(update.id, update);
}
export function markDeviceOffline(id) {
    Flux.dispatch({
        type: "ECHO/DEVICE_OFFLINE",
        id
    });
    logger.deviceOffline(id);
}
export function registerModel(model) {
    Flux.dispatch({
        type: "ECHO/MODEL_REGISTER",
        ...model
    });
    logger.modelRegistered(model.id, model.name, model.backend);
}
export function markModelLoaded(id, loaded = true) {
    Flux.dispatch({
        type: "ECHO/MODEL_LOADED",
        id,
        loaded
    });
    logger.modelLoaded(id, loaded);
}
export function startSession(session) {
    Flux.dispatch({
        type: "ECHO/SESSION_STARTED",
        ...session
    });
    logger.sessionStarted(session.id, session.deviceId, session.modelId);
}
export function endSession(id, endedAt) {
    const session = getSession(id);
    Flux.dispatch({
        type: "ECHO/SESSION_ENDED",
        id,
        endedAt
    });
    logger.sessionEnded(id, session?.deviceId, session?.modelId);
}
