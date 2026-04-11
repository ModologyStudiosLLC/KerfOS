"use client";

import { useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { TransformControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { CanvasComponent } from "../CabinetBuilder";

export interface ViolationLevel { level: 'critical' | 'warning' | 'info' }

interface ComponentMeshProps {
  comp: CanvasComponent;
  materialColor: THREE.ColorRepresentation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, pos: [number, number, number]) => void;
  orbitRef: React.RefObject<any>;
  violation?: 'critical' | 'warning' | 'info';
}

const T = 0.75 / 12; // 3/4" panel thickness in feet
const SNAP = 0.25;   // snap grid in inches

function snapInch(val: number): number {
  return Math.round(val / SNAP) * SNAP;
}

// ─── Violation emissive ───────────────────────────────────────────────────────
function violationEmissive(v?: 'critical' | 'warning' | 'info') {
  if (v === 'critical') return { emissive: '#ef4444', emissiveIntensity: 0.55 };
  if (v === 'warning')  return { emissive: '#f59e0b', emissiveIntensity: 0.45 };
  if (v === 'info')     return { emissive: '#60a5fa', emissiveIntensity: 0.35 };
  return null;
}

// ─── Hollow cabinet shell ─────────────────────────────────────────────────────
interface MatProps {
  color: THREE.ColorRepresentation;
  roughness: number;
  metalness: number;
  emissive: string;
  emissiveIntensity: number;
}

function HollowBox({ w, h, d, ...mat }: { w: number; h: number; d: number } & MatProps) {
  const m = <meshStandardMaterial {...mat} />;
  return (
    <>
      <mesh position={[0, 0, -d / 2 + T / 2]} castShadow receiveShadow><boxGeometry args={[w, h, T]} />{m}</mesh>
      <mesh position={[-w / 2 + T / 2, 0, 0]} castShadow receiveShadow><boxGeometry args={[T, h, d]} />{m}</mesh>
      <mesh position={[w / 2 - T / 2, 0, 0]} castShadow receiveShadow><boxGeometry args={[T, h, d]} />{m}</mesh>
      <mesh position={[0, h / 2 - T / 2, 0]} castShadow receiveShadow><boxGeometry args={[w - T * 2, T, d]} />{m}</mesh>
      <mesh position={[0, -h / 2 + T / 2, 0]} castShadow receiveShadow><boxGeometry args={[w - T * 2, T, d]} />{m}</mesh>
    </>
  );
}

// ─── Measurement label overlay ────────────────────────────────────────────────
function MeasurementLabel({ w, h, d }: { w: number; h: number; d: number }) {
  // Convert from feet back to inches for display
  const wi = (w * 12).toFixed(2);
  const hi = (h * 12).toFixed(2);
  const di = (d * 12).toFixed(2);
  return (
    <Html
      position={[0, h / 2 + 0.12, 0]}
      center
      distanceFactor={6}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{
        display: 'flex', gap: '6px',
        background: 'rgba(10,14,28,0.88)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(232,201,154,0.25)', borderRadius: '3px',
        padding: '4px 8px', whiteSpace: 'nowrap',
      }}>
        {[{ l: 'W', v: wi }, { l: 'H', v: hi }, { l: 'D', v: di }].map(({ l, v }) => (
          <span key={l} style={{ fontFamily: 'monospace', fontSize: '10px', color: '#e8c99a', letterSpacing: '0.04em' }}>
            <span style={{ opacity: 0.5 }}>{l} </span>{v}″
          </span>
        ))}
      </div>
    </Html>
  );
}

// ─── Component mesh ───────────────────────────────────────────────────────────
export function ComponentMesh({
  comp, materialColor, isSelected, onSelect, onMove, orbitRef, violation,
}: ComponentMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);

  const w  = comp.width    / 12;
  const h  = comp.height   / 12;
  const d  = comp.depth    / 12;
  const px = comp.position[0] / 12;
  const py = comp.position[1] / 12;
  const pz = comp.position[2] / 12;

  const vEmissive = violationEmissive(violation);
  const matProps: MatProps = {
    color: materialColor,
    roughness: comp.type === "shelf" || comp.type === "divider" ? 0.75 : 0.65,
    metalness: 0.05,
    emissive: vEmissive ? vEmissive.emissive : (isSelected ? "#e8c99a" : "#000000"),
    emissiveIntensity: vEmissive ? vEmissive.emissiveIntensity : (isSelected ? 0.35 : 0),
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(comp.id);
  };

  const handleTransformChange = () => {
    if (!groupRef.current) return;
    const p = groupRef.current.position;
    // Snap to 0.25" grid
    onMove(comp.id, [
      snapInch(p.x * 12),
      snapInch(p.y * 12),
      snapInch(p.z * 12),
    ]);
  };

  return (
    <>
      <group ref={groupRef} position={[px, py, pz]} onClick={handleClick}>
        {comp.type === "box" ? (
          <HollowBox w={w} h={h} d={d} {...matProps} />
        ) : (
          <mesh castShadow receiveShadow>
            {getGeometry(comp.type, w, h, d)}
            <meshStandardMaterial {...matProps} />
          </mesh>
        )}
        {isSelected && <MeasurementLabel w={w} h={h} d={d} />}
      </group>

      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode="translate"
          size={0.55}
          onChange={handleTransformChange}
          onMouseDown={() => { if (orbitRef.current) orbitRef.current.enabled = false; }}
          onMouseUp={()   => { if (orbitRef.current) orbitRef.current.enabled = true;  }}
        />
      )}
    </>
  );
}

// ─── Geometry by type ─────────────────────────────────────────────────────────
function getGeometry(type: string, w: number, h: number, d: number) {
  switch (type) {
    case "shelf":    return <boxGeometry args={[w, T, d]} />;
    case "divider":  return <boxGeometry args={[T, h, d]} />;
    case "toe-kick": return <boxGeometry args={[w, h, T]} />;
    case "door":
    case "drawer":   return <boxGeometry args={[w, h, T * 1.2]} />;
    default:         return <boxGeometry args={[w, h, d]} />;
  }
}
