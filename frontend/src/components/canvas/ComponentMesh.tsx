"use client";

import { useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { CanvasComponent } from "../CabinetBuilder";

interface ComponentMeshProps {
  comp: CanvasComponent;
  materialColor: THREE.ColorRepresentation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, pos: [number, number, number]) => void;
  orbitRef: React.RefObject<any>;
}

const THICKNESS = 0.75 / 12; // 3/4" in feet

export function ComponentMesh({
  comp,
  materialColor,
  isSelected,
  onSelect,
  onMove,
  orbitRef,
}: ComponentMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // All dimensions stored in inches, rendered in feet
  const w = comp.width  / 12;
  const h = comp.height / 12;
  const d = comp.depth  / 12;
  const px = comp.position[0] / 12;
  const py = comp.position[1] / 12;
  const pz = comp.position[2] / 12;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(comp.id);
  };

  const handleTransformChange = () => {
    if (!meshRef.current) return;
    const p = meshRef.current.position;
    // Convert back to inches
    onMove(comp.id, [p.x * 12, p.y * 12, p.z * 12]);
  };

  return (
    <>
      <mesh
        ref={meshRef}
        position={[px, py, pz]}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        {getGeometry(comp.type, w, h, d)}
        <meshStandardMaterial
          color={materialColor}
          roughness={comp.type === "shelf" || comp.type === "divider" ? 0.75 : 0.65}
          metalness={0.05}
          emissive={isSelected ? "#e8c99a" : "#000000"}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>

      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode="translate"
          size={0.6}
          onChange={handleTransformChange}
          onMouseDown={() => {
            if (orbitRef.current) orbitRef.current.enabled = false;
          }}
          onMouseUp={() => {
            if (orbitRef.current) orbitRef.current.enabled = true;
          }}
        />
      )}
    </>
  );
}

// ─── Geometry by component type ──────────────────────────────────────────────

function getGeometry(type: string, w: number, h: number, d: number) {
  switch (type) {
    case "shelf":
      // Flat horizontal panel
      return <boxGeometry args={[w, THICKNESS, d]} />;

    case "divider":
      // Vertical panel (full height, half depth)
      return <boxGeometry args={[THICKNESS, h, d]} />;

    case "toe-kick":
      // Short horizontal strip at the base
      return <boxGeometry args={[w, h, THICKNESS]} />;

    case "door":
      // Thin front panel
      return <boxGeometry args={[w, h, THICKNESS * 1.2]} />;

    case "drawer":
      // Thin front panel, usually shorter
      return <boxGeometry args={[w, h, THICKNESS * 1.2]} />;

    case "box":
    default:
      // Full hollow box (represented as a single solid for simplicity here;
      // the main cabinet shell is the reference box)
      return <boxGeometry args={[w, h, d]} />;
  }
}
