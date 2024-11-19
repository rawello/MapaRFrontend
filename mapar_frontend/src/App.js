import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, TransformControls, useCursor } from "@react-three/drei";
import { proxy, useSnapshot } from "valtio";
import * as THREE from 'three';
import NodeControls from './NodeControls';
import CreateNodeControls from './CreateNodeControls';
import NodeInfo from './NodeInfo';
import Sidebar from './Sidebar';
import LoginModal from './LoginModal';
import BuildingName from './BuildingName';
import ModelManager from './ModelManager';
import './App.css';

// Reactive state model, using Valtio ...
const modes = ["translate", "rotate", "scale"];
const state = proxy({ current: null, mode: 0 });
const base_url = "http://26.239.171.49:8080";

function Node({ name, position, color, onClick, onContextMenu, onPointerOver, onPointerOut, setHovered }) {
  const snap = useSnapshot(state);
  const [hovered, setHoveredState] = useState(false);
  useCursor(hovered);

  return (
    <group
      onClick={onClick}
      onPointerMissed={(e) => e.type === "click" && (state.current = null)}
      onContextMenu={onContextMenu}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredState(true);
        onPointerOver();
      }}
      onPointerOut={(e) => {
        setHoveredState(false);
        onPointerOut();
      }}
      name={name}
      position={position}
      dispose={null}
      userData={{ nodeId: name }}
    >
      <mesh userData={{ nodeId: name }}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Controls({ selectedModel }) {
  const snap = useSnapshot(state);
  const scene = useThree((state) => state.scene);
  return (
    <>
      {snap.current && <TransformControls object={scene.getObjectByName(snap.current)} mode={modes[snap.mode]} />}
      {selectedModel && <TransformControls object={selectedModel} mode={modes[snap.mode]} />}
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
    </>
  );
}

