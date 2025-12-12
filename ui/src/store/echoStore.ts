/**
 * Project Echo Dashboard – Client-Side Store
 * ---------------------------------------------
 *
 * Mirrors the API-side Echo state structure using ArkhamJS.
 */

import type { FluxStore } from "@nlabs/arkhamjs";

export type EchoBackend = "akida" | "onnx" | "tflite" | "cpu";
export type EchoDeviceStatus = "idle" | "busy" | "offline";

export interface EchoDevice {
  id: string;
  name?: string;
  status: EchoDeviceStatus;
  lastSeen: number;
  metadata?: Record<string, any>;
}

export interface EchoModel {
  id: string;
  name: string;
  path: string;
  backend: EchoBackend;
  loaded: boolean;
  metadata?: Record<string, any>;
}

export interface EchoSession {
  id: string;
  deviceId: string;
  modelId: string;
  startedAt: number;
  endedAt?: number;
  metadata?: Record<string, any>;
}

export interface EchoState {
  devices: Record<string, EchoDevice>;
  models: Record<string, EchoModel>;
  sessions: Record<string, EchoSession>;
}

const initialState: EchoState = {
  devices: {},
  models: {},
  sessions: {},
};

export const EchoStore: FluxStore = {
  name: "echo",
  initialState,

  action: (
    type: string,
    data: any,
    state: EchoState = initialState
  ): EchoState => {
    switch (type) {
      case "ECHO/DEVICE_REGISTER":
      case "ECHO/DEVICE_UPDATE": {
        const device: EchoDevice = data;
        return {
          ...state,
          devices: {
            ...state.devices,
            [device.id]: device,
          },
        };
      }

      case "ECHO/DEVICE_OFFLINE": {
        const { id } = data as { id: string };
        const current = state.devices[id];
        if (!current) return state;

        return {
          ...state,
          devices: {
            ...state.devices,
            [id]: {
              ...current,
              status: "offline",
              lastSeen: Date.now(),
            },
          },
        };
      }

      case "ECHO/MODEL_REGISTER":
      case "ECHO/MODEL_LOADED": {
        const model: EchoModel = data;
        return {
          ...state,
          models: {
            ...state.models,
            [model.id]: model,
          },
        };
      }

      case "ECHO/SESSION_STARTED":
      case "ECHO/SESSION_ENDED": {
        const session: EchoSession = data;
        return {
          ...state,
          sessions: {
            ...state.sessions,
            [session.id]: session,
          },
        };
      }

      case "ECHO/SYNC_STATE": {
        // Sync entire state from server
        return data as EchoState;
      }

      default:
        return state;
    }
  },
};

