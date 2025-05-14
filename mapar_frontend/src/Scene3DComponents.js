import React from 'react';
import { Line, Text } from '@react-three/drei';
import PropTypes from 'prop-types';
import { Nodes } from './Scene3DComponents/Nodes';

export function CoordinateSystem() {
  const axisConfig = [
    { axis: 'x', dir: [1, 0, 0], color: '#ff0000' },
    { axis: 'y', dir: [0, 1, 0], color: '#00ff00' },
    { axis: 'z', dir: [0, 0, 1], color: '#0000ff' }
  ];

  return (
    <group>
      {axisConfig.map(({ axis, dir, color }) => (
        <group key={axis}>
          <Line 
            points={[[0, 0, 0], dir.map(d => d * 2)]}
            color={color}
            lineWidth={2}
          />
          <Text
            position={dir.map(d => d * 2.2)}
            color={color}
            fontSize={0.3}
            anchorX="center"
            anchorY="middle"
          >
            {axis.toUpperCase()}
          </Text>
        </group>
      ))}
    </group>
  );
}

export function ConnectionLines({ nodes, connections }) {
  if (!nodes || !connections) return null;

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
          color="#4444ff"
          lineWidth={1}
        />
      );
    }
    return null;
  });
}

ConnectionLines.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired
  })),
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }))
};
