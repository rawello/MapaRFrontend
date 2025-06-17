import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import PropTypes from 'prop-types';

export function NodeTransformControls({ selectedNode, onNodeMove }) {
  const transformRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    if (transformRef.current) {
      const controls = transformRef.current;
      
      const handleChange = () => {
        if (selectedNode) {
          const position = controls.worldPosition;
          onNodeMove(selectedNode.id, `${position.x},${position.y},${position.z}`);
        }
      };

      controls.addEventListener('change', handleChange);
      controls.addEventListener('dragging-changed', (event) => {
        const orbitControls = scene.orbitControls;
        if (orbitControls) {
          orbitControls.enabled = !event.value;
        }
      });

      return () => {
        controls.removeEventListener('change', handleChange);
      };
    }
  }, [selectedNode, onNodeMove, scene]);

  if (!selectedNode) return null;

  const position = selectedNode.translation.split(',').map(Number);

  return (
    <TransformControls
      ref={transformRef}
      position={position}
      mode="translate"
      showX
      showY
      showZ
    />
  );
}

NodeTransformControls.propTypes = {
  selectedNode: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired
  }),
  onNodeMove: PropTypes.func.isRequired
};
