import React, { useEffect } from 'react';
import './NodeControls.css';

const NodeControls = ({ selectedNode, buildings, selectedBuilding, setSelectedBuilding, updateNode, deleteNode, nodes, nodeGroups, setSelectedNode }) => {
    useEffect(() => {
        try {
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
        } catch (error) {
            console.error('Error updating NodeControls:', error);
        }
    }, [selectedNode]);

    return (
        <div className="controls">
            <h3>Edit Node</h3>
            <div>
                <label htmlFor="buildingId">Building:</label>
                <select id="buildingId" value={selectedBuilding || ''} onChange={(e) => setSelectedBuilding(e.target.value)}>
                    {buildings.map(building => (
                        <option key={building.id} value={building.id}>{building.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="nodeId">Node ID:</label>
                <select id="nodeId" value={selectedNode ? selectedNode.userData.id : ''} onChange={(e) => {
                    const nodeId = e.target.value;
                    const node = nodes.find(node => node.id === nodeId);
                    if (node) {
                        const nodeGroup = nodeGroups.find(group => group.userData.nodeId === nodeId);
                        if (nodeGroup) {
                            setSelectedNode(nodeGroup);
                        }
                    }
                }}>
                    {nodes.map(node => (
                        <option key={node.id} value={node.id}>{node.id}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="nodeLabel">Name:</label>
                <input type="text" id="nodeLabel" defaultValue={selectedNode ? selectedNode.userData.name : ''} />
            </div>
            <div>
                <label htmlFor="nodeNeighbors">Neighbors:</label>
                <input type="text" id="nodeNeighbors" defaultValue={selectedNode ? selectedNode.userData.neighbors : ''} />
            </div>
            <div>
                <label htmlFor="nodeX">X:</label>
                <input type="number" id="nodeX" step="0.1" defaultValue={selectedNode ? selectedNode.position.x : ''} />
            </div>
            <div>
                <label htmlFor="nodeY">Y:</label>
                <input type="number" id="nodeY" step="0.1" defaultValue={selectedNode ? selectedNode.position.y : ''} />
            </div>
            <div>
                <label htmlFor="nodeZ">Z:</label>
                <input type="number" id="nodeZ" step="0.1" defaultValue={selectedNode ? selectedNode.position.z : ''} />
            </div>
            <button id="updateNode" onClick={updateNode}>Update Node</button>
            <button id="deleteNode" onClick={deleteNode}>Delete Node</button>
        </div>
    );
};

export default NodeControls;