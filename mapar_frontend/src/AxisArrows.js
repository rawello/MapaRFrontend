import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const AxisArrows = ({ position, onMove }) => {
    const arrowXRef = useRef();
    const arrowYRef = useRef();
    const arrowZRef = useRef();

    useEffect(() => {
        const arrowXGeometry = new THREE.ConeGeometry(0.1, 0.5, 32);
        const arrowXMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const arrowX = new THREE.Mesh(arrowXGeometry, arrowXMaterial);
        arrowX.position.set(0.5, 0, 0);
        arrowX.rotation.z = Math.PI / 2;
        arrowXRef.current.add(arrowX);

        const arrowYGeometry = new THREE.ConeGeometry(0.1, 0.5, 32);
        const arrowYMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const arrowY = new THREE.Mesh(arrowYGeometry, arrowYMaterial);
        arrowY.position.set(0, 0.5, 0);
        arrowYRef.current.add(arrowY);

        const arrowZGeometry = new THREE.ConeGeometry(0.1, 0.5, 32);
        const arrowZMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const arrowZ = new THREE.Mesh(arrowZGeometry, arrowZMaterial);
        arrowZ.position.set(0, 0, 0.5);
        arrowZ.rotation.x = Math.PI / 2;
        arrowZRef.current.add(arrowZ);
    }, []);

    useFrame(() => {
        if (arrowXRef.current) arrowXRef.current.position.copy(position);
        if (arrowYRef.current) arrowYRef.current.position.copy(position);
        if (arrowZRef.current) arrowZRef.current.position.copy(position);
    });

    const handleClick = (axis) => {
        onMove(axis);
    };

    return (
        <group>
            <mesh ref={arrowXRef} onClick={() => handleClick('x')} />
            <mesh ref={arrowYRef} onClick={() => handleClick('y')} />
            <mesh ref={arrowZRef} onClick={() => handleClick('z')} />
        </group>
    );
};

export default AxisArrows;