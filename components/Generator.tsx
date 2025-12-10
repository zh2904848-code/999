import React, { useCallback, useRef, useState, useMemo } from 'react';
import { Wand2, Loader2, RotateCcw, Upload, X, Sparkles, User, PawPrint, Edit3, List, ChevronRight } from 'lucide-react';
import { GenerationConfig, ETHNICITIES, OUTFIT_STYLES, ASPECT_RATIOS, SHOT_TYPES, AGE_RANGES, DEFAULT_GENERATION_CONFIG, TEXTURE_STYLES, MODELS, RESOLUTIONS, SUBJECT_TYPES, PET_SPECIES, PET_AGE_RANGES, PET_HIERARCHY, RABBIT_BREEDS } from '../types';

// Helper components moved outside to avoid TypeScript inference issues and recreation on render
const SectionHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/5">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h3>
      {action}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[13px] font-medium text-gray-300 mb-2">{children}</label>
);

const InputSelect = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
      <select
          {...props}
          className={`w-full bg-[#18181b] hover:bg-[#202023] border border-white/5 rounded-lg px-4 py-3 text-sm text-gray-200 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-200 shadow-sm ${className || ''}`}
      />
  </div>
);

const TextInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
      {...props}
      className={`w-full bg-[#18181b] hover:bg-[#202023] border border-white/5 rounded-lg px-4 py-3 text-sm text-gray-200 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-200 shadow-sm placeholder-gray-600 ${className || ''}`}
  />
);

interface GeneratorProps {
  onGenerate: (config: GenerationConfig) => Promise<void>;
  isGenerating: boolean;
  progress: { current: number; total: number } | null;
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
}

