"use client";

import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from "three";
import { Cabinet, Material, CanvasComponent } from "./CabinetBuilder";
import { ComponentMesh } from "./canvas/ComponentMesh";

interface CabinetPreviewProps {
  cabinet: Cabinet;
  material: Material | null;
  components: CanvasComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, pos: [number, number, number]) => void;
  autoRotate?: boolean;
  viewPreset?: 'perspective' | 'front' | 'top' | 'side';
  violations?: Record<string, 'critical' | 'warning' | 'info'>;
}

// ─── Scene ───────────────────────────────────────────────────────────────────

function Scene({ cabinet, material, components, selectedId, onSelect, onMove, autoRotate, viewPreset = 'perspective', violations = {} }: CabinetPreviewProps) {
  const orbitRef = useRef<any>(null);
  const color = getMaterialColor(material?.type);
  const { camera } = useThree();

  useEffect(() => {
    const h = cabinet.height / 12;
    switch (viewPreset) {
      case 'front': camera.position.set(0, h * 0.7, h * 3.8); break;
      case 'top':   camera.position.set(0, h * 5.5, 0.001);   break;
      case 'side':  camera.position.set(h * 3.8, h * 0.7, 0); break;
      default:      camera.position.set(h * 1.6, h * 1.2, h * 2.2);
    }
    if (orbitRef.current) {
      orbitRef.current.target.set(0, h * 0.5, 0);
      orbitRef.current.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewPreset]);

  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />

      {components.map(comp => (
        <ComponentMesh
          key={comp.id}
          comp={comp}
          materialColor={color}
          isSelected={comp.id === selectedId}
          onSelect={onSelect}
          onMove={onMove}
          orbitRef={orbitRef}
          violation={violations[comp.id]}
        />
      ))}

      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => onSelect(null)} visible={false}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial />
      </mesh>

      <Grid
        position={[0, 0, 0]} args={[20, 20]}
        cellSize={0.5} cellThickness={0.4} cellColor="#3a2a1a"
        sectionSize={2} sectionThickness={0.8} sectionColor="#c45d2c22"
        fadeDistance={18} fadeStrength={1.2} infiniteGrid
      />

      <OrbitControls
        ref={orbitRef} makeDefault enableDamping dampingFactor={0.08}
        minDistance={1} maxDistance={30} maxPolarAngle={Math.PI / 2.05}
        autoRotate={autoRotate} autoRotateSpeed={0.6}
      />

      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport axisColors={["#c45d2c", "#e8c99a", "#888"]} labelColor="#f5f0eb" />
      </GizmoHelper>
    </>
  );
}

// ─── DFM legend ──────────────────────────────────────────────────────────────

function DFMLegend({ violations }: { violations: Record<string, 'critical' | 'warning' | 'info'> }) {
  const vals = Object.values(violations);
  if (vals.length === 0) return null;
  const counts = { critical: 0, warning: 0, info: 0 };
  for (const v of vals) counts[v]++;
  return (
    <div style={{
      position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: '8px', pointerEvents: 'none', zIndex: 10,
    }}>
      {counts.critical > 0 && <Chip color="#ef4444" label={`${counts.critical} critical`} />}
      {counts.warning  > 0 && <Chip color="#f59e0b" label={`${counts.warning} warning`}  />}
      {counts.info     > 0 && <Chip color="#60a5fa" label={`${counts.info} info`}         />}
    </div>
  );
}

function Chip({ color, label }: { color: string; label: string }) {
  return (
    <div style={{
      padding: '3px 10px', borderRadius: '2px',
      background: 'rgba(10,14,28,0.85)', backdropFilter: 'blur(8px)',
      border: `1px solid ${color}40`,
      fontSize: '10px', fontWeight: 600, color, letterSpacing: '0.04em',
    }}>{label}</div>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export default function CabinetPreview(props: CabinetPreviewProps) {
  const { cabinet, violations = {} } = props;
  const h = cabinet.height / 12;

  return (
    <div style={{ width: "100%", height: "100%", background: "var(--k-canvas-bg)" }}>
      <Canvas shadows camera={{ position: [h * 1.6, h * 1.2, h * 2.2], fov: 42, near: 0.01, far: 100 }} gl={{ antialias: true }}>
        <Scene {...props} violations={violations} />
      </Canvas>

      <DFMLegend violations={violations} />

      <div style={{
        position: "absolute", bottom: "16px", left: "16px",
        background: "rgba(26,18,11,0.85)", backdropFilter: "blur(8px)",
        border: "1px solid var(--k-canvas-border)",
        padding: "8px 12px", borderRadius: "3px", pointerEvents: "none",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--k-canvas-text)", marginBottom: "2px" }}>
          {cabinet.name}
        </div>
        <div style={{ fontSize: "11px", color: "var(--k-canvas-text-muted)", fontVariantNumeric: "tabular-nums" }}>
          {cabinet.width}" W × {cabinet.height}" H × {cabinet.depth}" D
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMaterialColor(materialType?: string): THREE.ColorRepresentation {
  switch (materialType) {
    case "plywood":  return "#c9956a";
    case "mdf":      return "#9b836b";
    case "hardwood": return "#b8864e";
    default:         return "#c9956a";
  }
}
