import {useEffect} from 'react';
import {initStore} from './store/index.js';
import {wsService} from './services/websocket.js';
import {fetchState} from './services/api.js';
import {Flux} from '@nlabs/arkhamjs';
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
      </header>
      <main className="app-main">
        <div className="views-container">
          <DevicesView />
          <ModelsView />
          <SessionsView />
        </div>
      </main>
    </div>
  );
}

export default App;

