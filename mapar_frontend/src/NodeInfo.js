import React from 'react';
import PropTypes from 'prop-types';
import './NodeInfo.css';

const NodeInfo = ({ selectedNode }) => {
    return (
        <div className="nodeInfo">
            <h3>Информация: </h3>
            <div>
                <label htmlFor="nodeCoordinates">Координаты:</label>
                <span id="nodeCoordinates">{selectedNode?.translation || ''}</span>
            </div>
            <div>
                <label htmlFor="nodeQuaternion">Кватернион:</label>
                <span id="nodeQuaternion">{selectedNode?.quaternion || '0,0,0,1'}</span>
            </div>
        </div>
    );
};

NodeInfo.propTypes = {
    selectedNode: PropTypes.shape({
        translation: PropTypes.string,
        quaternion: PropTypes.string
    })
};

export default NodeInfo;