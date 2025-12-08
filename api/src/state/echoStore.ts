// api/src/state/echoStore.ts
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
  path: string; // filesystem path for the model
  backend: EchoBackend; // akida | onnx | tflite | cpu
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

  // main reducer
  action: (
    type: string,
    data: any,
    state: EchoState = initialState
  ): EchoState => {
    switch (type) {
      case "ECHO/DEVICE_REGISTER": {
        const device: EchoDevice = data;
        return {
          ...state,
          devices: {
            ...state.devices,
            [device.id]: device,
          },
        };
      }

      case "ECHO/DEVICE_UPDATE": {
        const deviceUpdate: Partial<EchoDevice> & { id: string } = data;
        const current = state.devices[deviceUpdate.id];

        if (!current) return state;

        return {
          ...state,
          devices: {
            ...state.devices,
            [deviceUpdate.id]: {
              ...current,
              ...deviceUpdate,
              lastSeen: deviceUpdate.lastSeen ?? Date.now(),
            },
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

      case "ECHO/MODEL_REGISTER": {
        const model: EchoModel = data;
        return {
          ...state,
          models: {
            ...state.models,
            [model.id]: model,
          },
        };
      }

      case "ECHO/MODEL_LOADED": {
        const { id, loaded = true } = data as { id: string; loaded?: boolean };
        const current = state.models[id];
        if (!current) return state;

        return {
          ...state,
          models: {
            ...state.models,
            [id]: {
              ...current,
              loaded,
            },
          },
        };
      }

      case "ECHO/SESSION_STARTED": {
        const session: EchoSession = data;
        return {
          ...state,
          sessions: {
            ...state.sessions,
            [session.id]: session,
          },
        };
      }

      case "ECHO/SESSION_ENDED": {
        const { id, endedAt = Date.now() } = data as {
          id: string;
          endedAt?: number;
        };
        const current = state.sessions[id];
        if (!current) return state;

        return {
          ...state,
          sessions: {
            ...state.sessions,
            [id]: {
              ...current,
              endedAt,
            },
          },
        };
      }

      default:
        return state;
    }
  },
};
