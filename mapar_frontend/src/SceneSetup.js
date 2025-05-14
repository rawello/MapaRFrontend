import React from 'react';
import { useThree } from '@react-three/fiber';
import { Line, OrbitControls, Html } from '@react-three/drei';
import PropTypes from 'prop-types';

function SceneSetup({ nodes, connections }) {
  const { scene } = useThree();

  // Помощник для создания стрелок осей координат
  const createArrow = (direction, color) => {
    const length = 2;
    const start = [0, 0, 0];
    const end = direction.map(d => d * length);
    return (
      <group>
        <Line 
          points={[start, end]}
          color={color}
          lineWidth={2}
        />
        {/* Метка оси */}
        <Html position={end}>
          <div style={{
            color: color,
            background: 'rgba(0,0,0,0.8)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            transform: 'translate3d(-50%, -50%, 0)'
          }}>
            {direction[0] === 1 ? 'X' : direction[1] === 1 ? 'Y' : 'Z'}
          </div>
        </Html>
      </group>
    );
  };

  // Создаем соединения между узлами
  const renderConnections = () => {
    return connections.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        const fromPos = fromNode.translation.split(',').map(Number);
        const toPos = toNode.translation.split(',').map(Number);
        
        return (
          <Line
            key={`${conn.from}-${conn.to}`}
            points={[fromPos, toPos]}
            color="blue"
            lineWidth={1}
          />
        );
      }
      return null;
    });
  };

  return (
    <>
      {/* Оси координат со стрелками */}
      {createArrow([1, 0, 0], "red")}
      {createArrow([0, 1, 0], "green")}
      {createArrow([0, 0, 1], "blue")}
      
      {/* Соединения между узлами */}
      {renderConnections()}
      
      {/* Сетка */}
      <gridHelper args={[100, 100]} position={[0, -2, 0]} />
      
      {/* Освещение */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      
      {/* Управление камерой */}
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </>
  );
}

SceneSetup.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired
  })),
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }))
};

SceneSetup.defaultProps = {
  nodes: [],
  connections: []
};

export default SceneSetup;
