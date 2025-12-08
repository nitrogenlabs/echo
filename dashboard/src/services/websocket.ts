/**
 * Project Echo Dashboard – WebSocket Client
 * ------------------------------------------
 *
 * Connects to the API WebSocket endpoint and dispatches ArkhamJS actions
 * to keep the dashboard state in sync.
 */

import { Flux } from "@nlabs/arkhamjs";

// WebSocket connects to the same server as the HTTP API
const API_WS_URL = process.env.ECHO_API_WS_URL || "ws://localhost:4000";

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: number | null = null;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(API_WS_URL);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.attemptReconnect();
      };
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
      this.attemptReconnect();
    }
  }

  private handleMessage(message: any): void {
    const { type, data } = message;

    switch (type) {
      case "connected":
        console.log("Connected to Echo API:", data.clientId);
        break;

      case "device_registered":
      case "device_updated":
        Flux.dispatch({ type: "ECHO/DEVICE_UPDATE", ...data });
        break;

      case "device_offline":
        Flux.dispatch({ type: "ECHO/DEVICE_OFFLINE", id: data.id });
        break;

      case "model_registered":
      case "model_loaded":
        Flux.dispatch({ type: "ECHO/MODEL_REGISTER", ...data });
        break;

      case "session_started":
        Flux.dispatch({ type: "ECHO/SESSION_STARTED", ...data });
        break;

      case "session_ended":
        Flux.dispatch({ type: "ECHO/SESSION_ENDED", ...data });
        break;

      default:
        console.log("Unknown WebSocket message type:", type, data);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }
}

export const wsService = new WebSocketService();
