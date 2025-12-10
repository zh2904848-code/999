import React from 'react';
import { LayoutGrid, PlusSquare, Settings, Camera, Sparkles } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: ViewState.GENERATE, label: '创作工坊', sub: 'Creation Lab', icon: PlusSquare },
    { id: ViewState.LIBRARY, label: '资产管理', sub: 'Asset Library', icon: LayoutGrid },
    // { id: ViewState.SETTINGS, label: 'Settings', icon: Settings }, // Hidden for MVP
  ];

  return (
    <div className="w-72 h-screen bg-[#0c0c0e] border-r border-white/5 flex flex-col shrink-0 relative z-20">
      <div className="p-8 flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Camera className="w-5 h-5 text-white" />
        </div>
        <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">LUMIÈRE</h1>
            <span className="text-[10px] text-gray-500 tracking-widest uppercase">Studio Pro</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-surfaceHighlight border border-white/5 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-400'}`} />
              <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className={`text-[10px] tracking-wide uppercase ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>{item.sub}</span>
              </div>
              {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <div className="relative z-10">
                <h4 className="text-xs font-semibold text-gray-300 mb-1">Model Engine</h4>
                <div className="text-[10px] text-gray-500 leading-relaxed">
                    Powered by <span className="text-primary/80">Gemini 3 Pro</span> & <span className="text-accent/80">2.5 Flash</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};