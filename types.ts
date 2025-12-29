
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
  fit?: FitParams;
}

export interface AppState {
  curves: CurveData[];
}
