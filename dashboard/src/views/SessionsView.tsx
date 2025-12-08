import {useFluxState} from '@nlabs/arkhamjs-utils-react';
import './View.css';

import type {EchoSession} from '../store/echoStore.js';

export const SessionsView = () => {
  const sessions = (useFluxState('echo.sessions') as Record<string, EchoSession>) ?? {};

  const sessionList = (Object.values(sessions) as EchoSession[]).sort(
    (a, b) => b.startedAt - a.startedAt
  );

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (startedAt: number, endedAt?: number) => {
    const end = endedAt || Date.now();
    const duration = Math.floor((end - startedAt) / 1000);
    return `${duration}s`;
  };

  return (
    <div className="view">
      <div className="view-header">
        <h2>Sessions / Events</h2>
      </div>
      {sessionList.length === 0 ? (
        <div className="empty-state">No sessions recorded</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Device</th>
              <th>Model</th>
              <th>Started</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessionList.map((session) => (
              <tr key={session.id}>
                <td>{session.id}</td>
                <td>{session.deviceId}</td>
                <td>{session.modelId}</td>
                <td>{formatTimestamp(session.startedAt)}</td>
                <td>{formatDuration(session.startedAt, session.endedAt)}</td>
                <td>{session.endedAt ? 'Completed' : 'Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SessionsView;

