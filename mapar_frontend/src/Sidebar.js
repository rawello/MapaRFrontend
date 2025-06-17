import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Sidebar.css';

const Sidebar = ({ buildings, selectedBuilding, setSelectedBuilding, isOpen, setIsOpen, onRename, onDelete, onCreate }) => {
    const [newBuildingName, setNewBuildingName] = useState('');
    const [newBuildingAddress, setNewBuildingAddress] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingBuildingId, setEditingBuildingId] = useState(null);
    const [editedBuildingName, setEditedBuildingName] = useState('');
    const [editedBuildingAddress, setEditedBuildingAddress] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setEditingBuildingId(null);
            setEditedBuildingName('');
            setEditedBuildingAddress('');
        }
    }, [isOpen]);

    const handleRename = (buildingId, e) => {
        e.stopPropagation();
        if (editingBuildingId === buildingId) {
            setEditingBuildingId(null);
            setEditedBuildingName('');
            setEditedBuildingAddress('');
            return;
        }
        const building = buildings.find(b => b.id === buildingId);
        setEditingBuildingId(buildingId);
        setEditedBuildingName(building.name);
        setEditedBuildingAddress(building.address || '');
    };

    const handleSave = (buildingId) => {
        if (editedBuildingName) {
            onRename(buildingId, editedBuildingName, editedBuildingAddress);
            setEditingBuildingId(null);
            setEditedBuildingAddress('');
        }
    };

    const handleDelete = (buildingId) => {
        if (window.confirm('Вы уверены, что хотите удалить это здание?')) {
            onDelete(buildingId);
            setEditingBuildingId(null);
            setEditedBuildingAddress('');
        }
    };

    const handleCreate = () => {
        if (newBuildingName) {
            onCreate(newBuildingName, newBuildingAddress);
            setNewBuildingName('');
            setNewBuildingAddress('');
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e, action) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };

    // Фильтрация зданий по названию или адресу
    const filteredBuildings = buildings.filter(b => {
        const s = search.trim().toLowerCase();
        return !s || b.name.toLowerCase().includes(s) || b.address?.toLowerCase().includes(s);
    });

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button 
                className="toggleButton" 
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (isOpen) {
                        setEditingBuildingId(null);
                        setEditedBuildingName('');
                        setEditedBuildingAddress('');
                    }
                }}
                onKeyDown={(e) => handleKeyDown(e, () => {
                    setIsOpen(!isOpen);
                    if (isOpen) {
                        setEditingBuildingId(null);
                        setEditedBuildingName('');
                        setEditedBuildingAddress('');
                    }
                })}
                aria-label={isOpen ? "Свернуть сайдбар" : "Развернуть сайдбар"}
            >
                {isOpen ? '<<' : '>>'}
            </button>
            <div className="sidebarContent">
                {isOpen && (
                    <>
                        <div style={{ margin: '8px 0 16px 0' }}>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Поиск здания по названию или адресу..."
                                className="sidebar-search-input"
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--input-border)',
                                    padding: '0 16px',
                                    fontSize: 15,
                                    background: 'var(--input-background)',
                                    marginBottom: 8,
                                    boxShadow: 'var(--input-shadow)',
                                    outline: 'none',
                                    transition: 'all 0.18s',
                                }}
                            />
                        </div>
                        <div className={`createBuilding ${isCreating ? 'active' : ''}`}>
                            <button onClick={() => setIsCreating(!isCreating)}>
                                Добавить здание
                            </button>
                            <div className={`createBuildingForm ${isCreating ? 'open' : ''}`}>
                                <input
                                    type="text"
                                    placeholder="Новое имя здания"
                                    value={newBuildingName}
                                    onChange={(e) => setNewBuildingName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Адрес здания"
                                    value={newBuildingAddress}
                                    onChange={(e) => setNewBuildingAddress(e.target.value)}
                                />
                                <div className="modalButtons">
                                    <button onClick={handleCreate}>Создать</button>
                                    <button onClick={() => setIsCreating(false)}>Отмена</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <div className={`buildingsList ${isCreating ? 'creating' : ''}`}>
                    {filteredBuildings.map(building => (
                        <div key={building.id}>
                            <button
                                className={`building ${selectedBuilding === building.id ? 'selected' : ''}`}
                                onClick={() => setSelectedBuilding(building.id)}
                                onKeyDown={(e) => handleKeyDown(e, () => setSelectedBuilding(building.id))}
                            >
                                <img src="/building2.png" alt={building.name} />
                                <span>{building.name}</span>
                                {isOpen && (
                                    <button 
                                        className="iconButton renameButton" 
                                        onClick={(e) => handleRename(building.id, e)}
                                        aria-label="Редактировать здание"
                                    >
                                        <img src="/edit.png" alt="Редактировать" />
                                    </button>
                                )}
                            </button>
                            <div className={`editMenu ${editingBuildingId === building.id ? 'open' : ''}`}>
                                <input
                                    type="text"
                                    value={editedBuildingName}
                                    onChange={(e) => setEditedBuildingName(e.target.value)}
                                    placeholder="Название здания"
                                />
                                <input
                                    type="text"
                                    value={editedBuildingAddress}
                                    onChange={(e) => setEditedBuildingAddress(e.target.value)}
                                    placeholder="Адрес здания"
                                />
                                <div className="modalButtons">
                                    <button onClick={() => handleSave(building.id)}>Сохранить</button>
                                    <button onClick={() => handleDelete(building.id)} style={{marginLeft: 8}}>Удалить</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

Sidebar.propTypes = {
    buildings: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        address: PropTypes.string
    })).isRequired,
    selectedBuilding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setSelectedBuilding: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired
};

export default Sidebar;