import React from 'react';
import PropTypes from 'prop-types';
import './ModelControls.css';

export function ModelControls({ mode, setMode, onDelete, onToggleVisible, onReset, visible }) {
  return (
    <div className="model-controls">
      <button
        className={mode === 'translate' ? 'active' : ''}
        onClick={() => setMode('translate')}
      >
        🔄 Перемещение
      </button>
      <button
        className={mode === 'rotate' ? 'active' : ''}
        onClick={() => setMode('rotate')}
      >
        ↻ Поворот
      </button>
      <button
        className={mode === 'scale' ? 'active' : ''}
        onClick={() => setMode('scale')}
      >
        ↔ Масштаб
      </button>
      <div style={{ width: '100%', height: 8 }} />
      <button
        onClick={onReset}
        style={{ background: '#fbbf24', color: '#222', margin: '8px 0 0 0', width: '100%' }}
      >
        ♻️ Сбросить трансформацию
      </button>
      <button
        onClick={onToggleVisible}
        style={{ background: visible ? '#10b981' : '#e5e7eb', color: visible ? '#fff' : '#222', marginLeft: 8 }}
      >
        {visible ? 'Скрыть модель' : 'Показать модель'}
      </button>
      <button
        onClick={onDelete}
        style={{ background: '#ef4444', color: '#fff', marginLeft: 8 }}
      >
        Удалить модель
      </button>
    </div>
  );
}

ModelControls.propTypes = {
  mode: PropTypes.oneOf(['translate', 'rotate', 'scale']).isRequired,
  setMode: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onToggleVisible: PropTypes.func,
  onReset: PropTypes.func,
  visible: PropTypes.bool
};

ModelControls.defaultProps = {
  onDelete: undefined,
  onToggleVisible: undefined,
  onReset: undefined,
  visible: true
};
