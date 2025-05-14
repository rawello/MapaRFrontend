import React from 'react';
import PropTypes from 'prop-types';
import './NodeControls.css';

const NodeControls = ({
  selectedNode,
  nodes,
  setSelectedNode,
  createNode,
  updateNode,
  deleteNode,
  isLinkingMode,
  setIsLinkingMode
}) => {
  const handleFieldChange = (field, value) => {
    setSelectedNode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePositionChange = (axis, value) => {
    const translation = selectedNode.translation.split(',');
    const index = {x: 0, y: 1, z: 2}[axis];
    translation[index] = value || 0;
    setSelectedNode(prev => ({
      ...prev,
      translation: translation.join(',')
    }));
  };

  return (
    <div className="controls">
      <h3>Управление точками</h3>
      
      <div className="button-group">
        <button onClick={createNode}>➕ Новая точка</button>
        <button onClick={updateNode}>💾 Сохранить</button>
        <button
          className={`link-button ${isLinkingMode ? 'active' : ''}`}
          onClick={() => setIsLinkingMode(!isLinkingMode)}
        >
          {isLinkingMode ? '🔗 Завершить связывание' : '🔗 Связать'}
        </button>
      </div>

      {/* Информация о режиме связывания */}
      {isLinkingMode && (
        <div className="linking-info">
          <p>Выберите две точки для создания связи между ними</p>
        </div>
      )}

      <div className="form-section">
        <label>ID:</label>
        <input
          type="text"
          value={selectedNode?.id || ''}
          readOnly
        />
      </div>      <div className="form-section">
        <label>Тип:</label>
        <select
          value={selectedNode?.type || ''}
          onChange={(e) => handleFieldChange('type', e.target.value)}
        >
          <option value="">Обычный</option>
          <option value="view">Вид</option>
        </select>
      </div>

      {selectedNode?.type === 'view' && (
        <div className="form-section">
          <label>Заголовок:</label>
          <input
            type="text"
            value={selectedNode?.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Введите заголовок для вида"
          />
        </div>
      )}

      <div className="form-section">
        <label>Связи:</label>
        <input
          type="text"
          value={selectedNode?.neighbors || ''}
          onChange={(e) => handleFieldChange('neighbors', e.target.value)}
          placeholder="ID узлов через запятую"
        />
      </div>

      <div className="coordinates">
        <div className="coord-input">
          <label>X:</label>
          <input
            type="number"
            step="0.1"
            value={selectedNode?.translation?.split(',')[0] || 0}
            onChange={(e) => handlePositionChange('x', e.target.value)}
          />
        </div>
        <div className="coord-input">
          <label>Y:</label>
          <input
            type="number"
            step="0.1"
            value={selectedNode?.translation?.split(',')[1] || 0}
          onChange={(e) => handlePositionChange('y', e.target.value)}
          />
        </div>
        <div className="coord-input">
          <label>Z:</label>
          <input
            type="number"
            step="0.1"
            value={selectedNode?.translation?.split(',')[2] || 0}
          onChange={(e) => handlePositionChange('z', e.target.value)}
          />
        </div>
      </div>

      <div className="actions">
        <button onClick={deleteNode} className="danger-button">
          ❌ Удалить
        </button>
      </div>
    </div>
  );
};

NodeControls.propTypes = {
  selectedNode: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
    neighbors: PropTypes.string,
    translation: PropTypes.string,
    quaternion: PropTypes.string,
    modelPath: PropTypes.string
  }),
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired
  })).isRequired,
  setSelectedNode: PropTypes.func.isRequired,
  createNode: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  deleteNode: PropTypes.func.isRequired,
  isLinkingMode: PropTypes.bool.isRequired,
  setIsLinkingMode: PropTypes.func.isRequired
};

NodeControls.defaultProps = {
  selectedNode: null
};

export default NodeControls;