export const Generator: React.FC<GeneratorProps> = ({ 
  onGenerate, 
  isGenerating, 
  progress, 
  config, 
  onConfigChange 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCustomBreedMode, setIsCustomBreedMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    await onGenerate(config);
  };

  const handleReset = () => {
    onConfigChange(DEFAULT_GENERATION_CONFIG);
    setIsCustomBreedMode(false);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onConfigChange({ ...config, referenceImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [config, onConfigChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0];
    processFile(file);
  }, [config, onConfigChange]);

  const clearImage = () => {
    onConfigChange({ ...config, referenceImage: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isProModel = config.model === 'gemini-3-pro-image-preview';
  const isPet = config.subjectType === 'pet';

  // --- Pet Hierarchy Logic ---
  const availableSizes = useMemo(() => {
    if (PET_HIERARCHY[config.petSpecies]) {
      return Object.keys(PET_HIERARCHY[config.petSpecies]);
    }
    return [];
  }, [config.petSpecies]);

  const availableBreeds = useMemo(() => {
    if (PET_HIERARCHY[config.petSpecies]) {
      const sizeCategory = config.petSizeCategory;
      if (sizeCategory && PET_HIERARCHY[config.petSpecies][sizeCategory]) {
        return PET_HIERARCHY[config.petSpecies][sizeCategory];
      }
      return [];
    }
    if (config.petSpecies.includes('Rabbit')) return RABBIT_BREEDS;
    return [];
  }, [config.petSpecies, config.petSizeCategory]);

  const toggleBreedMode = () => {
    const nextMode = !isCustomBreedMode;
    setIsCustomBreedMode(nextMode);
    if (!nextMode && availableBreeds.length > 0) {
        if (!availableBreeds.includes(config.petBreed)) {
             onConfigChange({ ...config, petBreed: availableBreeds[0] });
        }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 animate-fade-in h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-10 flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">品牌模特创造控制台</h2>
          <p className="text-gray-400 text-sm">配置高精度参数以批量合成数字时尚模特资产。</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-medium border border-white/5 hover:border-white/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重置配置</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
        
        {/* Left Column: Subject & Core Config */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Subject Parameters */}
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <SectionHeader 
                title="主体参数 / SUBJECT" 
                action={
                    <div className="flex bg-[#18181b] p-1 rounded-lg border border-white/5">
                        {SUBJECT_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => onConfigChange({...config, subjectType: type.id as any})}
                                className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wide transition-all ${
                                    config.subjectType === type.id 
                                        ? 'bg-primary text-white shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {type.id === 'human' ? <User className="w-3 h-3"/> : <PawPrint className="w-3 h-3"/>}
                                <span>{type.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                }
            />
            
            <div className="grid grid-cols-2 gap-6">
              {isPet ? (
                <>
                    <div className="col-span-1">
                        <Label>宠物物种</Label>
                        <InputSelect
                        value={config.petSpecies}
                        onChange={(e) => {
                            const newSpecies = e.target.value;
                            let newSize = '';
                            let newBreed = '';
                            if (PET_HIERARCHY[newSpecies]) {
                                const sizes = Object.keys(PET_HIERARCHY[newSpecies]);
                                if (sizes.length > 0) {
                                    newSize = sizes[0];
                                    if (PET_HIERARCHY[newSpecies][newSize]?.length > 0) {
                                        newBreed = PET_HIERARCHY[newSpecies][newSize][0];
                                    }
                                }
                            } else if (newSpecies.includes('Rabbit')) {
                                newBreed = RABBIT_BREEDS[0];
                            }
                            setIsCustomBreedMode(false);
                            onConfigChange({ 
                                ...config, 
                                petSpecies: newSpecies,
                                petSizeCategory: newSize,
                                petBreed: newBreed
                            });
                        }}
                        >
                        {PET_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </InputSelect>
                    </div>

                    {availableSizes.length > 0 && (
                        <div className="col-span-1">
                            <Label>体型分类</Label>
                            <InputSelect
                                value={config.petSizeCategory}
                                onChange={(e) => {
                                    const newSize = e.target.value;
                                    let newBreed = '';
                                    if (PET_HIERARCHY[config.petSpecies][newSize]?.length > 0) {
                                        newBreed = PET_HIERARCHY[config.petSpecies][newSize][0];
                                    }
                                    setIsCustomBreedMode(false);
                                    onConfigChange({ ...config, petSizeCategory: newSize, petBreed: newBreed });
                                }}
                            >
                                {availableSizes.map(size => <option key={size} value={size}>{size}</option>)}
                            </InputSelect>
                        </div>
                    )}

                    <div className="col-span-2">
                        <div className="flex justify-between items-end mb-2">
                            <Label>具体品种</Label>
                            {availableBreeds.length > 0 && (
                                <button
                                    onClick={toggleBreedMode}
                                    className="text-[10px] flex items-center space-x-1 text-primary hover:text-primaryHover transition-colors uppercase font-medium tracking-wide"
                                >
                                    {isCustomBreedMode ? (
                                        <><List className="w-3 h-3" /><span>选择列表</span></>
                                    ) : (
                                        <><Edit3 className="w-3 h-3" /><span>手动输入</span></>
                                    )}
                                </button>
                            )}
                        </div>
                        
                        {isCustomBreedMode || availableBreeds.length === 0 ? (
                            <TextInput
                                value={config.petBreed}
                                onChange={(e) => onConfigChange({ ...config, petBreed: e.target.value })}
                                placeholder="输入宠物具体品种..."
                            />
                        ) : (
                            <InputSelect
                                value={config.petBreed}
                                onChange={(e) => onConfigChange({ ...config, petBreed: e.target.value })}
                            >
                                {availableBreeds.map(breed => (
                                    <option key={breed} value={breed}>{breed}</option>
                                ))}
                            </InputSelect>
                        )}
                        {config.petSizeCategory && (
                            <div className="mt-2 flex items-center space-x-2 text-[10px] text-gray-500">
                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{config.petSpecies}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{config.petSizeCategory.split(' ')[0]}</span>
                            </div>
                        )}
                    </div>

                    <div className="col-span-2 pt-2">
                        <Label>年龄阶段</Label>
                        <InputSelect
                        value={config.petAge}
                        onChange={(e) => onConfigChange({ ...config, petAge: e.target.value })}
                        >
                        {PET_AGE_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                        </InputSelect>
                    </div>
                </>
              ) : (
                <>
                    <div className="col-span-1">
                        <Label>性别属性</Label>
                        <InputSelect
                        value={config.gender}
                        onChange={(e) => onConfigChange({ ...config, gender: e.target.value })}
                        >
                        <option>女性</option>
                        <option>男性</option>
                        <option>非二元性别</option>
                        </InputSelect>
                    </div>

                    <div className="col-span-1">
                        <Label>年龄跨度</Label>
                        <InputSelect
                        value={config.ageRange}
                        onChange={(e) => onConfigChange({ ...config, ageRange: e.target.value })}
                        >
                        {AGE_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                        </InputSelect>
                    </div>

                    <div className="col-span-2">
                        <Label>族裔特征</Label>
                        <InputSelect
                        value={config.ethnicity}
                        onChange={(e) => onConfigChange({ ...config, ethnicity: e.target.value })}
                        >
                        {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                        </InputSelect>
                    </div>
                </>
              )}
            </div>
          </div>

          {/* Model & Technical */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
             <SectionHeader title="渲染配置 / RENDER" />
             <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <Label>AI 模型引擎</Label>
                    <div className="grid grid-cols-2 gap-4">
                    {MODELS.map((model) => (
                        <button
                        key={model.id}
                        onClick={() => onConfigChange({ ...config, model: model.id })}
                        className={`relative flex flex-col items-start px-5 py-4 rounded-xl border transition-all duration-200 group ${
                            config.model === model.id
                            ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                            : 'bg-[#18181b] border-white/5 hover:border-white/10 hover:bg-[#202023]'
                        }`}
                        >
                            <div className="flex items-center w-full justify-between mb-1">
                                <span className={`text-sm font-semibold ${config.model === model.id ? 'text-white' : 'text-gray-300'}`}>
                                    {model.label.split('(')[0]}
                                </span>
                                {model.id.includes('pro') && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <span className="text-[10px] text-gray-500">{model.label.match(/\((.*?)\)/)?.[1]}</span>
                            
                            {config.model === model.id && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-sm" />
                            )}
                        </button>
                    ))}
                    </div>
                </div>

                {isProModel && (
                    <div className="col-span-2 animate-in fade-in slide-in-from-top-2 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center justify-between">
                        <Label><span className="text-amber-400 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Pro 级分辨率</span></Label>
                        <select
                            className="bg-black/40 border border-amber-500/30 rounded-md px-3 py-1 text-xs text-amber-100 outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={config.resolution}
                            onChange={(e) => onConfigChange({ ...config, resolution: e.target.value })}
                        >
                            {RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    </div>
                )}

                <div className="col-span-1">
                    <Label>材质风格</Label>
                    <InputSelect
                    value={config.textureStyle}
                    onChange={(e) => onConfigChange({ ...config, textureStyle: e.target.value })}
                    >
                    {TEXTURE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </InputSelect>
                </div>

                <div className="col-span-1">
                    <Label>镜头语言</Label>
                    <InputSelect
                    value={config.shotType}
                    onChange={(e) => onConfigChange({ ...config, shotType: e.target.value })}
                    >
                    {SHOT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </InputSelect>
                </div>
                
                <div className="col-span-2">
                    <Label>画面比例</Label>
                    <div className="flex gap-3">
                        {ASPECT_RATIOS.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => onConfigChange({...config, aspectRatio: ratio as any})}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                                    config.aspectRatio === ratio 
                                    ? 'border-primary bg-primary/10 text-primary shadow-inner' 
                                    : 'border-white/5 bg-[#18181b] text-gray-500 hover:text-gray-300 hover:border-white/10'
                                }`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>

             </div>
          </div>
        </div>

        {/* Right Column: Context & Action */}
        <div className="lg:col-span-5 space-y-10">
          
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <SectionHeader title={isPet ? '环境设定 / SETTING' : '风格与参考 / STYLE'} />
            
            <div className="space-y-6">
              
              {!isPet && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                         <Label>参考图像 (Image Reference)</Label>
                         {config.referenceImage && (
                            <button onClick={clearImage} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                                <X className="w-3 h-3"/> 清除
                            </button>
                         )}
                    </div>
                    
                    {config.referenceImage ? (
                      <div className="relative group rounded-xl overflow-hidden border border-primary/30 bg-black/40 h-40 flex items-center justify-center">
                        <img src={config.referenceImage} alt="Reference" className="h-full w-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs text-white">点击清除</span>
                        </div>
                        <button onClick={clearImage} className="absolute inset-0 w-full h-full cursor-pointer"></button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border border-dashed rounded-xl h-40 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group overflow-hidden ${
                          isDragging 
                            ? 'border-primary bg-primary/5' 
                            : 'border-white/10 hover:border-white/20 bg-[#18181b]'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                        />
                        <textarea 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onPaste={handlePaste}
                            readOnly
                        />
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                           <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-xs font-medium text-gray-300 relative z-10">点击上传或拖拽图片</p>
                        <p className="text-[10px] text-gray-600 mt-1 relative z-10">支持 Ctrl+V 粘贴</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>服装风格 <span className="text-[10px] text-gray-500 font-normal ml-1">{config.referenceImage ? '(参考图优先)' : ''}</span></Label>
                    <InputSelect
                      className={`w-full bg-[#18181b] border border-white/5 rounded-lg px-4 py-3 text-sm text-gray-200 outline-none ${config.referenceImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={config.outfitStyle}
                      onChange={(e) => onConfigChange({ ...config, outfitStyle: e.target.value })}
                      disabled={!!config.referenceImage}
                    >
                      {OUTFIT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </InputSelect>
                  </div>

                  <div>
                    <Label>色彩体系</Label>
                    <TextInput
                      value={config.outfitColor}
                      onChange={(e) => onConfigChange({ ...config, outfitColor: e.target.value })}
                      placeholder="例如：大地色系, 霓虹蓝, 全黑"
                    />
                  </div>
                </>
              )}

              <div>
                <Label>场景构建</Label>
                <TextInput
                  value={config.setting}
                  onChange={(e) => onConfigChange({ ...config, setting: e.target.value })}
                  placeholder="例如：白色影棚背景, 城市街道"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#121214] border border-white/5 p-6 rounded-2xl animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">生成控制 / CONTROLS</span>
                <span className="text-xs text-primary">{config.batchSize} 张/组</span>
              </div>

              <div className="mb-8">
                <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={config.batchSize}
                    onChange={(e) => onConfigChange({ ...config, batchSize: parseInt(e.target.value) })}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-mono">
                    <span>1</span>
                    <span>4</span>
                    <span>8</span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold tracking-wide shadow-lg transition-all duration-300 relative overflow-hidden group ${
                isGenerating
                    ? 'bg-gray-800 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryHover hover:to-indigo-500 text-white shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5'
                }`}
            >
                {/* Button Shine Effect */}
                {!isGenerating && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />}
                
                {isGenerating ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>PROCESSING {progress ? `(${progress.current}/${progress.total})` : ''}</span>
                </>
                ) : (
                <>
                    <Wand2 className="w-4 h-4" />
                    <span>启动生成序列 / GENERATE</span>
                </>
                )}
            </button>
            <p className="text-[10px] text-center text-gray-600 mt-4">
                {isProModel ? 'High-VRAM Mode Active. Expect higher latency.' : 'Standard Mode Active.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};