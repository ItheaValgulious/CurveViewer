
import { Point3D, FitParams } from '../types';
import * as THREE from 'three';

/**
 * 解析 CSV 或空格分隔的 3D 坐标
 */
export const parseCSVPoints = (input: string): Point3D[] => {
  const lines = input.trim().split(/\r?\n/);
  const points: Point3D[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // 使用正则匹配逗号或任意空白字符
    const parts = line.trim().split(/[,\s]+/).map(p => parseFloat(p));
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

export const getOppositeColor = (hex: string): string => {
  const color = new THREE.Color(hex);
  return `#${new THREE.Color(1 - color.r, 1 - color.g, 1 - color.b).getHexString()}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * 在所有点的最佳拟合平面上拟合抛物线 w = au² + bu + c
 * 使用 PCA 寻找主方向
 */
export const fitParabola = (points: Point3D[]): FitParams | null => {
  if (points.length < 3) return null;

  const n = points.length;
  
  // 1. 计算重心
  let mx = 0, my = 0, mz = 0;
  for (const p of points) {
    mx += p.x; my += p.y; mz += p.z;
  }
  mx /= n; my /= n; mz /= n;

  // 2. 计算协方差矩阵 (3x3)
  let cxx = 0, cxy = 0, cxz = 0;
  let cyy = 0, cyz = 0, czz = 0;
  for (const p of points) {
    const dx = p.x - mx;
    const dy = p.y - my;
    const dz = p.z - mz;
    cxx += dx * dx; cxy += dx * dy; cxz += dx * dz;
    cyy += dy * dy; cyz += dy * dz; czz += dz * dz;
  }

  // 3. 简单的 3x3 对称矩阵特征值求解近似 (Power Iteration)
  // 为简化实现，我们使用三个基向量方向来寻找主平面
  // 实际上由于是 3D 曲线，我们直接通过 PCA 找到最主要的两个维度
  const getEigen = (matrix: number[][]) => {
    let v = [1, 1, 1]; // 初始向量
    for(let i=0; i<10; i++) {
      let nextV = [
        matrix[0][0]*v[0] + matrix[0][1]*v[1] + matrix[0][2]*v[2],
        matrix[1][0]*v[0] + matrix[1][1]*v[1] + matrix[1][2]*v[2],
        matrix[2][0]*v[0] + matrix[2][1]*v[1] + matrix[2][2]*v[2]
      ];
      const mag = Math.sqrt(nextV[0]**2 + nextV[1]**2 + nextV[2]**2);
      v = nextV.map(x => x / (mag || 1));
    }
    return v;
  };

  const covMat = [
    [cxx, cxy, cxz],
    [cxy, cyy, cyz],
    [cxz, cyz, czz]
  ];

  // 第一个主成分 v1 (展开方向)
  const v1 = getEigen(covMat);
  
  // 减去第一个主成分，找第二个 v2 (弯曲方向)
  const covMat2 = covMat.map((row, i) => row.map((val, j) => val - v1[i] * v1[j] * (cxx+cyy+czz))); 
  const v2_raw = getEigen(covMat2);
  // 施密特正交化保证 v2 垂直于 v1
  const dot = v2_raw[0]*v1[0] + v2_raw[1]*v1[1] + v2_raw[2]*v1[2];
  const v2 = v2_raw.map((x, i) => x - dot * v1[i]);
  const mag2 = Math.sqrt(v2[0]**2 + v2[1]**2 + v2[2]**2);
  const v2_norm = v2.map(x => x / (mag2 || 1));

  // 4. 将点投影到 (v1, v2) 局部平面
  const localPoints: {u: number, w: number}[] = points.map(p => {
    const dx = p.x - mx;
    const dy = p.y - my;
    const dz = p.z - mz;
    return {
      u: dx * v1[0] + dy * v1[1] + dz * v1[2],
      w: dx * v2_norm[0] + dy * v2_norm[1] + dz * v2_norm[2]
    };
  });

  // 5. 在局部平面进行二乘法拟合 w = au² + bu + c
  let sumU = 0, sumU2 = 0, sumU3 = 0, sumU4 = 0;
  let sumW = 0, sumUW = 0, sumU2W = 0;
  let minU = Infinity, maxU = -Infinity;

  for (const lp of localPoints) {
    const u = lp.u;
    const w = lp.w;
    const u2 = u * u;
    sumU += u; sumU2 += u2; sumU3 += u2 * u; sumU4 += u2 * u2;
    sumW += w; sumUW += u * w; sumU2W += u2 * w;
    minU = Math.min(minU, u); maxU = Math.max(maxU, u);
  }

  const det = (
    sumU4 * (sumU2 * n - sumU * sumU) -
    sumU3 * (sumU3 * n - sumU * sumU2) +
    sumU2 * (sumU3 * sumU - sumU2 * sumU2)
  );

  if (Math.abs(det) < 1e-10) return null;

  const a = (sumU2W * (sumU2 * n - sumU * sumU) - sumU3 * (sumUW * n - sumW * sumU) + sumU2 * (sumUW * sumU - sumW * sumU2)) / det;
  const b = (sumU4 * (sumUW * n - sumW * sumU) - sumU2W * (sumU3 * n - sumU * sumU2) + sumU2 * (sumU3 * sumW - sumU2 * sumUW)) / det;
  const c = (sumU4 * (sumU2 * sumW - sumU * sumUW) - sumU3 * (sumU3 * sumW - sumU2 * sumUW) + sumU2W * (sumU3 * sumU - sumU2 * sumU2)) / det;

  return {
    a, b, c,
    equation: `w = ${a.toFixed(4)}u² ${b >= 0 ? '+' : ''}${b.toFixed(4)}u ${c >= 0 ? '+' : ''}${c.toFixed(4)}`,
    centroid: [mx, my, mz],
    basisU: [v1[0], v1[1], v1[2]],
    basisW: [v2_norm[0], v2_norm[1], v2_norm[2]],
    uRange: [minU, maxU]
  };
};
