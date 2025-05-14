import React, { useState, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { useGLTF } from '@react-three/drei';
import PropTypes from 'prop-types';

export function ModelLoader({ url, scale, position, rotation }) {
  const modelRef = useRef();
  const [modelUrl, setModelUrl] = useState(url);

  // Загрузка локального файла
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setModelUrl(objectUrl);
    }
  };

  // Загрузка модели
  const { scene } = useGLTF(modelUrl);

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      scale={scale} 
      position={position}
      rotation={rotation}
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
