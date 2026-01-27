
import * as THREE from 'three';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FitParams {
  a: number;
  b: number;
  c: number;
  equation: string;
  // 新增：空间拟合元数据
  centroid: [number, number, number];
  basisU: [number, number, number];
  basisW: [number, number, number];
  uRange: [number, number];
}

export interface CurveData {
  id: string;
  name: string;
  points: Point3D[];
  color: string;
  visible: boolean;
  thickness: number;
  gradientEnabled?: boolean;
  fit?: FitParams;
}

export interface AppState {
  curves: CurveData[];
}