function App() {
  const [nodes, setNodes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const gridHelperRef = useRef();
  const linesRef = useRef([]);
  const nodeGroups = useRef([]);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await validateToken(token);
        setIsTokenValid(isValid);
        if (!isValid) {
          setShowLoginModal(true);
        } else {
          setToken(token);
          loadBuildings();
          loadFavorites();
        }
      } else {
        setShowLoginModal(true);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    if (selectedNode) {
      document.getElementById('nodeId').value = selectedNode.userData.nodeId;
      document.getElementById('nodeLabel').value = selectedNode.userData.name;
      document.getElementById('nodeNeighbors').value = selectedNode.userData.neighbors;
      document.getElementById('nodeX').value = selectedNode.position.x;
      document.getElementById('nodeY').value = selectedNode.position.y;
      document.getElementById('nodeZ').value = selectedNode.position.z;
    } else {
      document.getElementById('nodeId').value = '';
      document.getElementById('nodeLabel').value = '';
      document.getElementById('nodeNeighbors').value = '';
      document.getElementById('nodeX').value = '';
      document.getElementById('nodeY').value = '';
      document.getElementById('nodeZ').value = '';
    }
  }, [selectedNode]);

  useEffect(() => {
    console.log('Nodes state changed:', nodes);
  }, [nodes]);

  useEffect(() => {
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mouseup', onMouseUp, false);

    return () => {
      window.removeEventListener('mousedown', onMouseDown, false);
      window.removeEventListener('mouseup', onMouseUp, false);
    };
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      loadNodesForBuilding(selectedBuilding);
      loadModelsForBuilding(selectedBuilding);
    }
  }, [selectedBuilding]);

  const loadBuildings = async () => {
    try {
      const buildings = await fetchBuildings();
      setBuildings(buildings);
      if (buildings.length > 0) {
        setSelectedBuilding(buildings[0].id);
      }
    } catch (error) {
      console.error('Failed to load buildings:', error);
      setShowLoginModal(true);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await fetch(base_url + '/api/buildings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const buildings = await response.json();
      console.log('Buildings loaded:', buildings);
      return buildings;
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
      throw error;
    }
  };

  const fetchNodesForBuilding = async (buildingId) => {
    try {
      const response = await fetch(base_url + `/api/buildings/${buildingId}/nodes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const nodes = await response.json();
      console.log('Nodes loaded:', nodes);
      return nodes;
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      throw error;
    }
  };

  const loadNodesForBuilding = async (buildingId) => {
    try {
      const nodes = await fetchNodesForBuilding(buildingId);
      console.log('Fetched nodes:', nodes);
      setNodes(nodes);
      clearScene();
      renderNodes(nodes);
    } catch (error) {
      console.error('Failed to load nodes for building:', error);
      setShowLoginModal(true);
    }
  };

  const clearScene = () => {
    if (sceneRef.current) {
      sceneRef.current.children.forEach(child => {
        if (child !== gridHelperRef.current) {
          sceneRef.current.remove(child);
        }
      });
      linesRef.current = [];
      nodeGroups.current = [];
    }
  };

  const renderNodes = (nodes) => {
    if (!nodes || nodes.length === 0) {
      console.warn('No nodes to render');
      return;
    }

    nodes.forEach((node, index) => {
      if (!node.name || !node.neighbors) {
        console.warn('Node is missing name or neighbors:', node);
        return;
      }

      const position = new THREE.Vector3(...node.translation.split(',').map(parseFloat));
      const group = new THREE.Group();
      group.position.copy(position);
      group.userData.nodeId = node.id;
      group.userData.name = node.name;
      group.userData.neighbors = node.neighbors;
      group.userData.translation = node.translation;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      mesh.userData.nodeId = node.id;
      group.add(mesh);
      sceneRef.current.add(group);
      nodeGroups.current[index] = group;

      const neighbors = node.neighbors.split(',').map(Number);
      neighbors.forEach(neighborId => {
        const neighborNode = nodes.find(n => n.id === neighborId);
        if (neighborNode) {
          const neighborPosition = new THREE.Vector3(...neighborNode.translation.split(',').map(parseFloat));
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([position, neighborPosition]);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          sceneRef.current.add(line);
          linesRef.current.push(line);
          console.log(`Created line from node ${node.id} to node ${neighborId}`);
        }
      });
    });
  };

  const updateNode = () => {
    const nodeId = selectedNode.userData.nodeId;
    const nodeLabel = document.getElementById('nodeLabel').value;
    const nodeNeighbors = document.getElementById('nodeNeighbors').value;
    const nodeX = document.getElementById('nodeX').value;
    const nodeY = document.getElementById('nodeY').value;
    const nodeZ = document.getElementById('nodeZ').value;

    const nodeToUpdate = nodes.find(node => node.id == nodeId);
    if (nodeToUpdate) {
      nodeToUpdate.name = nodeLabel;
      nodeToUpdate.neighbors = nodeNeighbors;
      nodeToUpdate.translation = `${nodeX},${nodeY},${nodeZ}`;

      fetch(base_url + `/api/nodes/${nodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nodeToUpdate)
      }).then(response => {
        if (response.ok) {
          alert('Node updated successfully');
        } else {
          alert('Failed to update node');
        }
      });
    }
  };

  const deleteNode = () => {
    const nodeId = selectedNode.userData.nodeId;
    if (nodeId) {
      fetch(base_url + `/api/nodes/${nodeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        if (response.ok) {
          alert('Node deleted successfully');
          loadNodesForBuilding(selectedBuilding);
        } else {
          alert('Failed to delete node');
        }
      });
    }
  };

  const createNode = () => {
    const buildingId = selectedBuilding;
    const nodeLabel = document.getElementById('newNodeLabel').value;
    const nodeNeighbors = document.getElementById('newNodeNeighbors').value;
    const nodeX = document.getElementById('newNodeX').value;
    const nodeY = document.getElementById('newNodeY').value;
    const nodeZ = document.getElementById('newNodeZ').value;

    const newNode = {
      buildingId: buildingId,
      name: nodeLabel,
      neighbors: nodeNeighbors,
      translation: `${nodeX},${nodeY},${nodeZ}`
    };

    fetch(base_url + '/api/nodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newNode)
    }).then(response => {
      if (response.ok) {
        alert('Node created successfully');
        loadNodesForBuilding(selectedBuilding);
      } else {
        alert('Failed to create node');
      }
    });
  };

  const onMouseDown = (event) => {
    onMouseClick(event);
  };

  const onMouseUp = () => {
    //setIsDragging(false);
  };

  const onMouseClick = (event) => {
    if (!cameraRef.current || !sceneRef.current) return;

    mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(nodeGroups.current, true);

    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      if (selectedObject.type === 'Mesh' && selectedObject.userData.nodeId) {
        const selectedNodeGroup = selectedObject.parent;
        if (selectedNodeGroup.userData && selectedNodeGroup.userData.nodeId) {
          setSelectedNode(selectedNodeGroup);
          console.log(selectedNodeGroup);
        }
        console.log(selectedNodeGroup);
      }
      console.log(selectedObject);
    } else {
      setSelectedNode(null);
    }
  };

  const validateToken = async (token) => {
    try {
      const response = await fetch(base_url + '/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(base_url + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setShowLoginModal(false);
      window.location.reload();
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const register = async (username, password) => {
    try {
      const response = await fetch(base_url + '/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      alert('Registration successful');
      setShowLoginModal(false);
      window.location.reload();
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setShowLoginModal(true);
  };

  const loadModelsForBuilding = (buildingId) => {
    const modelsData = JSON.parse(localStorage.getItem(`models_${buildingId}`)) || [];
    setModels(modelsData);
    modelsData.forEach(model => {
      const { url, position } = model;
      const loader = new THREE.ObjectLoader();
      loader.load(url, (object) => {
        object.position.set(...position);
        sceneRef.current.add(object);
      });
    });
  };

  const saveModelForBuilding = (buildingId, modelUrl, position) => {
    const modelsData = JSON.parse(localStorage.getItem(`models_${buildingId}`)) || [];
    modelsData.push({ url: modelUrl, position });
    localStorage.setItem(`models_${buildingId}`, JSON.stringify(modelsData));
    setModels(modelsData);
  };

  const handleModelUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const modelUrl = e.target.result;
      const position = [0, 0, 0];
      saveModelForBuilding(selectedBuilding, modelUrl, position);
    };
    reader.readAsDataURL(file);
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch(base_url + '/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const favorites = await response.json();
      setFavorites(favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const updateFavorites = async (favorites) => {
    try {
      const response = await fetch(base_url + '/api/users/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(favorites)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      setFavorites(favorites);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  const handleRenameBuilding = async (buildingId, newName) => {
    try {
      const response = await fetch(base_url + `/api/buildings/${buildingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      loadBuildings();
    } catch (error) {
      console.error('Failed to rename building:', error);
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    try {
      const response = await fetch(base_url + `/api/buildings/${buildingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      loadBuildings();
    } catch (error) {
      console.error('Failed to delete building:', error);
    }
  };

  const handleCreateBuilding = async (buildingName) => {
    try {
      const response = await fetch(base_url + '/api/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: buildingName, address: '' })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      loadBuildings();
    } catch (error) {
      console.error('Failed to create building:', error);
    }
  };

  useEffect(() => {
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      console.log('Creating GridHelper');
      gridHelperRef.current = new THREE.GridHelper(100, 100);
      gridHelperRef.current.position.set(0, -2, 0);
      sceneRef.current.add(gridHelperRef.current);
      console.log('GridHelper added to scene');
    }
  }, [sceneRef, cameraRef, rendererRef]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Sidebar
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onRename={handleRenameBuilding}
        onDelete={handleDeleteBuilding}
        onCreate={handleCreateBuilding}
      />
      <BuildingName buildingName={buildings.find(building => building.id === selectedBuilding)?.name} />
      <div id="controls" className={isSidebarOpen ? 'sidebar-open' : ''} style={{ position: 'absolute', top: '10px', left: '75px', zIndex: 1000 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <NodeControls
            selectedNode={selectedNode}
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            updateNode={updateNode}
            deleteNode={deleteNode}
            nodes={nodes}
            nodeGroups={nodeGroups.current}
            setSelectedNode={setSelectedNode}
          />
          <ModelManager scene={sceneRef.current} onModelSelect={setSelectedModel} />
          <CreateNodeControls createNode={createNode} />
          <NodeInfo selectedNode={selectedNode} />
        </div>
      </div>
      {isTokenValid ? (
        <button
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}
          onClick={handleLogout}
        >
          Выйти
        </button>
      ) : (
        <button
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}
          onClick={() => {
            setShowLoginModal(!showLoginModal);
          }}
        >
          Войти
        </button>
      )}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 20] }}
        onCreated={({ gl, scene, camera }) => {
          sceneRef.current = scene;
          cameraRef.current = camera;
          rendererRef.current = gl;
          console.log('Canvas created:', { gl, scene, camera });
        }}
      >
        <SceneComponent
          nodes={nodes}
          nodeGroups={nodeGroups}
          linesRef={linesRef}
          models={models}
          selectedNode={selectedNode}
          rendererRef={rendererRef}
          sceneRef={sceneRef}
          cameraRef={cameraRef}
          gridHelperRef={gridHelperRef}
          onNodeMove={(nodeId, newPosition) => {
            const updatedNodes = nodes.map(node => {
              if (node.id === nodeId) {
                return { ...node, translation: newPosition.join(',') };
              }
              return node;
            });
            setNodes(updatedNodes);
          }}
        />
        <Controls selectedModel={selectedModel} />
      </Canvas>
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={login}
        onRegister={register}
      />
    </div>
  );
}

const SceneComponent = ({ nodes, nodeGroups, linesRef, models, selectedNode, rendererRef, sceneRef, cameraRef, gridHelperRef, onNodeMove }) => {
  const { scene, camera, gl } = useThree();
  const [hovered, setHovered] = useState(false);
  const [objectsAdded, setObjectsAdded] = useState(false);

  useEffect(() => {
    console.log('Creating GridHelper');
    gridHelperRef.current = new THREE.GridHelper(100, 100);
    gridHelperRef.current.position.set(0, -2, 0);
    scene.add(gridHelperRef.current);
    console.log('GridHelper added to scene');
  }, [scene, camera, gl]);

  useEffect(() => {
    if (nodes.length > 0) {
      linesRef.current.forEach(line => {
        scene.remove(line);
      });
      linesRef.current = [];

      nodes.forEach((node, index) => {
        const position = new THREE.Vector3(...node.translation.split(',').map(parseFloat));
        const neighbors = node.neighbors.split(',').map(Number);
        neighbors.forEach(neighborId => {
          const neighborNode = nodes.find(n => n.id === neighborId);
          if (neighborNode) {
            const neighborPosition = new THREE.Vector3(...neighborNode.translation.split(',').map(parseFloat));
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([position, neighborPosition]);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
            linesRef.current.push(line);
          }
        });
      });
    }
  }, [nodes, scene]);

  useFrame(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    // Update lines if a node is selected and being transformed
    if (selectedNode) {
      const selectedNodeId = selectedNode.userData.nodeId;
      const nodeNeighbors = selectedNode.userData.neighbors;
      if (nodeNeighbors) {
        const neighbors = nodeNeighbors.split(',').map(Number);
        neighbors.forEach(neighborId => {
          const neighborNode = nodes.find(n => n.id === neighborId);
          if (neighborNode) {
            const neighborPosition = new THREE.Vector3(...neighborNode.translation.split(',').map(parseFloat));
            const line = linesRef.current.find(line => {
              const points = line.geometry.attributes.position.array;
              return points[0] === selectedNode.position.x && points[1] === selectedNode.position.y && points[2] === selectedNode.position.z;
            });
            if (line) {
              line.geometry.setFromPoints([selectedNode.position, neighborPosition]);
              line.geometry.attributes.position.needsUpdate = true;
            }
          }
        });
      }
    }

    // Update nodes positions in the original array
    nodeGroups.current.forEach((group, index) => {
      const node = nodes[index];
      if (node) {
        const position = new THREE.Vector3(...node.translation.split(',').map(parseFloat));
        if (!position.equals(group.position)) {
          onNodeMove(node.id, [group.position.x, group.position.y, group.position.z]);
        }
      }
    });
  });

  return (
    <>
      {nodeGroups.current.map((group, index) => {
        const node = nodes[index];
        const position = node.translation.split(',').map(parseFloat);
        return (
          <group key={node.id}>
            <Node
              name={node.id}
              position={position}
              color={selectedNode && selectedNode.userData.nodeId === node.id ? 0xff0000 : 0x00ff00}
              onClick={(e) => (e.stopPropagation(), (state.current = node.id))}
              onContextMenu={(e) => state.current === node.id && (e.stopPropagation(), (state.mode = (state.mode + 1) % modes.length))}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
              setHovered={setHovered}
            />
          </group>
        );
      })}
      {linesRef.current.map((line, index) => (
        <line key={index} geometry={line.geometry} material={line.material} />
      ))}
      {models.map((model, index) => {
        const { url, position } = model;
        return (
          <mesh key={index} position={position}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={0x0000ff} />
          </mesh>
        );
      })}
    </>
  );
};

export default App;