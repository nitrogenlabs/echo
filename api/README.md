# Project Echo API

## Overview

The Project Echo API is a Node.js server that provides REST endpoints and WebSocket streaming for managing neuromorphic edge computing infrastructure. It serves as the central coordination layer for devices, AI models, and inference sessions, enabling real-time monitoring and control of your Echo deployment.

Built with TypeScript and using ArkhamJS for state management, the API maintains a consistent view of your edge computing network and broadcasts state changes to connected clients in real-time.

## Features

### REST API

- Device registration and management
- Model registration and tracking
- Session lifecycle management
- Complete state querying
- Health check endpoint

### WebSocket Streaming

- Real-time event broadcasting
- Automatic client connection management
- State synchronization for connected clients
- Event-driven architecture

### State Management

- Centralized state using ArkhamJS
- Persistent in-memory state
- Type-safe state operations
- Automatic state synchronization

### Structured Logging

- JSON-formatted log output
- Event-based logging for all operations
- Configurable log levels
- Integration with all API operations

## Prerequisites

Before setting up the API, ensure you have:

- **Node.js 24+** installed on your system
- **npm** or **yarn** package manager
- Network access for WebSocket connections (if using remote clients)

## Installation

1. Navigate to the API directory:

   ```bash
   cd api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

   This will install all required packages including:
   - ArkhamJS for state management
   - WebSocket server (ws)
   - TypeScript and development tools

## Configuration

The API server can be configured using environment variables:

- `PORT`: Server port (default: `4000`)
- `NODE_ENV`: Environment mode (`development` or `production`)

Create a `.env` file in the api directory:

```env
PORT=4000
NODE_ENV=development
```

## Running the API

### Development Mode

Start the development server with hot reloading:

```bash
npm run dev
```

The API will be available at `http://localhost:4000` (or your configured port). The development server automatically restarts when source files change.

### Production Mode

Build the TypeScript code:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Type Checking

Run TypeScript type checking without building:

```bash
npm run type-check
```

## API Endpoints

### Health Check

**GET** `/health`

Returns server health status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Complete State Endpoint

**GET** `/api/state`

Retrieve the complete Echo state including all devices, models, and sessions.

**Response:**

```json
{
  "devices": { ... },
  "models": { ... },
  "sessions": { ... }
}
```

### Devices Endpoint

**GET** `/api/devices`

List all registered devices.

**Response:**

```json
[
  {
    "id": "device-1",
    "name": "Raspberry Pi 5",
    "status": "idle",
    "lastSeen": 1704067200000,
    "metadata": { ... }
  }
]
```

**GET** `/api/devices/:id`

Get a specific device by ID.

**POST** `/api/devices`

Register a new device.

**Request Body:**

```json
{
  "id": "device-1",
  "name": "Raspberry Pi 5",
  "status": "idle",
  "lastSeen": 1704067200000,
  "metadata": { ... }
}
```

### Models Endpoint

**GET** `/api/models`

List all registered models.

**Response:**

```json
[
  {
    "id": "model-1",
    "name": "Vision Classifier",
    "path": "/path/to/model.ez",
    "backend": "akida",
    "loaded": true,
    "metadata": { ... }
  }
]
```

**GET** `/api/models/:id`

Get a specific model by ID.

**POST** `/api/models`

Register a new model.

**Request Body:**

```json
{
  "id": "model-1",
  "name": "Vision Classifier",
  "path": "/path/to/model.ez",
  "backend": "akida",
  "loaded": false,
  "metadata": { ... }
}
```

### Sessions Endpoint

**GET** `/api/sessions`

List all inference sessions.

**Response:**

```json
[
  {
    "id": "session-1",
    "deviceId": "device-1",
    "modelId": "model-1",
    "startedAt": 1704067200000,
    "endedAt": 1704067300000,
    "metadata": { ... }
  }
]
```

**POST** `/api/sessions`

Start a new inference session.

**Request Body:**

```json
{
  "id": "session-1",
  "deviceId": "device-1",
  "modelId": "model-1",
  "startedAt": 1704067200000,
  "metadata": { ... }
}
```

## WebSocket Events

The API provides a WebSocket server on the same port as the HTTP server. Connect to `ws://localhost:4000` to receive real-time events.

### Connection

When a client connects, it receives a welcome message:

