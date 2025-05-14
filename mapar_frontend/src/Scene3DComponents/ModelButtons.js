import React from 'react';
import PropTypes from 'prop-types';
import './ModelControls.css';

export function ModelButtons({ onFileUpload }) {
  return (
    <div className="model-buttons">
      <input
        type="file"
        id="model-upload"
        accept=".glb,.gltf"
        onChange={onFileUpload}
        style={{ display: 'none' }}
      />
      <label htmlFor="model-upload" className="upload-button">
        📁 Загрузить 3D модель
      </label>
      <div className="model-info">
        <p>Поддерживаемые форматы: .glb, .gltf</p>
        <p>Масштаб: используйте инструмент масштабирования (S)</p>
        <p>Поворот: используйте инструмент поворота (R)</p>
        <p>Перемещение: используйте инструмент перемещения (G)</p>
      </div>
    </div>
  );
}

ModelButtons.propTypes = {
  onFileUpload: PropTypes.func.isRequired
};
