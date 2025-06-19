import React, { useState, useEffect, useCallback, useRef } from "react";
import { proxy } from "valtio";
import PropTypes from 'prop-types';
import NodeControls from './NodeControls';
import NodeInfo from './NodeInfo';
import Sidebar from './Sidebar';
import LoginModal from './LoginModal';
import BuildingName from './BuildingName';
import Scene3D from './Scene3D';
import SaveChangesButton from './SaveChangesButton';
import StatisticPanel from './StatisticPanel';
import './App.css';

const modes = ["translate", "rotate", "scale"];
const state = proxy({ current: null, mode: 0 });
const base_url = "http://194.67.84.115:8881";

function App() {
  const [nodes, setNodes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changedNodes, setChangedNodes] = useState(new Map());
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkingSourceId, setLinkingSourceId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showStatistic, setShowStatistic] = useState(false);

  const orbitControlsRef = useRef();
  const modelResetRef = useRef();

  const handleResetCamera = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  };

  const handleResetModel = () => {
    if (modelResetRef.current) {
      modelResetRef.current();
    }
  };

  const validateAndRefreshToken = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setShowLoginModal(true);
      return false;
    }

    try {
      const response = await fetch(base_url + '/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (!response.ok) {
        setToken('');
        localStorage.removeItem('token');
        setShowLoginModal(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      setToken('');
      localStorage.removeItem('token');
      setShowLoginModal(true);
      return false;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await validateToken(token);
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
    if (selectedBuilding) {
      loadNodesForBuilding(selectedBuilding);
    }
  }, [selectedBuilding]);

  useEffect(() => {
    if (!isLinkingMode) {
      setLinkingSourceId(null);
      setHoveredNodeId(null);
    }
  }, [isLinkingMode]);

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

  const login = async (username, password, setLoginError) => {
    const response = await fetch(base_url + '/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      if (setLoginError) setLoginError('Неверный логин или пароль');
      return false;
    }
    const data = await response.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setShowLoginModal(false);
    window.location.reload();
    return true;
  };

  const register = async (username, password, setRegisterError) => {
    const response = await fetch(base_url + '/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      if (setRegisterError) setRegisterError('Ошибка регистрации. Такой логин уже существует или данные некорректны.');
      return false;
    }
    if (setRegisterError) setRegisterError('Регистрация прошла успешно!');
    setShowLoginModal(false);
    window.location.reload();
    return true;
  };

  const loadBuildings = async () => {
    try {
      const response = await fetch(`${base_url}/api/buildings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const buildings = await response.json();
        setBuildings(buildings);
        if (buildings.length > 0) {
          setSelectedBuilding(buildings[0].id);
        }
      } else {
        alert('Не удалось загрузить здания');
      }
    } catch (error) {
      console.error('Ошибка при загрузке зданий:', error);
      alert('Произошла ошибка при загрузке зданий');
    }
  };

  const updateConnectionsFromNodes = (nodes) => {
    const newConnections = [];
    nodes.forEach(node => {
      if (node.neighbors?.trim()) {
        const neighborIds = node.neighbors.split(',').map(id => id.trim());
        neighborIds.forEach(neighborId => {
          const connectionExists = newConnections.some(
            conn => 
              (conn.from === node.id && conn.to === parseInt(neighborId)) ||
              (conn.from === parseInt(neighborId) && conn.to === node.id)
          );
          
          if (!connectionExists) {
            newConnections.push({
              from: node.id,
              to: parseInt(neighborId)
            });
          }
        });
      }
    });
    setConnections(newConnections);
  };

  const loadNodesForBuilding = async (buildingId) => {
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
      
      const nodesWithQuaternion = nodes.map(node => ({
        ...node,
        quaternion: node.quaternion || '0,0,0,1'
      }));
      
      setNodes(nodesWithQuaternion);
      updateConnectionsFromNodes(nodesWithQuaternion);
    } catch (error) {
      console.error('Failed to load nodes:', error);
      setShowLoginModal(true);
    }
  };
  const handleCreateBuilding = async (buildingName, buildingAddress) => {
    try {
      const response = await fetch(base_url + '/api/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: buildingName, address: buildingAddress || '' })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      loadBuildings();
    } catch (error) {
      console.error('Failed to create building:', error);
    }
  };
  const handleRenameBuilding = async (buildingId, newName, newAddress) => {
    try {
      const response = await fetch(base_url + `/api/buildings/${buildingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newName,
          address: newAddress || ''
        })
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
  };  const createNodeLocal = useCallback(async () => {
    try {
      const randomName = Math.floor(Math.random() * 9000 + 1000);
    
      const newNodeData = {
        name: randomName.toString(),
        translation: '0,0,0',
        quaternion: '0,0,0,1',
        modelPath: '', 
        type: '',
        title: '',     
        neighbors: '',
        buildingId: selectedBuilding
      };
    
      const response = await fetch(`${base_url}/buildings/${selectedBuilding}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNodeData)
      });

      if (!response.ok) {
        throw new Error('Failed to create node');
      }

      const createdNode = await response.json();
      
      setNodes(prev => [...prev, createdNode]);
      setSelectedNode(createdNode);
      setHasUnsavedChanges(true);
      setChangedNodes(prev => {
        const updated = new Map(prev);
        updated.set(createdNode.id, 'added');
        return updated;
      });
    } catch (error) {
      console.error('Error creating node:', error);
      alert('Ошибка при создании точки');
    }
  }, [selectedBuilding, token]);

  const updateNodeLocal = async () => {
    if (!selectedNode || !selectedBuilding || !token) {
      alert('Необходимо выбрать здание и узел, а также войти в систему');
      return;
    }

    const isTokenValid = await validateAndRefreshToken();
    if (!isTokenValid) {
      alert('Сессия истекла. Пожалуйста, войдите снова.');
      return;
    }

    try {
      const buildingResponse = await fetch(`${base_url}/api/buildings/${selectedBuilding}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!buildingResponse.ok) {
        throw new Error('У вас нет прав на редактирование этого здания');
      }

      const nodeToUpdate = {
        id: selectedNode.id,
        name: selectedNode.name || '',
        translation: selectedNode.translation,
        neighbors: selectedNode.neighbors || '',
        buildingId: selectedBuilding,
        modelPath: selectedNode.modelPath || '',
        title: selectedNode.title || '',
        quaternion: '0,0,0,1'
      };

      const response = await fetch(`${base_url}/buildings/${selectedBuilding}/nodes/${selectedNode.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nodeToUpdate)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка обновления узла: ${response.status} ${errorText}`);
      }

      const updatedNodes = nodes.map(node => 
        node.id === selectedNode.id ? nodeToUpdate : node
      );
      setNodes(updatedNodes);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error updating node:', error);
      alert(error.message || 'Не удалось обновить узел. Пожалуйста, попробуйте снова.');
    }
  };
  
  const deleteNodeLocal = () => {
    if (!selectedNode) return;
    
    const newConnections = connections.filter(
      conn => conn.from !== selectedNode.id && conn.to !== selectedNode.id
    );
    setConnections(newConnections);
    
    setNodes(nodes.filter(node => node.id !== selectedNode.id));
    setSelectedNode(null);
  };
  
  const handleCreateConnection = (nodeId) => {
    if (!selectedNode || selectedNode.id === nodeId) return;

    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode.id) {
        const currentNeighbors = node.neighbors ? node.neighbors.split(',').map(n => n.trim()) : [];
        if (!currentNeighbors.includes(nodeId.toString())) {
          return {
            ...node,
            neighbors: [...currentNeighbors, nodeId].join(',')
          };
        }
      }
      return node;
    });

    setNodes(updatedNodes);
    updateConnectionsFromNodes(updatedNodes);
    setHasUnsavedChanges(true);
  };

  const handleNodeMove = (nodeId, newTranslation) => {
    if (!selectedBuilding) {
      alert('Пожалуйста, выберите здание');
      return;
    }

    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { 
          ...node, 
          translation: newTranslation,
          buildingId: selectedBuilding,
          quaternion: node.quaternion || '0,0,0,1'
        } : node
      )
    );
    
    setChangedNodes(prev => {
      const newMap = new Map(prev);
      newMap.set(nodeId, newTranslation);
      return newMap;
    });
    setHasUnsavedChanges(true);
  };  

  const handleSaveChanges = async () => {
    if (!selectedBuilding) {
      alert('Пожалуйста, выберите здание');
      return;
    }
    
    if (!token) {
      alert('Необходимо войти в систему');
      setShowLoginModal(true);
      return;
    }

    const isTokenValid = await validateAndRefreshToken();
    if (!isTokenValid) {
      alert('Сессия истекла. Пожалуйста, войдите снова.');
      return;
    }

    try {
      const buildingResponse = await fetch(`${base_url}/api/buildings/${selectedBuilding}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!buildingResponse.ok) {
        if (buildingResponse.status === 403) {
          throw new Error('У вас нет прав на редактирование этого здания');
        }
        throw new Error('Ошибка при проверке прав доступа к зданию');
      }

      for (const [nodeId, translation] of changedNodes) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;
        
        const response = await fetch(`${base_url}/buildings/${selectedBuilding}/nodes/${nodeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: nodeId,
            name: node.name || '',
            translation,
            neighbors: node.neighbors || '',
            buildingId: selectedBuilding,
            modelPath: node.modelPath || '',
            title: node.title || '',
            quaternion: '0,0,0,1'
          })
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Сессия истекла или нет прав для редактирования. Пожалуйста, войдите снова.');
          }
          const errorText = await response.text();
          throw new Error(`Ошибка сохранения узла ${nodeId}: ${response.status} ${errorText}`);
        }
      }

      setChangedNodes(new Map());
      setHasUnsavedChanges(false);
      alert('Изменения успешно сохранены');
    } catch (error) {
      console.error('Error saving changes:', error);
      if (error.message.includes('Сессия истекла')) {
        setShowLoginModal(true);
      }
      alert(error.message || 'Не удалось сохранить изменения. Пожалуйста, попробуйте снова.');
    }
  };

  const handleAddConnection = async (fromId, toId) => {
    if (!selectedBuilding || !token) {
      alert('Необходимо выбрать здание и войти в систему');
      return;
    }

    try {
      const fromNode = nodes.find(n => n.id === fromId);
      const toNode = nodes.find(n => n.id === toId);
      
      if (!fromNode || !toNode) {
        throw new Error('Узлы не найдены');
      }

      const fromNeighbors = fromNode.neighbors ? 
        fromNode.neighbors.split(',').map(n => n.trim()) : [];
      if (!fromNeighbors.includes(toId.toString())) {
        fromNeighbors.push(toId.toString());
      }

      const toNeighbors = toNode.neighbors ?
        toNode.neighbors.split(',').map(n => n.trim()) : [];
      if (!toNeighbors.includes(fromId.toString())) {
        toNeighbors.push(fromId.toString());
      }

      await Promise.all([
        fetch(`${base_url}/buildings/${selectedBuilding}/nodes/${fromId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...fromNode,
            neighbors: fromNeighbors.join(',')
          })
        }),
        fetch(`${base_url}/buildings/${selectedBuilding}/nodes/${toId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...toNode,
            neighbors: toNeighbors.join(',')
          })
        })
      ]);

      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === fromId) {
            return { ...node, neighbors: fromNeighbors.join(',') };
          }
          if (node.id === toId) {
            return { ...node, neighbors: toNeighbors.join(',') };
          }
          return node;
        })
      );

      setConnections(prev => [
        ...prev,
        { from: fromId, to: toId }
      ]);

    } catch (error) {
      console.error('Error adding connection:', error);
      alert('Не удалось создать связь: ' + error.message);
    }
  };

  const handleRemoveConnection = async (fromId, toId) => {
    if (!selectedBuilding || !token) {
      alert('Необходимо выбрать здание и войти в систему');
      return;
    }

    try {
      const fromNode = nodes.find(n => n.id === fromId);
      const toNode = nodes.find(n => n.id === toId);
      
      if (!fromNode || !toNode) {
        throw new Error('Узлы не найдены');
      }

      const fromNeighbors = fromNode.neighbors ?
        fromNode.neighbors.split(',').filter(n => n.trim() !== toId.toString()) : [];
      const toNeighbors = toNode.neighbors ?
        toNode.neighbors.split(',').filter(n => n.trim() !== fromId.toString()) : [];

      await Promise.all([
        fetch(`${base_url}/buildings/${selectedBuilding}/nodes/${fromId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...fromNode,
            neighbors: fromNeighbors.join(',')
          })
        }),
        fetch(`${base_url}/buildings/${selectedBuilding}/nodes/${toId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...toNode,
            neighbors: toNeighbors.join(',')
          })
        })
      ]);

      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === fromId) {
            return { ...node, neighbors: fromNeighbors.join(',') };
          }
          if (node.id === toId) {
            return { ...node, neighbors: toNeighbors.join(',') };
          }
          return node;
        })
      );

      setConnections(prev => 
        prev.filter(conn => 
          !(conn.from === fromId && conn.to === toId) &&
          !(conn.from === toId && conn.to === fromId)
        )
      );

    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Не удалось удалить связь: ' + error.message);
    }
  };

  const handleNodeSelect = useCallback((node) => {
    if (isLinkingMode) {
      if (!linkingSourceId) {
        setLinkingSourceId(node.id);
      } else if (node.id !== linkingSourceId) {
        handleAddConnection(linkingSourceId, node.id);
        setLinkingSourceId(null);
        setIsLinkingMode(false);
      }
    } else {
      setSelectedNode(node);
    }
  }, [isLinkingMode, linkingSourceId]);

  const handleNodeHover = useCallback((nodeId) => {
    setHoveredNodeId(nodeId);
  }, []);

  return (
    <>
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
        <BuildingName 
          buildingName={buildings.find(building => building.id === selectedBuilding)?.name}
          onOpenStatistic={() => setShowStatistic(true)}
        />
        <div id="controls" className={isSidebarOpen ? 'sidebar-open' : ''} 
          style={{ position: 'absolute', top: '10px', left: '75px', zIndex: 1000 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <NodeControls
              selectedNode={selectedNode ? { ...selectedNode, name: String(selectedNode.name ?? ''), title: String(selectedNode.title ?? '') } : null}
              setSelectedNode={setSelectedNode}
              buildings={buildings}
              selectedBuilding={selectedBuilding}
              setSelectedBuilding={setSelectedBuilding}
              nodes={nodes.map(n => ({ ...n, name: String(n.name ?? ''), title: String(n.title ?? '') }))}
              onCreateConnection={handleCreateConnection}
              createNode={createNodeLocal}
              updateNode={updateNodeLocal}
              deleteNode={deleteNodeLocal}
              isLinkingMode={isLinkingMode}
              setIsLinkingMode={setIsLinkingMode}
              setShowQR={setShowQR}
              onResetCamera={handleResetCamera}
              onResetModel={handleResetModel}
            />
          </div>
        </div>
        <Scene3D 
          nodes={nodes.map(n => ({ ...n, name: String(n.name ?? ''), title: String(n.title ?? '') }))}
          connections={connections}
          selectedNodeId={selectedNode?.id}
          onSelectNode={handleNodeSelect}
          onNodeMove={handleNodeMove}
          onAddConnection={handleAddConnection}
          onRemoveConnection={handleRemoveConnection}
          isLinkingMode={isLinkingMode}
          linkingSourceId={linkingSourceId}
          hoveredNodeId={hoveredNodeId}
          onNodeHover={handleNodeHover}
          orbitControlsRef={orbitControlsRef}
          modelResetRef={modelResetRef}
        />
        <LoginModal
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={login}
          onRegister={register}
        />
        <SaveChangesButton 
          onSave={handleSaveChanges}
          visible={hasUnsavedChanges}
        />
        <div className="scene-container">
          <Scene3D
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNode?.id}
            onSelectNode={setSelectedNode}
            onNodeMove={handleNodeMove}
          />
        </div>
        {showStatistic && (
          <div style={{ 
            position: 'fixed', 
            top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(0,0,0,0.25)', 
            zIndex: 2000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transition: 'background 0.25s',
            animation: 'fadeInBg 0.25s'
          }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 12, 
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)', 
              padding: 0, 
              minWidth: 400, 
              minHeight: 300, 
              position: 'relative',
              animation: 'modalPopIn 0.33s cubic-bezier(.22,1,.36,1)'
            }}>
              <button onClick={() => setShowStatistic(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }} title="Закрыть">×</button>
              <StatisticPanel buildingId={selectedBuilding} onClose={() => setShowStatistic(false)} />
            </div>
            <style>{`
              @keyframes fadeInBg {
                from { background: rgba(0,0,0,0); }
                to { background: rgba(0,0,0,0.25); }
              }
              @keyframes modalPopIn {
                0% { opacity: 0; transform: scale(0.85) translateY(40px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
          </div>
        )}
        <StatisticPanel />
      </div>
      {showQR && (
        <NodeInfo 
          selectedNode={selectedNode ? { ...selectedNode, name: String(selectedNode.name ?? ''), title: String(selectedNode.title ?? '') } : null}
          building={buildings.find(b => b.id === selectedBuilding)}
          showQR={showQR}
          onShowQR={() => setShowQR(true)}
          onCloseQR={() => setShowQR(false)}
          nodes={nodes.map(n => ({ ...n, name: String(n.name ?? ''), title: String(n.title ?? ''), type: n.type }))}
        />
      )}
      <div style={{ position: 'fixed', top: 24, right: 32, zIndex: 3000 }}>
        {token ? (
          <button
            onClick={() => {
              setToken('');
              localStorage.removeItem('token');
              window.location.reload();
            }}
            style={{
              background: 'linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '7px 22px',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px #c7d2fe',
              cursor: 'pointer',
              transition: 'background 0.18s',
              letterSpacing: 0.5,
              outline: 'none',
              minWidth: 110
            }}
            onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
            onFocus={e => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)'}
            onBlur={e => e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)'}
          >
            Выйти
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              background: 'linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 22px',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px #c7d2fe',
              cursor: 'pointer',
              transition: 'background 0.18s',
              letterSpacing: 0.5,
              outline: 'none',
              minWidth: 110
            }}
            onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
            onFocus={e => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)'}
            onBlur={e => e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)'}
          >
            Войти
          </button>
        )}
      </div>
    </>
  );
}

export default App;