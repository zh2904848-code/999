import React, { useState } from 'react';
import { GeneratedAsset, GenerationConfig } from '../types';
import { Download, Maximize2, X, Trash2, RotateCw, Loader2, Info } from 'lucide-react';

interface LibraryProps {
  assets: GeneratedAsset[];
  onDelete: (id: string) => void;
  onRegenerate: (config: GenerationConfig) => void;
  isGenerating: boolean;
  progress: { current: number; total: number } | null;
}

export const Library: React.FC<LibraryProps> = ({ 
  assets, 
  onDelete, 
  onRegenerate,
  isGenerating,
  progress
}) => {
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);

  const handleDownload = (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `lumiere-model-${asset.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDelete(id);
      if (selectedAsset?.id === id) setSelectedAsset(null);
  }

  const handleRemix = (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    if (isGenerating) return;
    if (asset.originalConfig) {
      onRegenerate(asset.originalConfig);
    }
  };

  if (assets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-fade-in relative bg-gradient-to-t from-black/50 to-transparent">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
          <Maximize2 className="w-8 h-8 opacity-30 text-white" />
        </div>
        <p className="text-xl font-semibold text-white mb-2">暂无数字资产</p>
        <p className="text-sm text-gray-500">前往创作工坊启动生成任务。</p>
        
        {isGenerating && progress && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-[#18181b] border border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl px-6 py-4 flex items-center space-x-4 animate-in slide-in-from-bottom-5 fade-in min-w-[300px]">
             <Loader2 className="w-5 h-5 text-primary animate-spin" />
             <div className="flex-1">
               <div className="text-white text-sm font-medium">正在合成资产...</div>
               <div className="text-xs text-gray-500 mt-0.5">Processing batch {progress.current} of {progress.total}</div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 h-full overflow-y-auto custom-scrollbar relative">
        <div className="mb-10 flex justify-between items-end border-b border-white/5 pb-6">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">数字资产库</h2>
                <p className="text-gray-400 text-sm">管理 {assets.length} 个数字资产</p>
            </div>
        </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-24">
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#18181b] border border-white/5 cursor-pointer shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
          >
            <img
              src={asset.imageUrl}
              alt={asset.metadata.modelType}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="text-sm font-semibold text-white mb-0.5 truncate">{asset.metadata.modelType}</div>
                <div className="text-[11px] text-gray-400 truncate mb-4 font-mono">{asset.metadata.outfit}</div>
                
                <div className="flex items-center justify-between gap-2">
                    <button
                        onClick={(e) => handleRemix(e, asset)}
                        disabled={isGenerating}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wide flex items-center justify-center space-x-1 transition-colors ${
                            isGenerating 
                            ? 'bg-white/10 text-gray-500' 
                            : 'bg-primary text-white hover:bg-primaryHover'
                        }`}
                    >
                        {isGenerating && asset === selectedAsset ? <Loader2 className="w-3 h-3 animate-spin"/> : <RotateCw className="w-3 h-3" />}
                        <span>Remix</span>
                    </button>
                    <button
                        onClick={(e) => handleDownload(e, asset)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                    onClick={(e) => handleDelete(e, asset.id)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                    <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Toast */}
      {isGenerating && progress && (
          <div className="fixed bottom-8 right-8 z-40 bg-[#18181b]/90 backdrop-blur-md border border-primary/20 shadow-2xl shadow-black/50 rounded-2xl p-5 flex items-center space-x-5 animate-in slide-in-from-bottom-5 fade-in max-w-sm w-full">
             <div className="relative">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full animate-pulse"></div>
             </div>
             <div className="flex-1 min-w-0">
               <div className="flex justify-between items-baseline mb-1">
                 <div className="text-white font-bold text-sm">GENERATING ASSETS</div>
                 <span className="text-xs font-mono text-primary">{Math.round((progress.current / progress.total) * 100)}%</span>
               </div>
               <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
               </div>
               <div className="text-[10px] text-gray-500 mt-1.5 truncate">Prompting Gemini Engine...</div>
             </div>
          </div>
        )}

      {/* Lightbox Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 lg:p-8 animate-fade-in">
          <button
            onClick={() => setSelectedAsset(null)}
            className="absolute top-4 right-4 lg:top-8 lg:right-8 p-3 text-gray-500 hover:text-white transition-colors bg-black/50 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col lg:flex-row w-full max-w-7xl h-[90vh] bg-[#0c0c0e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Image Container */}
            <div className="w-full lg:w-3/4 h-2/3 lg:h-full bg-[#050505] flex items-center justify-center p-4 lg:p-10 relative group">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iIzIyMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-20 pointer-events-none"></div>
              <img
                src={selectedAsset.imageUrl}
                alt="Selected model"
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
              />
            </div>
            
            {/* Sidebar Details */}
            <div className="w-full lg:w-1/4 h-1/3 lg:h-full bg-[#121214] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col">
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="flex items-center space-x-2 text-primary mb-6">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Asset Details</span>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Metadata</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'MODEL', value: selectedAsset.metadata.modelType },
                        { label: 'OUTFIT', value: selectedAsset.metadata.outfit },
                        { label: 'SETTING', value: selectedAsset.metadata.setting }
                      ].map((item, i) => (
                        <div key={i} className="group">
                          <span className="text-[10px] text-gray-600 block mb-0.5">{item.label}</span>
                          <span className="text-sm text-gray-200 font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Prompt Source</h4>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-xs text-gray-400 leading-relaxed font-mono max-h-40 overflow-y-auto custom-scrollbar">
                      {selectedAsset.prompt}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-white/5 bg-[#0f0f11] space-y-3">
                <button
                    onClick={(e) => handleDownload(e, selectedAsset)}
                    className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    <span>Download Original</span>
                </button>
                
                {selectedAsset.originalConfig && (
                    <button
                        onClick={() => !isGenerating && onRegenerate(selectedAsset.originalConfig!)}
                        disabled={isGenerating}
                        className={`w-full py-3 border border-white/10 text-white rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-all ${
                            isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
                        }`}
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <RotateCw className="w-4 h-4" />}
                        <span>Remix Variant</span>
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};