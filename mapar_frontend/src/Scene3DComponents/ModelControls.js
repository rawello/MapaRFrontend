import React, { useState } from 'react';
import { TransformControls } from '@react-three/drei';
import PropTypes from 'prop-types';
import './ModelControls.css';

export function ModelControls({ modelRef, onTransform }) {
  const [mode, setMode] = useState('translate'); // translate, rotate, or scale
  const [showControls, setShowControls] = useState(true);

  return (
    <>
      {showControls && modelRef.current && (
        <TransformControls
          object={modelRef.current}
          mode={mode}
          onObjectChange={(e) => {
            if (onTransform) {
              const obj = e.target.object;
              onTransform({
                position: obj.position.toArray(),
                rotation: obj.rotation.toArray(),
                scale: obj.scale.toArray()
              });
            }
          }}
        />
      )}

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
        <button
          className={showControls ? 'active' : ''}
          onClick={() => setShowControls(!showControls)}
        >
          👁 {showControls ? 'Скрыть' : 'Показать'} управление
        </button>
      </div>
    </>
  );
}

ModelControls.propTypes = {
  modelRef: PropTypes.shape({
    current: PropTypes.object
  }),
  onTransform: PropTypes.func
};

ModelControls.defaultProps = {
  modelRef: null,
  onTransform: undefined
};
