
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line, Text } from '@react-three/drei';
import { CurveData } from '../types';
import { getOppositeColor } from '../utils/helpers';

interface CurveRendererProps {
  curve: CurveData;
}

const CurveRenderer: React.FC<CurveRendererProps> = ({ curve }) => {
  const points = useMemo(() => {
    return curve.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
  }, [curve.points]);

  // 计算每个点的颜色
  const vertexColors = useMemo(() => {
    if (!curve.gradientEnabled) return null;
    
    const baseColor = new THREE.Color(curve.color);
    const targetColor = new THREE.Color(getOppositeColor(curve.color));
    
    return points.map((_, i) => {
      const t = i / (points.length - 1);
      return baseColor.clone().lerp(targetColor, t);
    });
  }, [curve.color, curve.gradientEnabled, points]);

  const fitPoints = useMemo(() => {
    if (!curve.fit || curve.points.length < 2) return null;
    
    const yCoords = curve.points.map(p => p.y);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    const range = maxY - minY;
    const padding = range * 0.2 || 1.0; 
    
    const result: THREE.Vector3[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const y = (minY - padding) + (i / steps) * (range + 2 * padding);
      const z = curve.fit.a * y * y + curve.fit.b * y + curve.fit.c;
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
        color={curve.gradientEnabled ? undefined : curve.color}
        vertexColors={vertexColors}
        lineWidth={curve.thickness}
        dashed={false}
      />
      
      {/* 拟合出的抛物线 (z = f(y), x = 0) */}
      {fitPoints && (
        <Line
          points={fitPoints}
          color="#ffffff"
          lineWidth={1.5}
          dashed
          dashSize={0.4}
          gapSize={0.2}
          transparent
          opacity={0.6}
        />
      )}
      
      {/* 顶点标记及序号 */}
      {points.map((p, i) => {
        const pointColor = vertexColors ? vertexColors[i] : new THREE.Color(curve.color);
        const sphereSize = curve.thickness * 0.025;
        
        return (
          <group key={i} position={p}>
            <mesh shadowBlur={1}>
              <sphereGeometry args={[sphereSize, 12, 12]} />
              <meshStandardMaterial 
                color={pointColor} 
                emissive={pointColor} 
                emissiveIntensity={0.6} 
              />
            </mesh>
            
            {/* 仅在渐变模式开启时显示极小的序号 */}
            {curve.gradientEnabled && (
              <Text
                position={[0, sphereSize * 1.5, 0]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="bottom"
                font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
                outlineWidth={0.015}
                outlineColor="#000000"
              >
                {i + 1}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default CurveRenderer;
