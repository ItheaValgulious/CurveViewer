
import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import Sidebar from './components/Sidebar';
import { CurveData } from './types';

const App: React.FC = () => {
  const [curves, setCurves] = useState<CurveData[]>([]);

  const handleAddCurve = useCallback((newCurve: CurveData) => {
    setCurves(prev => [...prev, newCurve]);
  }, []);

  const handleRemoveCurve = useCallback((id: string) => {
    setCurves(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setCurves(prev => prev.map(c => 
      c.id === id ? { ...c, visible: !c.visible } : c
    ));
  }, []);

  const handleUpdateCurve = useCallback((updatedCurve: CurveData) => {
    setCurves(prev => prev.map(c => 
      c.id === updatedCurve.id ? updatedCurve : c
    ));
  }, []);

  return (
    <div className="relative w-full h-full flex overflow-hidden font-sans text-slate-100">
      <div className="absolute inset-0 z-0">
        <Scene curves={curves} />
      </div>

      <Sidebar 
        curves={curves} 
        onAddCurve={handleAddCurve}
        onRemoveCurve={handleRemoveCurve}
        onToggleVisibility={handleToggleVisibility}
        onUpdateCurve={handleUpdateCurve}
      />
      
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-1.5 flex flex-col items-end">
          <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
            Fit: PCA Spatial Best-Fit Plane
          </p>
          <p className="text-[9px] font-mono text-slate-500 tracking-tight">
            Support: space/comma delimited data
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
