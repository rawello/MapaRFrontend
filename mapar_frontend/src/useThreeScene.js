import { useRef, useEffect } from 'react';
import * as THREE from 'three';

function useThreeScene(container, nodes, connections) {
  const scene = useRef(new THREE.Scene());
  const camera = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const controls = useRef(null);

  useEffect(() => {
    if (!container.current) return;

    // Setup
    renderer.current.setSize(container.current.clientWidth, container.current.clientHeight);
    container.current.appendChild(renderer.current.domElement);
    
    camera.current.position.z = 20;
    
    // Add coordinates axes
    const axesHelper = new THREE.AxesHelper(2);
    scene.current.add(axesHelper);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(100, 100);
    gridHelper.position.y = -2;
    scene.current.add(gridHelper);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.current.add(directionalLight);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.current.render(scene.current, camera.current);
      if (controls.current) controls.current.update();
    }
    animate();

    // Cleanup
    return () => {
      if (container.current) {
        container.current.removeChild(renderer.current.domElement);
      }
      scene.current.remove(axesHelper);
      scene.current.remove(gridHelper);
      scene.current.remove(ambientLight);
      scene.current.remove(directionalLight);
    };
  }, [container]);

  // Update nodes and connections
  useEffect(() => {
    // Remove old nodes and connections
    const objectsToRemove = scene.current.children.filter(
      child => child.userData.type === 'node' || child.userData.type === 'connection'
    );
    objectsToRemove.forEach(obj => scene.current.remove(obj));

    // Add new nodes
    nodes.forEach(node => {
      const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const mesh = new THREE.Mesh(geometry, material);
      const [x, y, z] = node.translation.split(',').map(Number);
      mesh.position.set(x, y, z);
      mesh.userData = { type: 'node', id: node.id };
      scene.current.add(mesh);
    });

    // Add new connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        const fromPos = fromNode.translation.split(',').map(Number);
        const toPos = toNode.translation.split(',').map(Number);
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
          ...fromPos,
          ...toPos
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const line = new THREE.Line(geometry, material);
        line.userData = { type: 'connection' };
        scene.current.add(line);
      }
    });
  }, [nodes, connections]);

  return {
    scene: scene.current,
    camera: camera.current,
    renderer: renderer.current
  };
}

export default useThreeScene;
