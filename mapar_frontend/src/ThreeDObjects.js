import React from 'react';
import { extend, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

// Расширяем THREE для использования OrbitControls
extend({ OrbitControls });

function ThreeDObjects({ nodes, connections }) {
  const { scene, camera, gl } = useThree();

  React.useEffect(() => {
    // Создаем оси координат
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Создаем сетку
    const grid = new THREE.GridHelper(100, 100);
    grid.position.y = -2;
    scene.add(grid);

    // Создаем соединения между узлами
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        const fromPos = fromNode.translation.split(',').map(Number);
        const toPos = toNode.translation.split(',').map(Number);
        
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          ...fromPos,
          ...toPos
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }
    });

    // Добавляем OrbitControls
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    return () => {
      scene.remove(axesHelper);
      scene.remove(grid);
      scene.children
        .filter(child => child instanceof THREE.Line)
        .forEach(obj => scene.remove(obj));
      controls.dispose();
    };
  }, [scene, nodes, connections, camera, gl]);

  return null;
}

export default ThreeDObjects;
