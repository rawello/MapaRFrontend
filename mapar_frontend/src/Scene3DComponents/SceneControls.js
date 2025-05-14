import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SceneControls.css';

export function SceneControls({ onToggleRuler, showRuler }) {
  const [rulerScale, setRulerScale] = useState(1);

  return (
    <div className="scene-controls">
      <div className="controls-section">
        <h4>3D Управление</h4>
        
        <div className="controls-group">
          <button 
            className={showRuler ? 'active' : ''} 
            onClick={() => onToggleRuler(!showRuler)}
          >
            <span className="icon">📏</span>
            <span className="label">{showRuler ? 'Скрыть' : 'Показать'} линейку</span>
          </button>
        </div>

        {showRuler && (
          <div className="ruler-controls">
            <label>Размер линейки</label>
            <div className="slider-group">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={rulerScale}
                onChange={(e) => setRulerScale(parseFloat(e.target.value))}
              />
              <span className="value">{rulerScale.toFixed(1)}x</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

SceneControls.propTypes = {
  onToggleRuler: PropTypes.func.isRequired,
  showRuler: PropTypes.bool.isRequired
};
