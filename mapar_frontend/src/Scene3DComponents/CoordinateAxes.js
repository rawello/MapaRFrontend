import React from 'react';
import { Html } from '@react-three/drei';

function CoordinateAxes() {
  const arrowLength = 2;
  const arrowHeadLength = 0.2;
  const arrowHeadWidth = 0.1;

  return (
    <group>
      <group>
        <mesh position={[arrowLength / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, arrowLength]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh position={[arrowLength, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[arrowHeadWidth, arrowHeadLength]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <Html position={[arrowLength + 0.3, 0, 0]}>
          <div style={{ color: 'red', fontSize: '14px' }}>X</div>
        </Html>
      </group>

      <group>
        <mesh position={[0, arrowLength / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, arrowLength]} />
          <meshStandardMaterial color="green" />
        </mesh>
        <mesh position={[0, arrowLength, 0]}>
          <coneGeometry args={[arrowHeadWidth, arrowHeadLength]} />
          <meshStandardMaterial color="green" />
        </mesh>
        <Html position={[0, arrowLength + 0.3, 0]}>
          <div style={{ color: 'green', fontSize: '14px' }}>Y</div>
        </Html>
      </group>

      <group>
        <mesh position={[0, 0, arrowLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, arrowLength]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        <mesh position={[0, 0, arrowLength]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[arrowHeadWidth, arrowHeadLength]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        <Html position={[0, 0, arrowLength + 0.3]}>
          <div style={{ color: 'blue', fontSize: '14px' }}>Z</div>
        </Html>
      </group>
    </group>
  );
}

export default CoordinateAxes;
