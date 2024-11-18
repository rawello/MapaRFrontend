import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './ModelManager.css';

const ModelManager = ({ scene, onModelSelect }) => {
    const [models, setModels] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loadedModels, setLoadedModels] = useState([]);

    useEffect(() => {
        if (scene) {
            loadModelsFromLocalStorage();
        }
    }, [scene]);

    const loadModelsFromLocalStorage = () => {
        const modelsData = JSON.parse(localStorage.getItem('models')) || [];
        setModels(modelsData);
    };

    const saveModelToLocalStorage = (modelUrl, position, name, source) => {
        const modelsData = JSON.parse(localStorage.getItem('models')) || [];
        modelsData.push({ url: modelUrl, position, name, source });
        localStorage.setItem('models', JSON.stringify(modelsData));
        setModels(modelsData);
    };

    const handleModelUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const modelUrl = e.target.result;
            const position = [0, 0, 0];
            const name = file.name;
            const source = 'Local Upload';
            saveModelToLocalStorage(modelUrl, position, name, source);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteModel = (index) => {
        const modelsData = JSON.parse(localStorage.getItem('models')) || [];
        const modelToDelete = modelsData[index];
        modelsData.splice(index, 1);
        localStorage.setItem('models', JSON.stringify(modelsData));
        setModels(modelsData);

        const loadedModelIndex = loadedModels.findIndex(model => model.url === modelToDelete.url);
        if (loadedModelIndex !== -1) {
            scene.remove(loadedModels[loadedModelIndex].object);
            setLoadedModels(prev => prev.filter((_, i) => i !== loadedModelIndex));
        }
    };

    const handleAddModelToScene = (model) => {
        const loader = new GLTFLoader();
        loader.load(model.url, (gltf) => {
            const object = gltf.scene;
            object.position.set(...model.position);
            scene.add(object);
            setLoadedModels(prev => [...prev, { url: model.url, object }]);
        }, undefined, (error) => {
            console.error('An error occurred while loading the model:', error);
        });
    };

    const handleSelectModel = (model) => {
        const selectedModel = loadedModels.find(m => m.url === model.url);
        if (selectedModel) {
            onModelSelect(selectedModel.object);
        }
    };

    return (
        <div className="model-manager">
            <h3>Upload 3D Model</h3>
            <div className="file-upload-container">
                <input type="file" id="file-upload" onChange={handleModelUpload} />
                <label htmlFor="file-upload" className="file-upload-label">
                    <span>Choose a file</span>
                    <span className="file-upload-icon">📁</span>
                </label>
            </div>
            <button onClick={() => setShowModal(true)}>View Uploaded Models</button>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        <h3>Uploaded Models</h3>
                        <ul>
                            {models.map((model, index) => (
                                <li key={index}>
                                    <div>
                                        <strong>Name:</strong> {model.name}<br />
                                    </div>
                                    <button onClick={() => handleDeleteModel(index)}>Delete</button>
                                    <button onClick={() => handleAddModelToScene(model)}>Add to Scene</button>
                                    <button onClick={() => handleSelectModel(model)}>Select</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelManager;