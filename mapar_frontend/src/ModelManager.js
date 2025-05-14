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

    const handleAddModelToScene = (model) => {
        if (!scene) {
            console.error('Scene is not defined');
            return;
        }

        const loader = new GLTFLoader();
        loader.load(
            model.url,
            (gltf) => {
                const object = gltf.scene;
                object.position.set(...model.position);
                scene.add(object);
                setLoadedModels((prev) => [...prev, { url: model.url, object }]);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                alert('Не удалось загрузить модель. Проверьте файл.');
            }
        );
    };

    const handleSelectModel = (model) => {
        const selectedModel = loadedModels.find((m) => m.url === model.url);
        if (selectedModel) {
            onModelSelect(selectedModel.object);
        }
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
            const blob = dataURLToBlob(modelUrl);
            const objectUrl = URL.createObjectURL(blob);
            const position = [0, 1, 0]; // Поднимаем модель над плоскостью
            const name = file.name;
            const source = 'Local Upload';
            saveModelToLocalStorage(objectUrl, position, name, source);
        };
        reader.readAsDataURL(file);
    };

    const dataURLToBlob = (dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    const handleDeleteModel = (index) => {
        const modelsData = JSON.parse(localStorage.getItem('models')) || [];
        const modelToDelete = modelsData[index];
        modelsData.splice(index, 1);
        localStorage.setItem('models', JSON.stringify(modelsData));
        setModels(modelsData);

        const loadedModelIndex = loadedModels.findIndex((model) => model.url === modelToDelete.url);
        if (loadedModelIndex !== -1) {
            scene.remove(loadedModels[loadedModelIndex].object);
            URL.revokeObjectURL(modelToDelete.url); // Очистка временного URL
            setLoadedModels((prev) => prev.filter((_, i) => i !== loadedModelIndex));
        }
    };

    return (
        <div className="model-manager">
            <h3>Загрузка 3D модели</h3>
            <div className="file-upload-container">
                <input type="file" id="file-upload" onChange={handleModelUpload} />
                <label htmlFor="file-upload" className="file-upload-label">
                    <span>Выберите файл</span>
                    <span className="file-upload-icon">📁</span>
                </label>
            </div>
            <button onClick={() => setShowModal(true)}>Просмотр загруженных моделей</button>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>
                            &times;
                        </span>
                        <h3>Загруженные модели</h3>
                        <ul>
                            {models.map((model, index) => (
                                <li key={index}>
                                    <div>
                                        <strong>Имя:</strong> {model.name}
                                        <br />
                                    </div>
                                    <button onClick={() => handleDeleteModel(index)}>Удалить</button>
                                    <button onClick={() => handleAddModelToScene(model)}>На сцену</button>
                                    <button onClick={() => handleSelectModel(model)}>Выбор</button>
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