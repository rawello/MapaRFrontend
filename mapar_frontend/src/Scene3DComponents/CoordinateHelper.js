import React from 'react';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

export function CoordinateHelper({ size = 5 }) {
  const axisColor = {
    x: '#ff0000',
    y: '#00ff00',
    z: '#0000ff'
  };

  return (
    <group>
      <Line
        points={[[0, 0, 0], [size, 0, 0]]}
        color={axisColor.x}
        lineWidth={2}
      />
      <Text
        position={[size + 0.2, 0, 0]}
        color={axisColor.x}
        fontSize={0.3}
      >
        X
      </Text>

      <Line
        points={[[0, 0, 0], [0, size, 0]]}
        color={axisColor.y}
        lineWidth={2}
      />
      <Text
        position={[0, size + 0.2, 0]}
        color={axisColor.y}
        fontSize={0.3}
      >
        Y
      </Text>

      <Line
        points={[[0, 0, 0], [0, 0, size]]}
        color={axisColor.z}
        lineWidth={2}
      />
      <Text
        position={[0, 0, size + 0.2]}
        color={axisColor.z}
        fontSize={0.3}
      >
        Z
      </Text>

      {Array.from({ length: size }).map((_, i) => (
        <group key={i}>
          <Line
            points={[[i + 1, -0.1, 0], [i + 1, 0.1, 0]]}
            color={axisColor.x}
            lineWidth={1}
          />
          <Text
            position={[i + 1, -0.3, 0]}
            color={axisColor.x}
            fontSize={0.2}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {i + 1}m
          </Text>

          <Line
            points={[[-0.1, i + 1, 0], [0.1, i + 1, 0]]}
            color={axisColor.y}
            lineWidth={1}
          />
          <Text
            position={[-0.3, i + 1, 0]}
            color={axisColor.y}
            fontSize={0.2}
          >
            {i + 1}m
          </Text>

          <Line
            points={[[-0.1, 0, i + 1], [0.1, 0, i + 1]]}
            color={axisColor.z}
            lineWidth={1}
          />
          <Text
            position={[-0.3, 0, i + 1]}
            color={axisColor.z}
            fontSize={0.2}
          >
            {i + 1}m
          </Text>
        </group>
      ))}

      <mesh>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
