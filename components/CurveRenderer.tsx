
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { CurveData } from '../types';

interface CurveRendererProps {
  curve: CurveData;
}

const CurveRenderer: React.FC<CurveRendererProps> = ({ curve }) => {
  const points = useMemo(() => {
    return curve.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
  }, [curve.points]);

  if (points.length < 2 || !curve.visible) return null;

  return (
    <group>
      {/* The main curve */}
      <Line
        points={points}
        color={curve.color}
        lineWidth={curve.thickness}
        dashed={false}
      />
      
      {/* Optional: Subtle points at vertices */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[curve.thickness * 0.02, 8, 8]} />
          <meshStandardMaterial color={curve.color} emissive={curve.color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

export default CurveRenderer;
