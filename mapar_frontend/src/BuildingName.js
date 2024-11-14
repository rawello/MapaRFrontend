import React from 'react';
import './BuildingName.css';

const BuildingName = ({ buildingName }) => {
    return (
        <div id="buildingName" className="building-name">
            {buildingName || 'Select a Building'}
        </div>
    );
};

export default BuildingName;