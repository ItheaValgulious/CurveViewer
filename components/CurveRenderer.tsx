
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

  const fitPoints = useMemo(() => {
    if (!curve.fit || curve.points.length < 2) return null;
    
    // 基于原始数据中 y 轴的范围生成平滑的抛物线
    const yCoords = curve.points.map(p => p.y);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    const range = maxY - minY;
    const padding = range * 0.2 || 1.0; 
    
    const result: THREE.Vector3[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const y = (minY - padding) + (i / steps) * (range + 2 * padding);
      // z = ay^2 + by + c
      const z = curve.fit.a * y * y + curve.fit.b * y + curve.fit.c;
      // 强制在 x = 0 平面渲染
      result.push(new THREE.Vector3(0, y, z));
    }
    return result;
  }, [curve.fit, curve.points]);

  if (points.length < 2 || !curve.visible) return null;

  return (
    <group>
      {/* 原始数据曲线 */}
      <Line
        points={points}
        color={curve.color}
        lineWidth={curve.thickness}
        dashed={false}
      />
      
      {/* 拟合出的抛物线 (z = f(y), x = 0) */}
      {fitPoints && (
        <Line
          points={fitPoints}
          color="#ffffff"
          lineWidth={2}
          dashed
          dashSize={0.4}
          gapSize={0.2}
          transparent
          opacity={0.8}
        />
      )}
      
      {/* 顶点标记 */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[curve.thickness * 0.02, 12, 12]} />
          <meshStandardMaterial color={curve.color} emissive={curve.color} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

export default CurveRenderer;
