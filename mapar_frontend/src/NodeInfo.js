import React from 'react';
import './NodeInfo.css';

const NodeInfo = ({ selectedNode }) => {
    return (
        <div className="nodeInfo">
            <h3>Node Info</h3>
            <div>
                <label htmlFor="nodeCoordinates">Coordinates:</label>
                <span id="nodeCoordinates">{selectedNode ? selectedNode.userData.translation : ''}</span>
            </div>
        </div>
    );
};

export default NodeInfo;