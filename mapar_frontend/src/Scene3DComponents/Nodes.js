import React, { useRef } from 'react';
import { Html, Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';

export function Node({ 
  position = [0, 0, 0], 
  nodeId, 
  onClick, 
  onHover,
  isSelected, 
  isLinkingSource,
  isLinkingTarget,
  modelPath, 
  name, 
  title 
}) {
  const htmlRef = useRef();
  const titleRef = useRef();
  const isViewType = modelPath === 'view';
  const dimensions = isViewType ? [1, 0.5, 0.3] : [0.5, 0.5, 0.5];
  
  let nodeColor = '#00ff00';
  if (isLinkingSource) {
    nodeColor = '#ff8800';
  } else if (isLinkingTarget) {
    nodeColor = '#00ff88';
  } else if (isSelected) {
    nodeColor = '#ff0000';
  } else if (isViewType) {
    nodeColor = '#4488ff';
  }

  const formatCoordinates = (pos) => {
    if (!Array.isArray(pos) || pos.length < 3) {
      pos = [0, 0, 0];
    }
    return `[${pos[0].toFixed(1)}, ${pos[1].toFixed(1)}, ${pos[2].toFixed(1)}]`;
  };

  useFrame(() => {
    if (htmlRef.current) {
      htmlRef.current.style.display = 'block';
      htmlRef.current.style.opacity = '0.8';
    }
    if (titleRef.current) {
      titleRef.current.style.display = 'block';
      titleRef.current.style.opacity = '0.8';
    }
  });

  return (
    <>
      <Box
        position={position}
        scale={dimensions}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(nodeId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover?.(nodeId);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover?.(null);
        }}
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial color={nodeColor} />
      </Box>

      <Html
        ref={htmlRef}
        position={[position[0], position[1] + dimensions[1] * 0.7, position[2]]}
        style={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          transform: 'translate3d(-50%, -100%, 0)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
        zIndexRange={[100, 0]}
      >
        {`${name || nodeId} ${formatCoordinates(position)}`}
      </Html>

      {isViewType && title && (
        <Html
          ref={titleRef}
          position={[position[0], position[1], position[2] + dimensions[2] * 0.7]}
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            width: '200px',
            textAlign: 'center',
            userSelect: 'none',
            pointerEvents: 'none',
            transform: 'translate3d(-50%, -50%, 0)',
          }}
          zIndexRange={[100, 0]}
        >
          {title}
        </Html>
      )}
    </>
  );
}

Node.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  nodeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClick: PropTypes.func,
  onHover: PropTypes.func,
  isSelected: PropTypes.bool,
  isLinkingSource: PropTypes.bool,
  isLinkingTarget: PropTypes.bool,
  modelPath: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string
};

Node.defaultProps = {
  onClick: undefined,
  onHover: undefined,
  isSelected: false,
  isLinkingSource: false,
  isLinkingTarget: false,
  modelPath: '',
  name: '',
  title: ''
};

export function Nodes({ 
  nodes, 
  selectedNodeId, 
  linkingSourceId,
  hoveredNodeId,
  onSelect,
  onHover 
}) {
  return nodes.map(node => {
    const position = node.translation.split(',').map(Number);
    return (
      <Node
        key={node.id}
        position={position}
        nodeId={node.id}
        onClick={() => onSelect?.(node)}
        onHover={onHover}
        isSelected={selectedNodeId === node.id}
        isLinkingSource={linkingSourceId === node.id}
        isLinkingTarget={linkingSourceId && hoveredNodeId === node.id}
        modelPath={node.modelPath}
        name={node.name}
        title={node.title} 
      />
    );
  });
}

Nodes.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired,
    name: PropTypes.string,
    title: PropTypes.string,
    modelPath: PropTypes.string
  })).isRequired,
  selectedNodeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  linkingSourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hoveredNodeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func,
  onHover: PropTypes.func
};

Nodes.defaultProps = {
  selectedNodeId: null,
  linkingSourceId: null,
  hoveredNodeId: null,
  onSelect: undefined,
  onHover: undefined
};
