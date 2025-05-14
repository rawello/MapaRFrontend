import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import PropTypes from 'prop-types';

function SimpleScene({ nodes, connections }) {
  // Помощник для создания линий между точками
  const createLine = (start, end, color = "blue", width = 1) => (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={width}
    />
  );

  // Создаем оси координат
  const axes = (
    <>
      {createLine([0, 0, 0], [2, 0, 0], "red", 2)}
      {createLine([0, 0, 0], [0, 2, 0], "green", 2)}
      {createLine([0, 0, 0], [0, 0, 2], "blue", 2)}
    </>
  );

  // Создаем соединения между узлами
  const nodeConnections = connections.map(conn => {
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

  return (
    <group>
      {axes}
      {nodeConnections}
      <gridHelper args={[100, 100]} position={[0, -2, 0]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
    </group>
  );
}

SimpleScene.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired
  })).isRequired,
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  })).isRequired
};

export default SimpleScene;
