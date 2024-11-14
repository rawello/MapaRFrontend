import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Line } from '@react-three/drei';
import NodeControls from './NodeControls';
import CreateNodeControls from './CreateNodeControls';
import NodeInfo from './NodeInfo';
import Sidebar from './Sidebar';
import LoginModal from './LoginModal';
import BuildingName from './BuildingName';
import ModelManager from './ModelManager';
import AxisArrows from './AxisArrows';
import './App.css';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const transformControlsRef = useRef();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const gridHelperRef = useRef();
  const linesRef = useRef([]);
  const hitboxesRef = useRef([]);
  const nodeMeshes = useRef([]);

  const base_url = "http://localhost:8080";

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
        }
      } else {
        setShowLoginModal(true);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);

    return () => {
      window.removeEventListener('mousedown', onMouseDown, false);
      window.removeEventListener('mousemove', onMouseMove, false);
      window.removeEventListener('mouseup', onMouseUp, false);
    };
  }, [selectedNode, isDragging]);

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
        if (child !== gridHelperRef.current && child !== transformControlsRef.current) {
          sceneRef.current.remove(child);
        }
      });
      linesRef.current = [];
      hitboxesRef.current = [];
      nodeMeshes.current = [];
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
      const geom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const mesh = new THREE.Mesh(geom, material);
      mesh.position.copy(position);
      mesh.userData.id = node.id;
      mesh.userData.name = node.name;
      mesh.userData.neighbors = node.neighbors;
      mesh.userData.translation = node.translation;
      sceneRef.current.add(mesh);
      nodeMeshes.current[index] = mesh;

      const hitboxGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const hitboxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, visible: false });
      const hitbox = new THREE.Mesh(hitboxGeom, hitboxMaterial);
      hitbox.position.copy(position);
      hitbox.userData.id = node.id;
      sceneRef.current.add(hitbox);
      hitboxesRef.current.push(hitbox);

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

  const highlightSelectedNode = (nodeId, currentSelectedNode) => {
    if (currentSelectedNode) {
      currentSelectedNode.material.color.set(0x00ff00);
      transformControlsRef.current.detach();
    }

    const selectedNode = nodeMeshes.current.find(mesh => mesh.userData.id == nodeId);
    if (selectedNode) {
      selectedNode.material.color.set(0xff0000);
      transformControlsRef.current.attach(selectedNode);
      setSelectedNode(selectedNode);
    }
  };

  const updateNode = () => {
    const nodeId = selectedNode.userData.id;
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
    const nodeId = selectedNode.userData.id;
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
    setIsDragging(true);
    onMouseClick(event);
  };

  const onMouseMove = (event) => {
    if (isDragging && !selectedNode) {
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseClick = (event) => {
    const target = event.target;
    console.log('Event target:', event.target);
    console.log('Event target nodeName:', event.target.nodeName);
    if (target.nodeName && target.nodeName === 'CANVAS') {
      if (!cameraRef.current || !sceneRef.current) return;

      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(hitboxesRef.current, true);

      if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject.userData && selectedObject.userData.id) {
          highlightSelectedNode(selectedObject.userData.id, selectedNode);
          setSelectedNode(selectedObject);
          document.getElementById('nodeId').value = selectedObject.userData.id;
          document.getElementById('nodeLabel').value = selectedObject.userData.name;
          document.getElementById('nodeNeighbors').value = selectedObject.userData.neighbors;
          document.getElementById('nodeX').value = selectedObject.position.x;
          document.getElementById('nodeY').value = selectedObject.position.y;
          document.getElementById('nodeZ').value = selectedObject.position.z;
          highlightSelectedNode(selectedNode.id, selectedNode)
        }
      } else {
        if (selectedNode) {
          selectedNode.material.color.set(0x00ff00);
          transformControlsRef.current.detach();
          setSelectedNode(null);
        }
        controlsRef.current.enabled = true;
      }
    }
  };

  const updateLines = (nodeMesh) => {
    const nodeId = nodeMesh.userData.id;
    const nodePosition = nodeMesh.position.clone();
    const neighbors = nodeMesh.userData.neighbors.split(',').map(Number);

    linesRef.current.forEach(line => {
      const points = line.geometry.attributes.position.array;
      if (
        (points[0] === nodePosition.x && points[1] === nodePosition.y && points[2] === nodePosition.z) ||
        (points[3] === nodePosition.x && points[4] === nodePosition.y && points[5] === nodePosition.z)
      ) {
        const otherNode = nodes.find(n => n.id === neighbors[0]);
        if (otherNode) {
          const otherPosition = new THREE.Vector3().fromArray(otherNode.translation.split(',').map(parseFloat));
          line.geometry.setFromPoints([nodePosition, otherPosition]);
        }
      }
    });
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

  const handleMoveNode = (axis) => {
    if (selectedNode) {
      const step = 0.1;
      switch (axis) {
        case 'x':
          selectedNode.position.x += step;
          break;
        case 'y':
          selectedNode.position.y += step;
          break;
        case 'z':
          selectedNode.position.z += step;
          break;
        default:
          break;
      }
      updateLines(selectedNode);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Sidebar
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
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
            highlightSelectedNode={highlightSelectedNode}
          />
          <ModelManager scene={sceneRef.current} />
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
            console.log(showLoginModal)
            setShowLoginModal(!showLoginModal)
          }
          }
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
          controlsRef.current = new OrbitControls(camera, gl.domElement);
          transformControlsRef.current = new TransformControls(camera, gl.domElement);
          scene.add(transformControlsRef.current);
          gridHelperRef.current = new THREE.GridHelper(100, 100);
          gridHelperRef.current.position.set(0, -2, 0);
          scene.add(gridHelperRef.current);
        }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {nodes.map((node, index) => {
          const position = node.translation.split(',').map(parseFloat);
          return (
            <group key={node.id}>
              <Box position={position} args={[0.3, 0.3, 0.3]}>
                <meshBasicMaterial color={0x00ff00} />
              </Box>
              <Box position={position} args={[0.5, 0.5, 0.5]}>
                <meshBasicMaterial color={0x00ff00} visible={false} />
              </Box>
              {selectedNode && selectedNode.userData.id === node.id && (
                <AxisArrows position={position} onMove={handleMoveNode} />
              )}
            </group>
          );
        })}
        {linesRef.current.map((line, index) => (
          <Line key={index} points={line.geometry.attributes.position.array.reduce((acc, val) => acc.concat(val), [])} color={0x0000ff} />
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

export default App;