```json
{
  "type": "connected",
  "clientId": "client_1_1704067200000",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Event Types

The server broadcasts the following event types:

- `device_registered` - New device registered
- `device_updated` - Device status or metadata updated
- `device_offline` - Device marked as offline
- `model_registered` - New model registered
- `model_loaded` - Model loading status changed
- `session_started` - New inference session started
- `session_ended` - Inference session completed

### Event Format

All events follow this structure:

```json
{
  "type": "event_type",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Client Messages

Clients can send messages to the server (future feature for subscription management):

```json
{
  "type": "subscribe",
  "eventTypes": ["device_registered", "session_started"]
}
```

## State Management System

The API uses ArkhamJS for centralized state management. The state structure includes:

### State Structure

```typescript
{
  devices: Record<string, EchoDevice>,
  models: Record<string, EchoModel>,
  sessions: Record<string, EchoSession>
}
```

### State Actions

State is updated through ArkhamJS actions:

- `ECHO/DEVICE_REGISTER` - Register a new device
- `ECHO/DEVICE_UPDATE` - Update device information
- `ECHO/DEVICE_OFFLINE` - Mark device as offline
- `ECHO/MODEL_REGISTER` - Register a new model
- `ECHO/MODEL_LOADED` - Update model loading status
- `ECHO/SESSION_STARTED` - Start a new session
- `ECHO/SESSION_ENDED` - End a session

### State Helpers

The API provides helper functions for state operations:

- `getEchoState()` - Get complete state
- `getDevices()` - Get all devices
- `getModels()` - Get all models
- `getSessions()` - Get all sessions
- `registerDevice(device)` - Register device
- `updateDevice(update)` - Update device
- `registerModel(model)` - Register model
- `startSession(session)` - Start session
- `endSession(id)` - End session

## Logging

The API includes structured JSON logging for all operations. Logs are output to stdout in JSON format for easy parsing and analysis.

### Log Format

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "eventType": "DEVICE_REGISTERED",
  "message": "Device registered: device-1",
  "deviceId": "device-1",
  "name": "Raspberry Pi 5"
}
```

### Log Levels

- `debug` - Debug information (WebSocket connections, etc.)
- `info` - General information (device/model/session events)
- `warn` - Warnings (device offline, etc.)
- `error` - Errors (connection failures, etc.)

### Log Events

The logger tracks the following event types:

- `SERVER_STARTED` - Server started
- `DEVICE_REGISTERED` - Device registered
- `DEVICE_UPDATED` - Device updated
- `DEVICE_OFFLINE` - Device went offline
- `MODEL_REGISTERED` - Model registered
- `MODEL_LOADED` - Model loading status changed
- `SESSION_STARTED` - Session started
- `SESSION_ENDED` - Session ended
- `INFERENCE_STARTED` - Inference started
- `INFERENCE_COMPLETED` - Inference completed
- `INFERENCE_ERROR` - Inference error
- `WEBSOCKET_CONNECTED` - WebSocket client connected
- `WEBSOCKET_DISCONNECTED` - WebSocket client disconnected
- `WEBSOCKET_BROADCAST` - Event broadcast to clients

## Project Structure

```text
api/
├── src/
│   ├── httpServer.ts          # HTTP and WebSocket server
│   ├── logging/
│   │   └── logger.ts          # Structured logging utility
│   └── state/
│       ├── echoStore.ts       # ArkhamJS store definition
│       ├── index.ts            # State helpers and initialization
│       └── server.ts           # Server entry point
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## CORS Configuration

The API includes CORS headers to allow cross-origin requests. Currently configured to allow all origins (`*`). For production deployments, consider restricting this to specific domains.

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

Error responses include an error message:

```json
{
  "error": "Device not found"
}
```

## Troubleshooting

### Server won't start

- Verify Node.js version: `node --version` (should be 24+)
- Check that port 4000 (or your configured port) is not in use
- Review error messages in the console
- Ensure all dependencies are installed: `npm install`

### WebSocket connections fail

- Verify the server is running and accessible
- Check firewall settings for WebSocket connections
- Ensure clients are using the correct WebSocket URL
- Review server logs for connection errors

### State not persisting

- The API uses in-memory state (not persisted to disk)
- State is lost on server restart
- For persistence, consider implementing state persistence layer

### Type errors

- Run type checking: `npm run type-check`
- Ensure TypeScript is properly configured
- Check that all type definitions are installed

## Development

### Adding New Endpoints

1. Add route handler in `src/httpServer.ts` in the `handleApiRequest` method
2. Add corresponding state action in `src/state/echoStore.ts` if needed
3. Add state helper function in `src/state/index.ts`
4. Update logging in the endpoint handler

### Adding New WebSocket Events

1. Add event type to the broadcast calls in `src/httpServer.ts`
2. Add corresponding log event in `src/logging/logger.ts`
3. Update client documentation with new event format

### Extending State

1. Update `EchoState` interface in `src/state/echoStore.ts`
2. Add new action handlers in the store
3. Add state helper functions in `src/state/index.ts`
4. Update API endpoints to handle new state structure

### Testing

The API can be tested using:

- `curl` for REST endpoints
- Browser WebSocket clients for WebSocket testing
- Postman or similar tools for API testing
- The Echo Dashboard for integrated testing

Example curl commands:

```bash
# Health check
curl http://localhost:4000/health

# Get all devices
curl http://localhost:4000/api/devices

# Register a device
curl -X POST http://localhost:4000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"id":"test-device","name":"Test Device","status":"idle","lastSeen":1704067200000}'
```

## Integration with Dashboard

The API is designed to work seamlessly with the Project Echo Dashboard. The dashboard connects to the API via:

- REST API for initial state loading
- WebSocket for real-time updates

Ensure the API is running before starting the dashboard, and that both are configured to use compatible ports and URLs.

## License

This project is part of Project Echo and is licensed under the MIT License.
