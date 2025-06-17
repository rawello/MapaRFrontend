import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';

const AxisArrows = ({ position, onMove, selectedNode, nodes, setNodes }) => {
    const arrowXRef = useRef();
    const arrowYRef = useRef();
    const arrowZRef = useRef();
    const isDraggingRef = useRef(false);
    const dragStartPositionRef = useRef(new THREE.Vector2());
    const dragAxisRef = useRef(null);

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
    }, [selectedNode, nodes, setNodes]);

    return (
        <group position={position}>
            <group ref={arrowXRef} onPointerDown={(e) => handlePointerDown(e, 'x')} />
            <group ref={arrowYRef} onPointerDown={(e) => handlePointerDown(e, 'y')} />
            <group ref={arrowZRef} onPointerDown={(e) => handlePointerDown(e, 'z')} />
            {selectedNode && (
                <TransformControls object={selectedNode} mode="translate" onChange={() => {
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
                }} />
            )}
        </group>
    );
};

export default AxisArrows;