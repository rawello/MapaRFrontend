import React from 'react';
import './CreateNodeControls.css';

const CreateNodeControls = ({ createNode }) => {
    return (
        <div className="controls">
            <h3>Создать точку</h3>
            <div>
                <label htmlFor="newNodeLabel">Имя:</label>
                <input type="text" id="newNodeLabel" />
            </div>
            <div>
                <label htmlFor="newNodeNeighbors">Связи:</label>
                <input type="text" id="newNodeNeighbors" />
            </div>
            <div>
                <label htmlFor="newNodeX">X:</label>
                <input type="number" id="newNodeX" step="0.1" defaultValue="0" />
            </div>
            <div>
                <label htmlFor="newNodeY">Y:</label>
                <input type="number" id="newNodeY" step="0.1" defaultValue="0" />
            </div>
            <div>
                <label htmlFor="newNodeZ">Z:</label>
                <input type="number" id="newNodeZ" step="0.1" defaultValue="0" />
            </div>
            <div>
                <label htmlFor="newNodeQuaternion">Quaternion:</label>
                <input type="text" id="newNodeQuaternion" defaultValue="0,0,0,1" readOnly />
            </div>
            <button id="createNode" onClick={createNode}>Создать</button>
        </div>
    );
};

export default CreateNodeControls;