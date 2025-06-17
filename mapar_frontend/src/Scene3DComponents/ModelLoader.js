import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useLoader, extend } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { useGLTF } from '@react-three/drei';
import PropTypes from 'prop-types';

// Временный фикс для моделей, где встречается Button
class DummyButton extends THREE.Object3D {}
class DummyDiv extends THREE.Object3D {}
extend({ Button: DummyButton, Div: DummyDiv });

export function ModelLoader({ url, scale, position, rotation }) {
  const modelRef = useRef();
  const [modelUrl, setModelUrl] = useState(url);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setModelUrl(objectUrl);
    }
  };

  const { scene } = useGLTF(modelUrl);

  useEffect(() => {
    if (!scene) return;
    // Сброс transform
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    // Центрирование по bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center); // сдвигаем так, чтобы центр был в (0,0,0)
  }, [scene]);

  return (
    <primitive 
      ref={modelRef}
      object={scene}
    />
  );
}

ModelLoader.propTypes = {
  url: PropTypes.string,
  scale: PropTypes.arrayOf(PropTypes.number),
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number)
};

ModelLoader.defaultProps = {
  url: '',
  scale: [1, 1, 1],
  position: [0, 0, 0],
  rotation: [0, 0, 0]
};
