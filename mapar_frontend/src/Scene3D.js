import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, TransformControls } from '@react-three/drei';
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
  onNodeHover,
  orbitControlsRef,
  modelResetRef
}) {
  const [modelUrl, setModelUrl] = useState(null);
  const [modelVisible, setModelVisible] = useState(true);
  const [modelSelected, setModelSelected] = useState(false);
  const [transformMode, setTransformMode] = useState('translate');
  const modelGroupRef = useRef();

  const handleFileUpload = (model) => {
    if (model.file) {
      const url = URL.createObjectURL(model.file);
      setModelUrl(url);
      setModelVisible(true);
      setModelSelected(true);
    }
  };

  const handleModelDelete = () => {
    setModelUrl(null);
    setModelSelected(false);
  };

  const handleModelToggleVisible = () => {
    setModelVisible((v) => !v);
  };

  // функция для сброса трансформации и видимости
  const handleModelReset = () => {
    if (modelGroupRef.current) {
      modelGroupRef.current.position.set(0, 0, 0);
      modelGroupRef.current.rotation.set(0, 0, 0);
      modelGroupRef.current.scale.set(1, 1, 1);
    }
    setModelVisible(true);
  };

  // Экспортируем функцию сброса наружу
  useEffect(() => {
    if (modelResetRef) {
      modelResetRef.current = handleModelReset;
    }
  }, [modelResetRef]);

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
        onTransformModeChange={setTransformMode}
        modelName={modelUrl ? 'Загруженная модель' : ''}
        modelVisible={modelVisible}
        onToggleVisible={handleModelToggleVisible}
        onDelete={handleModelDelete}
        hasModel={!!modelUrl}
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
          {modelUrl && modelVisible && (
            <TransformControls
              mode={transformMode}
              enabled={modelSelected && modelVisible}
              object={modelGroupRef.current}
            >
              <group
                ref={modelGroupRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setModelSelected(true);
                }}
              >
                <ModelLoader
                  url={modelUrl}
                />
              </group>
            </TransformControls>
          )}

          {modelSelected && modelUrl && (
            <ModelControls
              mode={transformMode}
              setMode={setTransformMode}
              onDelete={handleModelDelete}
              onToggleVisible={handleModelToggleVisible}
              onReset={handleModelReset}
              visible={modelVisible}
            />
          )}

          {/* Сброс выделения по клику вне модели */}
          <mesh onClick={() => setModelSelected(false)}>
            <boxGeometry scale={[1000, 1000, 1000]} />
            <meshBasicMaterial opacity={0} />
          </mesh>

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
          ref={orbitControlsRef}
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
  onNodeHover: PropTypes.func,
  orbitControlsRef: PropTypes.object,
  modelResetRef: PropTypes.object
};

Scene3D.defaultProps = {
  nodes: [],
  connections: [],
  selectedNodeId: null,
  onSelectNode: undefined,
  onNodeMove: undefined,
  linkingSourceId: null,
  hoveredNodeId: null,
  onNodeHover: undefined,
  orbitControlsRef: null,
  modelResetRef: null
};

export default Scene3D;
