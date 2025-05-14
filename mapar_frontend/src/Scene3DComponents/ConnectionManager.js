import React from 'react';
import { Line, Html } from '@react-three/drei';
import PropTypes from 'prop-types';

export function ConnectionManager({ 
  nodes, 
  connections, 
  onAddConnection, 
  onRemoveConnection,
  isLinkingMode,
  linkingSourceId,
  hoveredNodeId
}) {
  // Get source node if we're linking
  const sourceNode = nodes.find(n => n.id === linkingSourceId);
  const targetNode = nodes.find(n => n.id === hoveredNodeId);

  return (
    <group>
      {/* Существующие соединения */}
      {connections.map(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (fromNode && toNode) {
          const fromPos = fromNode.translation.split(',').map(Number);
          const toPos = toNode.translation.split(',').map(Number);
          const midPoint = [
            (fromPos[0] + toPos[0]) / 2,
            (fromPos[1] + toPos[1]) / 2,
            (fromPos[2] + toPos[2]) / 2
          ];

          // Определяем, является ли линия активной
          const isActive = 
            (fromNode.id === linkingSourceId && toNode.id === hoveredNodeId) ||
            (toNode.id === linkingSourceId && fromNode.id === hoveredNodeId);
          
          return (
            <group key={`${conn.from}-${conn.to}`}>
              {/* Линия связи */}
              {/* Основная линия связи */}
              <Line
                points={[fromPos, toPos]}
                color={isActive ? "#ff8800" : "#4488ff"}
                lineWidth={isActive ? 4 : 3}
                transparent
                opacity={isActive ? 1 : 0.8}
              />
              {/* Светящаяся подложка */}
              <Line
                points={[fromPos, toPos]}
                color={isActive ? "#ffaa44" : "#88aaff"}
                lineWidth={isActive ? 6 : 5}
                transparent
                opacity={isActive ? 0.4 : 0.3}
              />

              {/* Кнопка удаления связи */}
              <Html
                position={midPoint}
                style={{ 
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -50%)'
                }}
                center
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveConnection(conn.from, conn.to);
                  }}
                  style={{
                    background: 'rgba(255,0,0,0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: 'white',
                    pointerEvents: 'auto',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    ':hover': {
                      background: 'rgba(255,0,0,0.9)',
                      transform: 'scale(1.1)'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,0,0,0.9)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,0,0,0.7)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ×
                </button>
              </Html>
            </group>
          );
        }
        return null;
      })}

      {/* Активная связь при создании */}
      {isLinkingMode && sourceNode && (
        <>
          {/* Подсветка */}
          <Line
            points={[
              sourceNode.translation.split(',').map(Number),
              targetNode ? 
                targetNode.translation.split(',').map(Number) : 
                sourceNode.translation.split(',').map(Number)
            ]}
            color={targetNode ? "#88ff88" : "#ff8888"}
            lineWidth={6}
            transparent
            opacity={0.3}
          />
          {/* Основная линия */}
          <Line
            points={[
              sourceNode.translation.split(',').map(Number),
              targetNode ? 
                targetNode.translation.split(',').map(Number) : 
                sourceNode.translation.split(',').map(Number)
            ]}
            color={targetNode ? "#44ff44" : "#ff4444"}
            lineWidth={4}
            transparent
            opacity={0.8}
            dashed={!targetNode}
            dashSize={3}
            gapSize={2}
          />
        </>
      )}
    </group>
  );
}

ConnectionManager.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired
  })).isRequired,
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  })).isRequired,
  onAddConnection: PropTypes.func.isRequired,
  onRemoveConnection: PropTypes.func.isRequired,
  isLinkingMode: PropTypes.bool.isRequired,
  linkingSourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hoveredNodeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
