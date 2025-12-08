import {useFluxState} from '@nlabs/arkhamjs-utils-react';
import './View.css';

import type {EchoDevice} from '../store/echoStore.js';

function DevicesView() {
  const devices = (useFluxState('echo.devices') as Record<string, EchoDevice>) ?? {};

  const deviceList = Object.values(devices) as EchoDevice[];

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="view">
      <div className="view-header">
        <h2>Devices</h2>
      </div>
      {deviceList.length === 0 ? (
        <div className="empty-state">No devices registered</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {deviceList.map((device) => (
              <tr key={device.id}>
                <td>{device.id}</td>
                <td>{device.name || '-'}</td>
                <td>
                  <span className={`status-badge ${device.status}`}>
                    {device.status}
                  </span>
                </td>
                <td>{formatTimestamp(device.lastSeen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DevicesView;

