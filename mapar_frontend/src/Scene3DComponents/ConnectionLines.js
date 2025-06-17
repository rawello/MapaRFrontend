import React, { useMemo } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';

function Arrow({ start, end, color = '#00aa00' }) {
  const direction = useMemo(() => {
    return new THREE.Vector3(
      end[0] - start[0],
      end[1] - start[1],
      end[2] - start[2]
    ).normalize();
  }, [start, end]);

  const length = useMemo(() => {
    return new THREE.Vector3(
      end[0] - start[0],
      end[1] - start[1],
      end[2] - start[2]
    ).length();
  }, [start, end]);

  const position = useMemo(() => {
    return [
      start[0] + (end[0] - start[0]) / 2,
      start[1] + (end[1] - start[1]) / 2,
      start[2] + (end[2] - start[2]) / 2
    ];
  }, [start, end]);

  const rotation = useMemo(() => {
    const upVector = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    
    quaternion.setFromUnitVectors(
      upVector,
      direction
    );
    
    const euler = new THREE.Euler();
    euler.setFromQuaternion(quaternion);
    
    return [euler.x, euler.y, euler.z];
  }, [direction]);

  return (
    <group position={position} rotation={rotation}>
      {}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, length, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {}
      <mesh position={[0, length/2 - 0.15, 0]}>
        <coneGeometry args={[0.08, 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

Arrow.propTypes = {
  start: PropTypes.arrayOf(PropTypes.number).isRequired,
  end: PropTypes.arrayOf(PropTypes.number).isRequired,
  color: PropTypes.string
};

Arrow.defaultProps = {
  color: '#4444ff'
};

export function ConnectionLines({ nodes, connections }) {
  if (!nodes || !connections) return null;

  return connections.map(conn => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    
    if (fromNode && toNode) {
      const fromPos = fromNode.translation.split(',').map(Number);
      const toPos = toNode.translation.split(',').map(Number);
      
      return (
        <Arrow
          key={`${conn.from}-${conn.to}`}
          start={fromPos}
          end={toPos}
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
