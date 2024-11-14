import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './ModelManager.css';

const ModelManager = ({ scene }) => {
    const [models, setModels] = useState([]);

    useEffect(() => {
        if (scene) {
            loadModelsFromLocalStorage();
        }
    }, [scene]);

    const loadModelsFromLocalStorage = () => {
        const modelsData = JSON.parse(localStorage.getItem('models')) || [];
        setModels(modelsData);
        modelsData.forEach(model => {
            const { url, position } = model;
            const loader = new GLTFLoader();
            loader.load(url, (gltf) => {
                if (scene) {
                    const object = gltf.scene;
                    object.position.set(...position);
                    scene.add(object);
                } else {
                    console.error('Scene is not defined');
                }
            }, undefined, (error) => {
                console.error('An error occurred while loading the model:', error);
            });
        });
    };

    const saveModelToLocalStorage = (modelUrl, position) => {
        const modelsData = JSON.parse(localStorage.getItem('models')) || [];
        modelsData.push({ url: modelUrl, position });
        localStorage.setItem('models', JSON.stringify(modelsData));
        setModels(modelsData);
    };

    const handleModelUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const modelUrl = e.target.result;
            const position = [0, 0, 0];
            saveModelToLocalStorage(modelUrl, position);
            if (scene) {
                const loader = new GLTFLoader();
                loader.load(modelUrl, (gltf) => {
                    const object = gltf.scene;
                    object.position.set(...position);
                    scene.add(object);
                }, undefined, (error) => {
                    console.error('An error occurred while loading the model:', error);
                });
            } else {
                console.error('Scene is not defined');
            }
        };
        reader.readAsDataURL(file);
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
        </div>
    );
};

export default ModelManager;