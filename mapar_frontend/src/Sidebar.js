import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ buildings, selectedBuilding, setSelectedBuilding, isOpen, setIsOpen }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="toggleButton" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '<<' : '>>'}
            </div>
            <div className="sidebarContent">
                {buildings.map(building => (
                    <div
                        key={building.id}
                        className={`building ${selectedBuilding === building.id ? 'selected' : ''}`}
                        onClick={() => setSelectedBuilding(building.id)}
                    >
                        <img src="/building2.png" alt={building.name} />
                        <span>{building.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;