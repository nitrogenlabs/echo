import {useFluxState} from '@nlabs/arkhamjs-utils-react';
import type {EchoModel} from '../store/echoStore.js';
import './View.css';

export const ModelsView = () => {
  const models = (useFluxState('echo.models') as Record<string, EchoModel>) ?? {};

  const modelList = Object.values(models) as EchoModel[];

  return (
    <div className="view">
      <div className="view-header">
        <h2>Models</h2>
      </div>
      {modelList.length === 0 ? (
        <div className="empty-state">No models registered</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Backend</th>
              <th>Loaded</th>
            </tr>
          </thead>
          <tbody>
            {modelList.map((model) => (
              <tr key={model.id}>
                <td>{model.id}</td>
                <td>{model.name}</td>
                <td>
                  <span className="backend-badge">{model.backend}</span>
                </td>
                <td>{model.loaded ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ModelsView;

