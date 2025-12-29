
import { Point3D, FitParams } from '../types';

export const parseCSVPoints = (input: string): Point3D[] => {
  const lines = input.trim().split(/\r?\n/);
  const points: Point3D[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',').map(p => parseFloat(p.trim()));
    if (parts.length >= 3 && parts.every(p => !isNaN(p))) {
      points.push({ x: parts[0], y: parts[1], z: parts[2] });
    }
  }

  return points;
};

export const getRandomColor = (): string => {
  const colors = [
    '#38bdf8', '#fb7185', '#4ade80', '#facc15', '#a78bfa', '#fb923c', '#2dd4bf',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * 在 x=0 平面（YZ平面）拟合抛物线 z = ay² + by + c
 * y 为自变量，z 为因变量
 */
export const fitParabola = (points: Point3D[]): FitParams | null => {
  if (points.length < 3) return null;

  let n = points.length;
  let sumY = 0, sumY2 = 0, sumY3 = 0, sumY4 = 0;
  let sumZ = 0, sumYZ = 0, sumY2Z = 0;

  for (const p of points) {
    // 忽略 x，基于 y 拟合 z
    const y = p.y;
    const z = p.z;
    const y2 = y * y;
    sumY += y;
    sumY2 += y2;
    sumY3 += y2 * y;
    sumY4 += y2 * y2;
    sumZ += z;
    sumYZ += y * z;
    sumY2Z += y2 * z;
  }

  // 求解正规方程组的系数矩阵 (基于 y 的幂):
  // [ sumY4  sumY3  sumY2 ] [ a ]   [ sumY2Z ]
  // [ sumY3  sumY2  sumY  ] [ b ] = [ sumYZ  ]
  // [ sumY2  sumY   n     ] [ c ]   [ sumZ   ]

  const det = (
    sumY4 * (sumY2 * n - sumY * sumY) -
    sumY3 * (sumY3 * n - sumY * sumY2) +
    sumY2 * (sumY3 * sumY - sumY2 * sumY2)
  );

  if (Math.abs(det) < 1e-10) return null;

  const a = (
    sumY2Z * (sumY2 * n - sumY * sumY) -
    sumY3 * (sumYZ * n - sumZ * sumY) +
    sumY2 * (sumYZ * sumY - sumZ * sumY2)
  ) / det;

  const b = (
    sumY4 * (sumYZ * n - sumZ * sumY) -
    sumY2Z * (sumY3 * n - sumY * sumY2) +
    sumY2 * (sumY3 * sumZ - sumY2 * sumYZ)
  ) / det;

  const c = (
    sumY4 * (sumY2 * sumZ - sumY * sumYZ) -
    sumY3 * (sumY3 * sumZ - sumY2 * sumYZ) +
    sumY2Z * (sumY3 * sumY - sumY2 * sumY2)
  ) / det;

  return {
    a, b, c,
    equation: `z = ${a.toFixed(4)}y² ${b >= 0 ? '+' : ''}${b.toFixed(4)}y ${c >= 0 ? '+' : ''}${c.toFixed(4)}`
  };
};
