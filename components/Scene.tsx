
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, PerspectiveCamera, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import CurveRenderer from './CurveRenderer';
import { CurveData } from '../types';

interface SceneProps {
  curves: CurveData[];
}

const CoordinateSystem: React.FC = () => {
  return (
    <group>
      {/* 增强版轴辅助器 */}
      {/* X 轴 - 红色 */}
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 10, 0xef4444, 0.4, 0.2)} />
      {/* Y 轴 - 绿色 (向上) */}
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 10, 0x22c55e, 0.4, 0.2)} />
      {/* Z 轴 - 蓝色 */}
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 10, 0x3b82f6, 0.4, 0.2)} />
      
      {/* 原点小球 */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

const SpatialGrids: React.FC = () => {
  return (
    <group>
      {/* XZ Plane (Ground) - 基础网格 */}
      <Grid 
        infiniteGrid 
        cellSize={1} 
        sectionSize={10} 
        sectionThickness={1.5}
        sectionColor="#475569" 
        cellThickness={1}
        cellColor="#1e293b"
        fadeDistance={100}
        fadeStrength={5}
      />
      
      {/* XY Plane (Vertical) - 侧面参考网格 (更透明) */}
      <Grid 
        rotation={[Math.PI / 2, 0, 0]}
        infiniteGrid 
        cellSize={1} 
        sectionSize={10} 
        sectionThickness={0}
        cellThickness={0.5}
        cellColor="#0f172a"
        fadeDistance={30}
        fadeStrength={10}
        position={[0, 0, 0]}
      />

      {/* YZ Plane (Vertical) - 侧面参考网格 (更透明) */}
      <Grid 
        rotation={[0, 0, Math.PI / 2]}
        infiniteGrid 
        cellSize={1} 
        sectionSize={10} 
        sectionThickness={0}
        cellThickness={0.5}
        cellColor="#0f172a"
        fadeDistance={30}
        fadeStrength={10}
        position={[0, 0, 0]}
      />
    </group>
  );
};

const Scene: React.FC<SceneProps> = ({ curves }) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [15, 15, 15], fov: 50 }}>
        <color attach="background" args={['#020617']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20]} intensity={1.5} castShadow />
        
        <Suspense fallback={null}>
          {/* 三维空间网格系统 */}
          <SpatialGrids />
          
          {/* XYZ 轴坐标系 */}
          <CoordinateSystem />

          {/* 曲线渲染 */}
          <group>
            {curves.map((curve) => (
              <CurveRenderer key={curve.id} curve={curve} />
            ))}
          </group>
          
          <Environment preset="night" />
          {/* 接触阴影，只在靠近地面的位置产生，增强空间感 */}
          <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={50} blur={2.5} far={10} />
        </Suspense>

        {/* 轨道控制器：支持旋转、缩放、平移 */}
        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.1}
          rotateSpeed={0.8}
          panSpeed={1}
          minDistance={1}
          maxDistance={1000}
        />

        {/* 视口辅助器 */}
        <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
          <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
        </GizmoHelper>
      </Canvas>
    </div>
  );
};

export default Scene;
