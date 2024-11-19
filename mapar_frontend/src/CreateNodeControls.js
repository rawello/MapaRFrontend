import React from 'react';

const CreateNodeControls = ({ createNode }) => {
    return (
        <div className="create-node-controls">
            <h3>Create Node</h3>
            <div>
                <label htmlFor="newNodeLabel">Name:</label>
                <input type="text" id="newNodeLabel" />
            </div>
            <div>
                <label htmlFor="newNodeNeighbors">Neighbors:</label>
                <input type="text" id="newNodeNeighbors" />
            </div>
            <div>
                <label htmlFor="newNodeX">X:</label>
                <input type="number" id="newNodeX" step="0.1" />
            </div>
            <div>
                <label htmlFor="newNodeY">Y:</label>
                <input type="number" id="newNodeY" step="0.1" />
            </div>
            <div>
                <label htmlFor="newNodeZ">Z:</label>
                <input type="number" id="newNodeZ" step="0.1" />
            </div>
            <button onClick={createNode}>Create Node</button>
        </div>
    );
};

export default CreateNodeControls;