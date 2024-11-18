import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ArrowHelper } from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

const AxisArrows = ({ position, onMove, scene, selectedNode, setSelectedNode, nodes, setNodes, transformControlsRef, controlsRef }) => {
    const arrowXRef = useRef();
    const arrowYRef = useRef();
    const arrowZRef = useRef();
    const isDraggingRef = useRef(false);
    const dragStartPositionRef = useRef(new THREE.Vector2());
    const dragAxisRef = useRef(null);

    useEffect(() => {
        const arrowXCurrent = arrowXRef.current;
        const arrowYCurrent = arrowYRef.current;
        const arrowZCurrent = arrowZRef.current;

        const arrowX = new ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000);
        arrowXCurrent.add(arrowX);

        const arrowY = new ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x00ff00);
        arrowYCurrent.add(arrowY);

        const arrowZ = new ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0x0000ff);
        arrowZCurrent.add(arrowZ);

        if (selectedNode) {
            selectedNode.add(arrowXCurrent);
            selectedNode.add(arrowYCurrent);
            selectedNode.add(arrowZCurrent);
        }

        
        return () => {
            if (selectedNode) {
                selectedNode.remove(arrowXCurrent);
                selectedNode.remove(arrowYCurrent);
                selectedNode.remove(arrowZCurrent);
            }
        };
    }, [scene, selectedNode]);

    const handlePointerDown = (event, axis) => {
        event.stopPropagation();
        isDraggingRef.current = true;
        dragAxisRef.current = axis;
        dragStartPositionRef.current.set(event.clientX, event.clientY);
    };

    const handlePointerMove = (event) => {
        if (!isDraggingRef.current) return;

        const dragDelta = new THREE.Vector2(event.clientX, event.clientY).sub(dragStartPositionRef.current);
        const step = dragDelta.length() * 0.0005;

        if (dragAxisRef.current === 'x') {
            onMove('x', step);
        } else if (dragAxisRef.current === 'y') {
            onMove('y', step * (dragDelta.y > 0 ? 1 : -1));
        } else if (dragAxisRef.current === 'z') {
            onMove('z', step * (dragDelta.y > 0 ? 1 : -1));
        }
    };

    const handlePointerUp = () => {
        isDraggingRef.current = false;
        dragAxisRef.current = null;
    };

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    useEffect(() => {
        if (selectedNode) {
            transformControlsRef.current.attach(selectedNode);
            scene.add(transformControlsRef.current);

            transformControlsRef.current.addEventListener('dragging-changed', (event) => {
                controlsRef.current.enabled = !event.value;
            });

            transformControlsRef.current.addEventListener('change', () => {
                if (selectedNode) {
                    const updatedNodes = nodes.map(node => {
                        if (node.id === selectedNode.userData.nodeId) {
                            return {
                                ...node,
                                translation: `${selectedNode.position.x},${selectedNode.position.y},${selectedNode.position.z}`
                            };
                        }
                        return node;
                    });
                    setNodes(updatedNodes);
                }
            });
        } else {
            transformControlsRef.current.detach();
        }
    }, [selectedNode, nodes, setNodes, scene, transformControlsRef, controlsRef]);

    return (
        <group position={position}>
            <group ref={arrowXRef} onPointerDown={(e) => handlePointerDown(e, 'x')} />
            <group ref={arrowYRef} onPointerDown={(e) => handlePointerDown(e, 'y')} />
            <group ref={arrowZRef} onPointerDown={(e) => handlePointerDown(e, 'z')} />
        </group>
    );
};

export default AxisArrows;