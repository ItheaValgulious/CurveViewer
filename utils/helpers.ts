
import { Point3D } from '../types';

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
    '#38bdf8', // sky-400
    '#fb7185', // rose-400
    '#4ade80', // green-400
    '#facc15', // yellow-400
    '#a78bfa', // violet-400
    '#fb923c', // orange-400
    '#2dd4bf', // teal-400
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
