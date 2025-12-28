
import * as THREE from 'three';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface CurveData {
  id: string;
  name: string;
  points: Point3D[];
  color: string;
  visible: boolean;
  thickness: number;
}

export interface AppState {
  curves: CurveData[];
}
