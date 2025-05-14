import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import PropTypes from 'prop-types';
import { CoordinateSystem } from './Scene3DComponents';
import { Nodes } from './Scene3DComponents/Nodes';
import { ConnectionManager } from './Scene3DComponents/ConnectionManager';
import { ModelLoader } from './Scene3DComponents/ModelLoader';
import { CoordinateHelper } from './Scene3DComponents/CoordinateHelper';
import { ModelControls } from './Scene3DComponents/ModelControls';
import { NodeTransformControls } from './Scene3DComponents/NodeTransformControls';
import { ModelPanel } from './Scene3DComponents/ModelPanel';

function Scene3D({ 
  nodes, 
  connections, 
  selectedNodeId, 
  onSelectNode, 
  onNodeMove,
  onAddConnection,
  onRemoveConnection,
  isLinkingMode,
  linkingSourceId,
  hoveredNodeId,
  onNodeHover 
}) {
  const [modelUrl, setModelUrl] = useState(null);
  const [modelTransform, setModelTransform] = useState({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  });
  const [transformMode, setTransformMode] = useState('translate');
  const modelRef = useRef();

  const handleFileUpload = (model) => {
    if (model.file) {
      const url = URL.createObjectURL(model.file);
      setModelUrl(url);
    }
  };

  const handleModelTransform = (transform) => {
    setModelTransform(transform);
  };

  const handleTransformModeChange = (mode) => {
    setTransformMode(mode);
  };

  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  const handleNodeSelect = (node) => {
    if (node.modelPath === 'view' && !node.type) {
      onSelectNode({
        ...node,
        type: 'view'
      });
    } else {
      onSelectNode(node);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ModelPanel 
        onFileUpload={handleFileUpload}
        onTransformModeChange={handleTransformModeChange}
        transformMode={transformMode}
      />

      <Canvas
        camera={{
          position: [10, 10, 10],
          fov: 60
        }}
        shadows
      >
        <CoordinateSystem />
        <CoordinateHelper size={5} />
        
        <group>
          {modelUrl && (
            <>
              <ModelLoader
                url={modelUrl}
                ref={modelRef}
                position={[0, 0, 0]}
                scale={[1, 1, 1]}
                rotation={[0, 0, 0]}
              />
              <ModelControls
                modelRef={modelRef}
                onTransform={handleModelTransform}
              />
            </>
          )}

          <ConnectionManager 
            nodes={nodes}
            connections={connections}
            onAddConnection={onAddConnection}
            onRemoveConnection={onRemoveConnection}
            isLinkingMode={isLinkingMode}
            linkingSourceId={linkingSourceId}
            hoveredNodeId={hoveredNodeId}
          />
          <Nodes 
            nodes={nodes} 
            selectedNodeId={selectedNodeId}
            onSelect={handleNodeSelect}
            onHover={onNodeHover}
            linkingSourceId={linkingSourceId}
            hoveredNodeId={hoveredNodeId}
          />
          {selectedNode && !isLinkingMode && (
            <NodeTransformControls 
              selectedNode={selectedNode} 
              onNodeMove={onNodeMove}
            />
          )}
        </group>
        
        <Grid 
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
          position={[0, -2, 0]}
        />
        
        <OrbitControls 
          makeDefault
          enableDamping 
          dampingFactor={0.05}
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

Scene3D.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired
  })),
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  })),
  selectedNodeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectNode: PropTypes.func,
  onNodeMove: PropTypes.func,
  onAddConnection: PropTypes.func.isRequired,
  onRemoveConnection: PropTypes.func.isRequired,
  isLinkingMode: PropTypes.bool.isRequired,
  linkingSourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hoveredNodeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onNodeHover: PropTypes.func
};

Scene3D.defaultProps = {
  nodes: [],
  connections: [],
  selectedNodeId: null,
  onSelectNode: undefined,
  onNodeMove: undefined,
  linkingSourceId: null,
  hoveredNodeId: null,
  onNodeHover: undefined
};

export default Scene3D;
