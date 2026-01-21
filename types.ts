
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
}

export interface CurveData {
  id: string;
  name: string;
  points: Point3D[];
  color: string;
  visible: boolean;
  thickness: number;
  gradientEnabled?: boolean; // 新增：是否启用颜色渐变
  fit?: FitParams;
}

export interface AppState {
  curves: CurveData[];
}
