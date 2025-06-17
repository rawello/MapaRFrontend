import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './ModelPanel.css';

export function ModelPanel({ onFileUpload, onTransformModeChange, modelName, modelVisible, onToggleVisible, onDelete, hasModel }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [transformMode, setTransformMode] = useState('translate');

  const handleFileUpload = (e) => {
    if (onFileUpload) onFileUpload(e.target.files?.[0] ? { id: Date.now(), name: e.target.files[0].name, file: e.target.files[0] } : null);
  };

  const handleTransformModeChange = (mode) => {
    setTransformMode(mode);
    if (onTransformModeChange) {
      onTransformModeChange(mode);
    }
  };

  const handleHeaderKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`model-panel ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="model-panel-header"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleHeaderKeyDown}
        aria-expanded={isExpanded}
        aria-controls="model-panel-content"
      >
        <h3>Управление 3D моделями</h3>
        <span className="toggle-icon" aria-hidden="true">
          {isExpanded ? '▼' : '▲'}
        </span>
      </button>
      <section 
        id="model-panel-content" 
        className="model-panel-content" 
        aria-label="Панель управления 3D моделями"
      >
        {isExpanded && (
          <>
            <div className="upload-section">
              <input
                type="file"
                id="model-upload"
                accept=".glb,.gltf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                aria-label="Загрузить 3D модель"
              />
              <button 
                onClick={() => document.getElementById('model-upload').click()}
                className="upload-button"
              >
                📁 Загрузить 3D модель
              </button>
              <p className="file-info" aria-label="Информация о поддерживаемых форматах">
                Поддерживаемые форматы: .glb, .gltf
              </p>
            </div>
            <div className="transform-controls" role="toolbar" aria-label="Инструменты трансформации">
              <div className="control-group">
                <button 
                  className={`control-button ${transformMode === 'translate' ? 'active' : ''}`}
                  onClick={() => handleTransformModeChange('translate')}
                  aria-pressed={transformMode === 'translate'}
                >
                  🔄 Перемещение (G)
                </button>
                <button 
                  className={`control-button ${transformMode === 'rotate' ? 'active' : ''}`}
                  onClick={() => handleTransformModeChange('rotate')}
                  aria-pressed={transformMode === 'rotate'}
                >
                  ↻ Поворот (R)
                </button>
                <button 
                  className={`control-button ${transformMode === 'scale' ? 'active' : ''}`}
                  onClick={() => handleTransformModeChange('scale')}
                  aria-pressed={transformMode === 'scale'}
                >
                  ↔ Масштаб (S)
                </button>
              </div>
            </div>
            <div className="model-list">
              <h4>Загруженные модели</h4>
              <ul className="model-items">
                {hasModel ? (
                  <li className="model-item">
                    <span className="model-name">{modelName}</span>
                    <div className="model-actions">
                      <button 
                        className="action-button" 
                        title="Скрыть/Показать"
                        aria-label={`Скрыть/Показать модель ${modelName}`}
                        onClick={onToggleVisible}
                        style={{ background: modelVisible ? '#10b981' : '#e5e7eb', color: modelVisible ? '#fff' : '#222' }}
                      >
                        <span aria-hidden="true">👁️</span>
                      </button>
                      <button 
                        className="action-button danger" 
                        title="Удалить"
                        aria-label={`Удалить модель ${modelName}`}
                        onClick={onDelete}
                        style={{ background: '#ef4444', color: '#fff', marginLeft: 8 }}
                      >
                        <span aria-hidden="true">❌</span>
                      </button>
                    </div>
                  </li>
                ) : (
                  <li className="empty-list">
                    <p>Нет загруженных моделей</p>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

ModelPanel.propTypes = {
  onFileUpload: PropTypes.func,
  onTransformModeChange: PropTypes.func,
  modelName: PropTypes.string,
  modelVisible: PropTypes.bool,
  onToggleVisible: PropTypes.func,
  onDelete: PropTypes.func,
  hasModel: PropTypes.bool
};