
import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Activity, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { CurveData } from '../types';
import { parseCSVPoints, getRandomColor, generateId } from '../utils/helpers';

interface SidebarProps {
  curves: CurveData[];
  onAddCurve: (curve: CurveData) => void;
  onRemoveCurve: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ curves, onAddCurve, onRemoveCurve, onToggleVisibility }) => {
  const [csvInput, setCsvInput] = useState<string>("0,0,0\n1,2,1\n2,1,3\n3,4,2\n5,3,5");
  const [curveName, setCurveName] = useState<string>("New Path");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = () => {
    const points = parseCSVPoints(csvInput);
    if (points.length < 2) {
      alert("Please provide at least 2 valid points (x, y, z format).");
      return;
    }

    const newCurve: CurveData = {
      id: generateId(),
      name: curveName || `Curve ${curves.length + 1}`,
      points,
      color: getRandomColor(),
      visible: true,
      thickness: 2,
    };

    onAddCurve(newCurve);
    setCsvInput("");
    setCurveName("");
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80 max-h-[calc(100vh-2rem)] flex flex-col gap-4">
      {/* Header & Input Panel */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h1 className="text-slate-100 font-bold tracking-tight">3D Curve Sculptor</h1>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Curve Name</label>
              <input 
                type="text"
                value={curveName}
                onChange={(e) => setCurveName(e.target.value)}
                placeholder="E.g. Trajectory Alpha"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
                <span>CSV Data (x, y, z)</span>
                <Info className="w-3 h-3 cursor-help" title="Enter coordinates separated by commas, one point per line." />
              </label>
              <textarea 
                rows={5}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="0, 0, 0&#10;1, 2, 3..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
              />
            </div>

            <button 
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Curve
            </button>
          </div>
        )}
      </div>

      {/* Curves List */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-slate-100 font-semibold text-sm">Active Curves ({curves.length})</h2>
        </div>
        
        <div className="overflow-y-auto p-2 space-y-1">
          {curves.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-xs italic">No curves added yet. Use the panel above to start visualizing data.</p>
            </div>
          ) : (
            curves.map((curve) => (
              <div 
                key={curve.id}
                className="group flex items-center gap-3 p-2 bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg transition-all"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: curve.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">{curve.name}</p>
                  <p className="text-slate-500 text-[10px] uppercase">{curve.points.length} points</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onToggleVisibility(curve.id)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {curve.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => onRemoveCurve(curve.id)}
                    className="p-1.5 text-rose-400/70 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Help Hint */}
      <div className="bg-sky-900/20 backdrop-blur-sm border border-sky-500/20 rounded-xl p-3 shadow-xl">
        <p className="text-sky-300/80 text-[10px] leading-relaxed">
          <span className="font-bold">Controls:</span><br/>
          • Left Click: Rotate View<br/>
          • Right Click: Pan View<br/>
          • Scroll: Zoom In/Out
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
