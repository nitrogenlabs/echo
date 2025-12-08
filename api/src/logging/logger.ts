/**
 * Project Echo – Structured Logging
 * ---------------------------------
 *
 * Provides JSON-structured logging for inference events, state changes,
 * and WebSocket streams.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  eventType: string;
  message: string;
  deviceId?: string;
  modelId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private enabled: boolean = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private log(level: LogLevel, eventType: string, message: string, metadata?: {
    deviceId?: string;
    modelId?: string;
    sessionId?: string;
    [key: string]: any;
  }): void {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      eventType,
      message,
      ...metadata,
    };

    // Output as JSON for structured logging
    console.log(JSON.stringify(entry));
  }

  debug(eventType: string, message: string, metadata?: Record<string, any>): void {
    this.log("debug", eventType, message, metadata);
  }

  info(eventType: string, message: string, metadata?: Record<string, any>): void {
    this.log("info", eventType, message, metadata);
  }

  warn(eventType: string, message: string, metadata?: Record<string, any>): void {
    this.log("warn", eventType, message, metadata);
  }

  error(eventType: string, message: string, metadata?: Record<string, any>): void {
    this.log("error", eventType, message, metadata);
  }

  // Convenience methods for Echo-specific events

  deviceRegistered(deviceId: string, name?: string): void {
    this.info("DEVICE_REGISTERED", `Device registered: ${deviceId}`, {
      deviceId,
      name,
    });
  }

  deviceUpdated(deviceId: string, updates: Record<string, any>): void {
    this.info("DEVICE_UPDATED", `Device updated: ${deviceId}`, {
      deviceId,
      ...updates,
    });
  }

  deviceOffline(deviceId: string): void {
    this.warn("DEVICE_OFFLINE", `Device went offline: ${deviceId}`, {
      deviceId,
    });
  }

  modelRegistered(modelId: string, name: string, backend: string): void {
    this.info("MODEL_REGISTERED", `Model registered: ${modelId}`, {
      modelId,
      name,
      backend,
    });
  }

  modelLoaded(modelId: string, loaded: boolean): void {
    this.info("MODEL_LOADED", `Model ${loaded ? "loaded" : "unloaded"}: ${modelId}`, {
      modelId,
      loaded,
    });
  }

  sessionStarted(sessionId: string, deviceId: string, modelId: string): void {
    this.info("SESSION_STARTED", `Session started: ${sessionId}`, {
      sessionId,
      deviceId,
      modelId,
    });
  }

  sessionEnded(sessionId: string, deviceId?: string, modelId?: string): void {
    this.info("SESSION_ENDED", `Session ended: ${sessionId}`, {
      sessionId,
      deviceId,
      modelId,
    });
  }

  inferenceStarted(sessionId: string, deviceId: string, modelId: string): void {
    this.info("INFERENCE_STARTED", `Inference started for session: ${sessionId}`, {
      sessionId,
      deviceId,
      modelId,
    });
  }

  inferenceCompleted(
    sessionId: string,
    deviceId: string,
    modelId: string,
    duration?: number,
    outputShape?: number[]
  ): void {
    this.info("INFERENCE_COMPLETED", `Inference completed for session: ${sessionId}`, {
      sessionId,
      deviceId,
      modelId,
      duration,
      outputShape,
    });
  }

  inferenceError(sessionId: string, deviceId: string, modelId: string, error: string): void {
    this.error("INFERENCE_ERROR", `Inference error for session: ${sessionId}`, {
      sessionId,
      deviceId,
      modelId,
      error,
    });
  }

  websocketConnected(clientId: string): void {
    this.debug("WEBSOCKET_CONNECTED", `WebSocket client connected: ${clientId}`, {
      clientId,
    });
  }

  websocketDisconnected(clientId: string): void {
    this.debug("WEBSOCKET_DISCONNECTED", `WebSocket client disconnected: ${clientId}`, {
      clientId,
    });
  }

  websocketMessage(clientId: string, eventType: string, data: any): void {
    this.debug("WEBSOCKET_MESSAGE", `WebSocket message from ${clientId}`, {
      clientId,
      eventType,
      data,
    });
  }

  websocketBroadcast(eventType: string, data: any, clientCount: number): void {
    this.debug("WEBSOCKET_BROADCAST", `Broadcasting ${eventType} to ${clientCount} clients`, {
      eventType,
      clientCount,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

