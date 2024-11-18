import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ buildings, selectedBuilding, setSelectedBuilding, isOpen, setIsOpen, onRename, onDelete, onCreate }) => {
    const [newBuildingName, setNewBuildingName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingBuildingId, setEditingBuildingId] = useState(null);
    const [editedBuildingName, setEditedBuildingName] = useState('');

    const handleRename = (buildingId) => {
        setEditingBuildingId(buildingId);
        setEditedBuildingName(buildings.find(b => b.id === buildingId).name);
    };

    const handleSave = (buildingId) => {
        if (editedBuildingName) {
            onRename(buildingId, editedBuildingName);
            setEditingBuildingId(null);
        }
    };

    const handleDelete = (buildingId) => {
        if (window.confirm('Are you sure you want to delete this building?')) {
            onDelete(buildingId);
            setEditingBuildingId(null);
        }
    };

    const handleCancel = () => {
        setEditingBuildingId(null);
    };

    const handleCreate = () => {
        if (newBuildingName) {
            onCreate(newBuildingName);
            setNewBuildingName('');
            setIsCreating(false);
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="toggleButton" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '<<' : '>>'}
            </div>
            <div className="sidebarContent">
                {isOpen && (
                    <div className={`createBuilding ${isCreating ? 'active' : ''}`}>
                        <button onClick={() => setIsCreating(!isCreating)}>Add Building</button>
                        <div className={`createBuildingForm ${isCreating ? 'open' : ''}`}>
                            <input
                                type="text"
                                placeholder="New building name"
                                value={newBuildingName}
                                onChange={(e) => setNewBuildingName(e.target.value)}
                            />
                            <div className="modalButtons">
                                <button onClick={handleCreate}>Create</button>
                                <button onClick={() => setIsCreating(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className={`buildingsList ${isCreating ? 'creating' : ''}`}>
                    {buildings.map(building => (
                        <div key={building.id}>
                            <div
                                className={`building ${selectedBuilding === building.id ? 'selected' : ''}`}
                                onClick={() => setSelectedBuilding(building.id)}
                            >
                                <img src="/building2.png" alt={building.name} />
                                <span>{building.name}</span>
                                {isOpen && (
                                    <button className="iconButton renameButton" onClick={() => handleRename(building.id)}>
                                        <img src="/edit.png" alt="Rename" />
                                    </button>
                                )}
                            </div>
                            <div className={`editMenu ${editingBuildingId === building.id ? 'open' : ''}`}>
                                <input
                                    type="text"
                                    value={editedBuildingName}
                                    onChange={(e) => setEditedBuildingName(e.target.value)}
                                />
                                <div className="modalButtons">
                                    <div className="row">
                                        <button onClick={() => handleSave(building.id)}>Save</button>
                                        <button onClick={() => handleDelete(building.id)}>Delete</button>
                                    </div>
                                    <div className="row">
                                        <button onClick={handleCancel}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;