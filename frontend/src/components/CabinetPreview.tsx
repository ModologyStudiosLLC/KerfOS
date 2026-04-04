"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Cabinet, Material } from "./CabinetBuilder";

interface CabinetPreviewProps {
  cabinet: Cabinet;
  material: Material | null;
}

export default function CabinetPreview({ cabinet, material }: CabinetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cabinetMeshRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 2.5, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x333333);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update cabinet when dimensions change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old cabinet
    if (cabinetMeshRef.current) {
      sceneRef.current.remove(cabinetMeshRef.current);
    }

    // Create new cabinet group
    const cabinetGroup = new THREE.Group();
    cabinetMeshRef.current = cabinetGroup;

    // Determine material color based on material type
    const materialColor = getMaterialColor(material?.type);
    const thickness = material?.thickness || 0.75;

    // Create cabinet box
    const cabinetGeometry = new THREE.BoxGeometry(
      cabinet.width / 12, // Convert inches to feet for Three.js
      cabinet.height / 12,
      cabinet.depth / 12
    );
    const cabinetMaterial = new THREE.MeshStandardMaterial({
      color: materialColor,
      roughness: 0.7,
      metalness: 0.1
    });
    const cabinetMesh = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
    cabinetMesh.castShadow = true;
    cabinetMesh.receiveShadow = true;
    cabinetMesh.position.y = cabinet.height / 24; // Position at half height
    cabinetGroup.add(cabinetMesh);

    // Add edge details (frame)
    addEdgeDetails(cabinetGroup, cabinet, thickness, materialColor);

    // Add door/drawer fronts
    addCabinetDetails(cabinetGroup, cabinet, thickness, materialColor);

    sceneRef.current.add(cabinetGroup);
  }, [cabinet, material]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-96 bg-slate-900 rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Overlay info */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg border border-slate-700">
        <h3 className="font-semibold text-white mb-1">{cabinet.name}</h3>
        <p className="text-sm text-slate-300">
          {cabinet.width}"W × {cabinet.height}"H × {cabinet.depth}"D
        </p>
        {material && (
          <p className="text-sm text-slate-400 mt-1">
            {material.name} ({material.thickness}" thick)
          </p>
        )}
      </div>

      {/* Rotation hint */}
      <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-700">
        <p className="text-xs text-slate-300">Drag to rotate</p>
      </div>
    </div>
  );
}

function getMaterialColor(materialType?: string): number {
  switch (materialType) {
    case "plywood":
      return 0xd4a373; // Light oak
    case "mdf":
      return 0x8b7355; // Medium brown
    case "hardwood":
      return 0xc4a484; // Dark oak
    default:
      return 0xd4a373;
  }
}

function addEdgeDetails(
  group: THREE.Group,
  cabinet: Cabinet,
  thickness: number,
  color: number
) {
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0.05
  });

  // Frame edges (top and bottom)
  const edgeHeight = 0.05;
  const edgeGeometry = new THREE.BoxGeometry(
    cabinet.width / 12,
    edgeHeight,
    cabinet.depth / 12
  );

  const topEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  topEdge.position.y = cabinet.height / 12;
  topEdge.castShadow = true;
  group.add(topEdge);

  const bottomEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  bottomEdge.position.y = 0;
  bottomEdge.castShadow = true;
  group.add(bottomEdge);
}

function addCabinetDetails(
  group: THREE.Group,
  cabinet: Cabinet,
  thickness: number,
  color: number
) {
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.75,
    metalness: 0.08
  });

  // Simple door representation
  const doorGeometry = new THREE.BoxGeometry(
    (cabinet.width / 12) - 0.1,
    (cabinet.height / 12) - 0.1,
    thickness / 12
  );
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, cabinet.height / 24, (cabinet.depth / 24));
  door.castShadow = true;
  door.receiveShadow = true;
  group.add(door);

  // Door handle
  const handleGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.02);
  const handleMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.3,
    metalness: 0.8
  });
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  handle.position.set(
    (cabinet.width / 12) / 2 - 0.15,
    cabinet.height / 24,
    (cabinet.depth / 24) + 0.01
  );
  group.add(handle);
}
