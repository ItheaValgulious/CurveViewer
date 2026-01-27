
import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Activity, Info, ChevronDown, ChevronUp, Sigma, FunctionSquare, Palette } from 'lucide-react';
import { CurveData } from '../types';
import { parseCSVPoints, getRandomColor, generateId, fitParabola } from '../utils/helpers';

interface SidebarProps {
  curves: CurveData[];
  onAddCurve: (curve: CurveData) => void;
  onRemoveCurve: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onUpdateCurve: (curve: CurveData) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ curves, onAddCurve, onRemoveCurve, onToggleVisibility, onUpdateCurve }) => {
  const [csvInput, setCsvInput] = useState<string>("0 0 0\n1 2 1.5\n2 4 4.2\n3 6 8.9\n4 8 16.1");
  const [curveName, setCurveName] = useState<string>("空间最佳拟合轨迹");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = () => {
    const points = parseCSVPoints(csvInput);
    if (points.length < 2) {
      alert("请提供至少2个有效坐标点。支持空格或逗号分隔。");
      return;
    }

    const newCurve: CurveData = {
      id: generateId(),
      name: curveName || `曲线 ${curves.length + 1}`,
      points,
      color: getRandomColor(),
      visible: true,
      thickness: 2,
      gradientEnabled: false,
    };

    onAddCurve(newCurve);
    setCsvInput("");
    setCurveName("");
  };

  const handleFit = (curve: CurveData) => {
    const result = fitParabola(curve.points);
    if (result) {
      onUpdateCurve({ ...curve, fit: result });
    } else {
      alert("拟合失败，请确保点在空间中分布有效。");
    }
  };

  const toggleGradient = (curve: CurveData) => {
    onUpdateCurve({ ...curve, gradientEnabled: !curve.gradientEnabled });
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80 max-h-[calc(100vh-2rem)] flex flex-col gap-4">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h1 className="text-slate-100 font-bold tracking-tight">3D 曲线渲染器</h1>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">曲线名称</label>
              <input 
                type="text"
                value={curveName}
                onChange={(e) => setCurveName(e.target.value)}
                placeholder="名称..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
                <span>坐标数据 (X Y Z)</span>
                <Info className="w-3 h-3 cursor-help" title="支持空格、逗号或制表符分隔。拟合将计算空间最佳平面。" />
              </label>
              <textarea 
                rows={5}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="0 0 0&#10;1 2 1.5&#10;2 4 4..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
              />
            </div>

            <button 
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              添加曲线
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-slate-100 font-semibold text-sm">曲线管理</h2>
        </div>
        
        <div className="overflow-y-auto p-2 space-y-1">
          {curves.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">等待数据录入...</div>
          ) : (
            curves.map((curve) => (
              <div key={curve.id} className="group flex flex-col gap-1 p-2 bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: curve.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{curve.name}</p>
                    <p className="text-slate-500 text-[10px] uppercase">{curve.points.length} 点</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleFit(curve)} title="空间平面拟合" className="p-1.5 text-sky-400 hover:text-sky-300">
                      <Sigma className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleGradient(curve)} title="色彩渐变" className={`p-1.5 ${curve.gradientEnabled ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}>
                      <Palette className="w-4 h-4" />
                    </button>
                    <button onClick={() => onToggleVisibility(curve.id)} className="p-1.5 text-slate-400 hover:text-white">
                      {curve.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => onRemoveCurve(curve.id)} className="p-1.5 text-rose-400/70 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {curve.fit && (
                  <div className="mt-1 px-3 py-1 bg-slate-900/50 rounded border border-slate-700/50">
                    <div className="flex items-center gap-2 text-sky-300 text-[9px] font-mono leading-tight">
                      <FunctionSquare className="w-3 h-3" />
                      <span>{curve.fit.equation}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="bg-sky-900/20 backdrop-blur-sm border border-sky-500/20 rounded-xl p-3 shadow-xl">
        <p className="text-sky-300/80 text-[10px] leading-relaxed">
          <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">最佳拟合平面</span>
          系统会自动通过 PCA 寻找点集的重心和空间平面，并在该平面上拟合抛物线轨迹。
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
