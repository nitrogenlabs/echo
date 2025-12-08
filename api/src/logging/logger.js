/**
 * Project Echo – Structured Logging
 * ---------------------------------
 *
 * Provides JSON-structured logging for inference events, state changes,
 * and WebSocket streams.
 */ class Logger {
    enabled = true;
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    log(level, eventType, message, metadata) {
        if (!this.enabled) return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            eventType,
            message,
            ...metadata
        };
        // Output as JSON for structured logging
        console.log(JSON.stringify(entry));
    }
    debug(eventType, message, metadata) {
        this.log("debug", eventType, message, metadata);
    }
    info(eventType, message, metadata) {
        this.log("info", eventType, message, metadata);
    }
    warn(eventType, message, metadata) {
        this.log("warn", eventType, message, metadata);
    }
    error(eventType, message, metadata) {
        this.log("error", eventType, message, metadata);
    }
    // Convenience methods for Echo-specific events
    deviceRegistered(deviceId, name) {
        this.info("DEVICE_REGISTERED", `Device registered: ${deviceId}`, {
            deviceId,
            name
        });
    }
    deviceUpdated(deviceId, updates) {
        this.info("DEVICE_UPDATED", `Device updated: ${deviceId}`, {
            deviceId,
            ...updates
        });
    }
    deviceOffline(deviceId) {
        this.warn("DEVICE_OFFLINE", `Device went offline: ${deviceId}`, {
            deviceId
        });
    }
    modelRegistered(modelId, name, backend) {
        this.info("MODEL_REGISTERED", `Model registered: ${modelId}`, {
            modelId,
            name,
            backend
        });
    }
    modelLoaded(modelId, loaded) {
        this.info("MODEL_LOADED", `Model ${loaded ? "loaded" : "unloaded"}: ${modelId}`, {
            modelId,
            loaded
        });
    }
    sessionStarted(sessionId, deviceId, modelId) {
        this.info("SESSION_STARTED", `Session started: ${sessionId}`, {
            sessionId,
            deviceId,
            modelId
        });
    }
    sessionEnded(sessionId, deviceId, modelId) {
        this.info("SESSION_ENDED", `Session ended: ${sessionId}`, {
            sessionId,
            deviceId,
            modelId
        });
    }
    inferenceStarted(sessionId, deviceId, modelId) {
        this.info("INFERENCE_STARTED", `Inference started for session: ${sessionId}`, {
            sessionId,
            deviceId,
            modelId
        });
    }
    inferenceCompleted(sessionId, deviceId, modelId, duration, outputShape) {
        this.info("INFERENCE_COMPLETED", `Inference completed for session: ${sessionId}`, {
            sessionId,
            deviceId,
            modelId,
            duration,
            outputShape
        });
    }
    inferenceError(sessionId, deviceId, modelId, error) {
        this.error("INFERENCE_ERROR", `Inference error for session: ${sessionId}`, {
            sessionId,
            deviceId,
            modelId,
            error
        });
    }
    websocketConnected(clientId) {
        this.debug("WEBSOCKET_CONNECTED", `WebSocket client connected: ${clientId}`, {
            clientId
        });
    }
    websocketDisconnected(clientId) {
        this.debug("WEBSOCKET_DISCONNECTED", `WebSocket client disconnected: ${clientId}`, {
            clientId
        });
    }
    websocketMessage(clientId, eventType, data) {
        this.debug("WEBSOCKET_MESSAGE", `WebSocket message from ${clientId}`, {
            clientId,
            eventType,
            data
        });
    }
    websocketBroadcast(eventType, data, clientCount) {
        this.debug("WEBSOCKET_BROADCAST", `Broadcasting ${eventType} to ${clientCount} clients`, {
            eventType,
            clientCount
        });
    }
}
// Export singleton instance
export const logger = new Logger();
