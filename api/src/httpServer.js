/**
 * Project Echo – HTTP Server with WebSocket Support
 * -------------------------------------------------
 *
 * Provides REST API endpoints and WebSocket streaming for real-time
 * inference events and state updates.
 */ import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { URL } from "url";
import { logger } from "./logging/logger";
import { getEchoState, getDevices, getModels, getSessions, registerDevice, registerModel, startSession } from "./state";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
class EchoServer {
    httpServer;
    wss;
    clients = new Map();
    clientCounter = 0;
    constructor(){
        this.httpServer = createHttpServer(this.handleRequest.bind(this));
        this.wss = new WebSocketServer({
            server: this.httpServer
        });
        this.setupWebSocket();
    }
    handleRequest(req, res) {
        const url = new URL(req.url || "/", `http://${req.headers.host}`);
        const path = url.pathname;
        const method = req.method;
        // CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        if (method === "OPTIONS") {
            res.writeHead(200);
            res.end();
            return;
        }
        // Health check
        if (path === "/health" && method === "GET") {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                status: "ok",
                timestamp: new Date().toISOString()
            }));
            return;
        }
        // REST API endpoints
        if (path.startsWith("/api/")) {
            this.handleApiRequest(req, res, path, method);
            return;
        }
        // 404
        res.writeHead(404, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            error: "Not found"
        }));
    }
    handleApiRequest(req, res, path, method) {
        res.setHeader("Content-Type", "application/json");
        // GET /api/state - Get full state
        if (path === "/api/state" && method === "GET") {
            const state = getEchoState();
            res.writeHead(200);
            res.end(JSON.stringify(state));
            return;
        }
        // GET /api/devices - List devices
        if (path === "/api/devices" && method === "GET") {
            const devices = getDevices();
            res.writeHead(200);
            res.end(JSON.stringify(Object.values(devices)));
            return;
        }
        // GET /api/devices/:id - Get device
        const deviceMatch = path.match(/^\/api\/devices\/(.+)$/);
        if (deviceMatch && method === "GET") {
            const deviceId = deviceMatch[1];
            const devices = getDevices();
            const device = devices[deviceId];
            if (device) {
                res.writeHead(200);
                res.end(JSON.stringify(device));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({
                    error: "Device not found"
                }));
            }
            return;
        }
        // POST /api/devices - Register device
        if (path === "/api/devices" && method === "POST") {
            this.readBody(req).then((body)=>{
                const device = JSON.parse(body);
                registerDevice(device);
                logger.deviceRegistered(device.id, device.name);
                this.broadcast("device_registered", device);
                res.writeHead(201);
                res.end(JSON.stringify(device));
            }).catch((err)=>{
                res.writeHead(400);
                res.end(JSON.stringify({
                    error: err.message
                }));
            });
            return;
        }
        // GET /api/models - List models
        if (path === "/api/models" && method === "GET") {
            const models = getModels();
            res.writeHead(200);
            res.end(JSON.stringify(Object.values(models)));
            return;
        }
        // GET /api/models/:id - Get model
        const modelMatch = path.match(/^\/api\/models\/(.+)$/);
        if (modelMatch && method === "GET") {
            const modelId = modelMatch[1];
            const models = getModels();
            const model = models[modelId];
            if (model) {
                res.writeHead(200);
                res.end(JSON.stringify(model));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({
                    error: "Model not found"
                }));
            }
            return;
        }
        // POST /api/models - Register model
        if (path === "/api/models" && method === "POST") {
            this.readBody(req).then((body)=>{
                const model = JSON.parse(body);
                registerModel(model);
                logger.modelRegistered(model.id, model.name, model.backend);
                this.broadcast("model_registered", model);
                res.writeHead(201);
                res.end(JSON.stringify(model));
            }).catch((err)=>{
                res.writeHead(400);
                res.end(JSON.stringify({
                    error: err.message
                }));
            });
            return;
        }
        // GET /api/sessions - List sessions
        if (path === "/api/sessions" && method === "GET") {
            const sessions = getSessions();
            res.writeHead(200);
            res.end(JSON.stringify(Object.values(sessions)));
            return;
        }
        // POST /api/sessions - Start session
        if (path === "/api/sessions" && method === "POST") {
            this.readBody(req).then((body)=>{
                const session = JSON.parse(body);
                startSession(session);
                logger.sessionStarted(session.id, session.deviceId, session.modelId);
                this.broadcast("session_started", session);
                res.writeHead(201);
                res.end(JSON.stringify(session));
            }).catch((err)=>{
                res.writeHead(400);
                res.end(JSON.stringify({
                    error: err.message
                }));
            });
            return;
        }
        // 404
        res.writeHead(404);
        res.end(JSON.stringify({
            error: "Not found"
        }));
    }
    readBody(req) {
        return new Promise((resolve, reject)=>{
            let body = "";
            req.on("data", (chunk)=>{
                body += chunk.toString();
            });
            req.on("end", ()=>{
                resolve(body);
            });
            req.on("error", reject);
        });
    }
    setupWebSocket() {
        this.wss.on("connection", (ws, req)=>{
            const clientId = `client_${++this.clientCounter}_${Date.now()}`;
            const client = {
                id: clientId,
                ws,
                connectedAt: Date.now()
            };
            this.clients.set(clientId, client);
            logger.websocketConnected(clientId);
            // Send welcome message
            ws.send(JSON.stringify({
                type: "connected",
                clientId,
                timestamp: new Date().toISOString()
            }));
            // Handle messages from client
            ws.on("message", (data)=>{
                try {
                    const message = JSON.parse(data.toString());
                    logger.websocketMessage(clientId, message.type || "unknown", message);
                    this.handleWebSocketMessage(clientId, message);
                } catch (err) {
                    logger.error("WEBSOCKET_PARSE_ERROR", `Failed to parse message from ${clientId}`, {
                        clientId,
                        error: err instanceof Error ? err.message : String(err)
                    });
                }
            });
            // Handle disconnect
            ws.on("close", ()=>{
                this.clients.delete(clientId);
                logger.websocketDisconnected(clientId);
            });
            ws.on("error", (err)=>{
                logger.error("WEBSOCKET_ERROR", `WebSocket error for ${clientId}`, {
                    clientId,
                    error: err.message
                });
            });
        });
    }
    handleWebSocketMessage(clientId, message) {
        // Handle client requests (e.g., subscribe to events)
        if (message.type === "subscribe") {
        // Client can subscribe to specific event types
        // For now, we broadcast all events to all clients
        // TODO: Implement selective subscription
        }
    }
    broadcast(eventType, data) {
        const message = JSON.stringify({
            type: eventType,
            data,
            timestamp: new Date().toISOString()
        });
        let sentCount = 0;
        this.clients.forEach((client)=>{
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
                sentCount++;
            }
        });
        logger.websocketBroadcast(eventType, data, sentCount);
    }
    listen(port = PORT) {
        return new Promise((resolve)=>{
            this.httpServer.listen(port, ()=>{
                logger.info("SERVER_STARTED", `Echo API server running on http://localhost:${port}`, {
                    port
                });
                resolve();
            });
        });
    }
    close() {
        return new Promise((resolve)=>{
            this.wss.close(()=>{
                this.httpServer.close(()=>{
                    resolve();
                });
            });
        });
    }
}
let serverInstance = null;
export function createServer() {
    if (serverInstance) {
        return serverInstance;
    }
    serverInstance = new EchoServer();
    return serverInstance;
}
export async function startServer(port = PORT) {
    const server = createServer();
    await server.listen(port);
    return server;
}
