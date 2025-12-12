# Project Echo Dashboard

## Overview

The Project Echo Dashboard is a real-time web interface for monitoring and managing neuromorphic edge computing devices, models, and inference sessions. Built with React and TypeScript, it provides a centralized view of your Project Echo deployment, enabling you to track device status, manage AI models, and monitor inference activity across your edge computing infrastructure.

## Features

### Device Management
- View all registered devices in your Echo network
- Monitor device status (idle, busy, offline)
- Track last seen timestamps for each device
- Real-time status updates via WebSocket connections

### Model Management
- Browse all deployed AI models
- View model metadata including backend type (Akida, ONNX, TFLite, CPU)
- Monitor model loading status
- Track model deployment information

### Session Monitoring
- View active and completed inference sessions
- Track session duration and timestamps
- Monitor which devices and models are being used
- Real-time session event streaming

### Real-Time Updates
- Automatic state synchronization with the Echo API
- WebSocket-based event streaming for instant updates
- No manual refresh required

## Prerequisites

Before setting up the dashboard, ensure you have:

- **Node.js 24+** installed on your system
- **npm** or **yarn** package manager
- The **Echo API server** running (default: `http://localhost:4000`)
- Network access to the API server

## Installation

1. Navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   This will install all required packages including:
   - React and React DOM
   - TypeScript
   - ArkhamJS and ArkhamJS React utilities
   - Lex build tool

## Configuration

### API Connection

The dashboard is pre-configured to connect to the Echo API at `http://localhost:4000`. If your API is running on a different host or port, you can configure it using environment variables.

Create a `.env` file in the dashboard directory:

```env
ECHO_API_URL=http://localhost:4000
ECHO_API_WS_URL=ws://localhost:4000
```

### ESLint Configuration

The dashboard uses ESLint for code quality and linting. The ESLint configuration extends from `@nlabs/lex`, which provides a standardized set of rules for TypeScript and React projects.

The configuration is defined in `.eslintrc.cjs`:

```javascript
module.exports = {
  extends: ['@nlabs/lex'],
  // Additional custom rules or overrides can be specified here
  rules: {
    // Add project-specific rule overrides if needed
  },
}
```

This ensures consistency with Lex's recommended linting rules. For details on the specific rules and configurations provided by `@nlabs/lex`, refer to the Lex documentation.

You can run the linter manually:

```bash
npm run lint
```

## Running the Dashboard

### Development Mode

Start the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173` by default. The development server includes:
- Hot module replacement for instant updates
- Source maps for debugging
- Automatic API proxy configuration

### Production Build

Build the dashboard for production:

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory. The build includes:
- Minified JavaScript and CSS
- Optimized asset bundling
- TypeScript compilation

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

This serves the production build locally for testing before deployment.

## Project Structure

```
dashboard/
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   ├── store/               # ArkhamJS state management
│   │   ├── echoStore.ts     # Echo state store definition
│   │   └── index.ts         # Store initialization
│   ├── services/            # API and WebSocket clients
│   │   ├── api.ts           # REST API client
│   │   └── websocket.ts     # WebSocket client
│   └── views/               # Dashboard views
│       ├── DevicesView.tsx  # Devices management view
│       ├── ModelsView.tsx   # Models management view
│       ├── SessionsView.tsx # Sessions monitoring view
│       └── View.css         # View-specific styles
├── index.html               # HTML template
├── lex.config.js            # Lex build tool configuration
├── .eslintrc.cjs            # ESLint configuration (extends @nlabs/lex)
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies and scripts
└── README.md               # This file
```

## State Management

The dashboard uses ArkhamJS for global state management, mirroring the state structure used in the Echo API. The state includes:

- **Devices**: Registered edge devices and their status
- **Models**: Deployed AI models and their metadata
- **Sessions**: Active and completed inference sessions

State updates are synchronized in real-time via WebSocket connections, ensuring the dashboard always reflects the current state of your Echo deployment.

## API Integration

The dashboard communicates with the Echo API through two channels:

1. **REST API**: Used for initial data fetching and querying specific resources
   - `GET /api/state` - Fetch complete state snapshot
   - `GET /api/devices` - List all devices
   - `GET /api/models` - List all models
   - `GET /api/sessions` - List all sessions

2. **WebSocket**: Used for real-time event streaming
   - Device registration and updates
   - Model registration and loading events
   - Session start and end events
   - Automatic reconnection on connection loss

## Troubleshooting

### Dashboard won't connect to API

- Verify the Echo API server is running: `curl http://localhost:4000/health`
- Check that the API URL in your `.env` file matches your API server address
- Ensure there are no firewall rules blocking the connection

### WebSocket connection fails

- Verify WebSocket support in your browser
- Check that the API server is configured to accept WebSocket connections
- Review browser console for connection error messages

### State not updating

- Check browser console for WebSocket connection status
- Verify that the API server is broadcasting events
- Try refreshing the page to re-establish connections

### Build errors

- Ensure all dependencies are installed: `npm install`
- Check TypeScript version compatibility
- Review `tsconfig.json` for configuration issues

## Development

### Adding New Views

1. Create a new component in `src/views/`
2. Use `useFluxState` hook from `@nlabs/arkhamjs-utils-react` to access state
3. Import and add the view to `App.tsx`

### Extending State

1. Update `src/store/echoStore.ts` with new state structure
2. Add corresponding action handlers
3. Update API client in `src/services/api.ts` if needed
4. Handle new WebSocket event types in `src/services/websocket.ts`

### Styling

- Global styles: `src/index.css`
- Application styles: `src/App.css`
- View-specific styles: `src/views/View.css`

### Linting

The dashboard uses ESLint with configuration extending from `@nlabs/lex`. The ESLint configuration is defined in `.eslintrc.cjs` and inherits Lex's recommended rules for TypeScript and React projects.

To customize linting rules, modify `.eslintrc.cjs` and add project-specific overrides in the `rules` section. For information about the rules provided by `@nlabs/lex`, consult the Lex documentation.

## License

This project is part of Project Echo and is licensed under the MIT License.

