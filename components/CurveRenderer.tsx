
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
    
    const { a, b, c, centroid, basisU, basisW, uRange } = curve.fit;
    const [mx, my, mz] = centroid;
    const [ux, uy, uz] = basisU;
    const [wx, wy, wz] = basisW;
    
    const minU = uRange[0];
    const maxU = uRange[1];
    const range = maxU - minU;
    const padding = range * 0.2 || 1.0; 
    
    const result: THREE.Vector3[] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const u = (minU - padding) + (i / steps) * (range + 2 * padding);
      const w = a * u * u + b * u + c;
      
      // 空间变换: P = Centroid + u*BasisU + w*BasisW
      const px = mx + u * ux + w * wx;
      const py = my + u * uy + w * wy;
      const pz = mz + u * uz + w * wz;
      
      result.push(new THREE.Vector3(px, py, pz));
    }
    return result;
  }, [curve.fit, curve.points]);

  if (points.length < 2 || !curve.visible) return null;

  return (
    <group>
      <Line
        points={points}
        color={curve.gradientEnabled ? undefined : curve.color}
        vertexColors={vertexColors}
        lineWidth={curve.thickness}
        dashed={false}
      />
      
      {fitPoints && (
        <Line
          points={fitPoints}
          color="#ffffff"
          lineWidth={1.5}
          dashed
          dashSize={0.4}
          gapSize={0.2}
          transparent
          opacity={0.4}
        />
      )}
      
      {points.map((p, i) => {
        const pointColor = vertexColors ? vertexColors[i] : new THREE.Color(curve.color);
        const sphereSize = curve.thickness * 0.025;
        return (
          <group key={i} position={p}>
            <mesh>
              <sphereGeometry args={[sphereSize, 12, 12]} />
              <meshStandardMaterial color={pointColor} emissive={pointColor} emissiveIntensity={0.6} />
            </mesh>
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
