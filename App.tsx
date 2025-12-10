
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Generator } from './components/Generator';
import { Library } from './components/Library';
import { ViewState, GeneratedAsset, GenerationConfig, DEFAULT_GENERATION_CONFIG } from './types';
import { generateImageBatch } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.GENERATE);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  
  // State lifted from Generator to persist configuration
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>(DEFAULT_GENERATION_CONFIG);

  const handleGenerate = useCallback(async (config: GenerationConfig) => {
    setIsGenerating(true);
    setProgress({ current: 0, total: config.batchSize });

    try {
      const results = await generateImageBatch(config, (completed, total) => {
        setProgress({ current: completed, total });
      });

      const newAssets: GeneratedAsset[] = results.map(r => ({
        id: crypto.randomUUID(),
        imageUrl: r.imageUrl,
        prompt: r.prompt,
        createdAt: Date.now(),
        metadata: r.metadata,
        originalConfig: config // Save the config used to generate this asset
      }));

      setAssets(prev => [...newAssets, ...prev]);
      
      // If successful, switch to library to see results after a brief delay
      // Only switch if we are not already there (though setting it to same value is harmless)
      if (newAssets.length > 0) {
          setTimeout(() => setCurrentView(ViewState.LIBRARY), 500);
      }
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, []);

  const handleRegenerate = useCallback((config: GenerationConfig) => {
    setGenerationConfig(config);
    // Instead of switching view, we immediately trigger generation
    // This allows the user to stay in the Library view while generating "more like this"
    handleGenerate(config);
  }, [handleGenerate]);

  const handleDelete = useCallback((id: string) => {
      setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-gray-100 font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 overflow-hidden relative">
        {currentView === ViewState.GENERATE && (
          <Generator 
            onGenerate={handleGenerate} 
            isGenerating={isGenerating} 
            progress={progress}
            config={generationConfig}
            onConfigChange={setGenerationConfig}
          />
        )}
        
        {currentView === ViewState.LIBRARY && (
          <Library 
            assets={assets} 
            onDelete={handleDelete} 
            onRegenerate={handleRegenerate}
            isGenerating={isGenerating}
            progress={progress}
          />
        )}
      </main>
    </div>
  );
};

export default App;
