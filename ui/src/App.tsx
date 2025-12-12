import {useEffect} from 'react';
import {initStore} from './store/index.js';
import {wsService} from './services/websocket.js';
import {fetchState} from './services/api.js';
import {Flux} from '@nlabs/arkhamjs';
import ChatView from './views/ChatView.js';
import DevicesView from './views/DevicesView.js';
import ModelsView from './views/ModelsView.js';
import SessionsView from './views/SessionsView.js';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize ArkhamJS store
    initStore();

    // Connect WebSocket
    wsService.connect();

    // Fetch initial state from API
    fetchState()
      .then((state) => {
        Flux.dispatch({type: 'ECHO/SYNC_STATE', ...state});
      })
      .catch((err) => {
        console.error('Failed to fetch initial state:', err);
      });

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Echo Dashboard</h1>
        <p className="app-subtitle">AI-Powered Neuromorphic Edge Computing</p>
      </header>
      <main className="app-main">
        <div className="dashboard-layout">
          <div className="dashboard-primary">
            <ChatView />
          </div>
          <div className="dashboard-secondary">
            <DevicesView />
            <ModelsView />
            <SessionsView />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

