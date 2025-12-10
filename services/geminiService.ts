
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GenerationConfig, ETHNICITIES, OUTFIT_STYLES } from '../types';

// Helper to pick random item from array excluding the first "Random" (随机) option
const getRandom = (arr: string[]) => {
  const options = arr.slice(1);
  return options[Math.floor(Math.random() * options.length)];
};

// Helper to pick any random item from an array (no exclusion)
const pickRandom = (arr: string[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Wait helper
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry helper for API calls
async function generateWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (e: any) {
      attempt++;
      // Check for rate limit (429) or service unavailable (503)
      const isRateLimit = e.message?.includes('429') || e.status === 429 || e.message?.includes('Quota exceeded') || e.status === 503;
      
      if (isRateLimit && attempt < maxRetries) {
        const delayTime = 2000 * Math.pow(2, attempt - 1); // 2s, 4s, 8s
        console.warn(`[Gemini Service] Rate limit hit. Retrying in ${delayTime}ms... (Attempt ${attempt}/${maxRetries})`);
        await wait(delayTime);
        continue;
      }
      // If it's not a retryable error or we ran out of retries, throw it
      throw e;
    }
  }
  throw new Error("Max retries exceeded");
}

// Internal lists for variation enhancement
const POSES = [
  '自然站立', 
  '时尚走秀动态', 
  '侧身回眸', 
  '自信叉腰', 
  '轻松依靠', 
  '动态抓拍', 
  '极简主义静止', 
  '优雅姿态', 
  '双臂自然下垂', 
  '行走中'
];

const LIGHTING = [
  '柔和影棚漫射光', 
  '高对比度伦勃朗光', 
  '明亮高调布光', 
  '侧逆光勾勒轮廓', 
  '顶光营造立体感', 
  '自然窗光效果',
  '电影感氛围光'
];

const ANGLES = [
  '平视角度', 
  '低角度仰拍', 
  '略微俯拍', 
  '正面构图', 
  '三分法构图', 
  '电影感视角'
];

const buildPrompt = (config: GenerationConfig): { prompt: string; metadata: { modelType: string; outfit: string; setting: string } } => {
  const isPet = config.subjectType === 'pet';
  
  // If reference image exists, we mark outfit style as "Reference Image" in metadata, 
  // but prompt construction handles the instruction.
  const style = config.referenceImage ? '参考图所示风格' : (config.outfitStyle === '随机' ? getRandom(OUTFIT_STYLES) : config.outfitStyle);
  
  // Add random variations
  const randomPose = pickRandom(POSES);
  const randomLighting = pickRandom(LIGHTING);
  const randomAngle = pickRandom(ANGLES);

  // Construct specific framing instruction based on shotType
  let framingInstruction = "";
  let detailFocus = "";
  let texturePrompt = "";

  const isRealistic = config.textureStyle === '真实原生 (Raw/Realistic)';
  const isFullBody = config.shotType === '全身标准照';

  if (isRealistic) {
    if (isFullBody) {
      // Fix for Full Body + Realistic: Reduce noise/grain, focus on fabric/form instead of pores
      const subjectTexture = isPet ? "真实的毛发细节，自然的动物姿态" : "真实自然的肤色";
      texturePrompt = `原生感直出 (Raw Photo)，${subjectTexture}，清晰逼真的衣物褶皱与面料质感，非过度修饰，电影感自然光`;
    } else {
      // Close-up/Upper body can handle pores and fine skin details
      const subjectTexture = isPet ? "极其细腻的毛发质感，每根毛发可见，清晰的虹膜" : "保留真实的皮肤质感，可见毛孔，细微瑕疵（如雀斑、小痣）";
      texturePrompt = `原生感直出 (Raw Photo)，${subjectTexture}，拒绝过度磨皮，胶片颗粒感`;
    }
  } else {
    // Standard AI
    if (isFullBody) {
      // Fix for Full Body + Standard: Add sharpness and lighting depth to avoid plastic look
      texturePrompt = "顶级商业时尚大片 (High Editorial)，极简高级感，光影层次丰富，服装细节锐利，超高清画质，具有真实的体积感";
    } else {
      texturePrompt = `精致完美的${isPet ? '毛发与形态' : '皮肤'}，商业级修图，光滑细腻，High Aesthetic`;
    }
  }
  
  if (config.shotType === '面部特写') {
    framingInstruction = "极度面部特写 (Extreme Close-up on Face)";
    // Added specific instructions for skin texture and imperfections only if Realistic is selected
    if (isRealistic) {
      detailFocus = isPet 
        ? "重点展示真实的毛发纹理，胡须细节，湿润的鼻头，清澈的眼神"
        : "重点展示真实的皮肤质感，可见毛孔，保留自然的轻微瑕疵（如雀斑、小痣或细纹）以增加真实感，眼神清澈";
    } else {
      detailFocus = isPet
        ? "展示完美的宠物面部特征，可爱的表情，眼神明亮，毛发柔顺"
        : "展示精致的面部妆容，完美的皮肤状态，眼神清澈，极具美感";
    }
  } else if (config.shotType === '上半身肖像') {
    framingInstruction = "上半身肖像 (Upper Body Portrait)";
    detailFocus = isPet
      ? "展示宠物上半身、自然的毛发纹理，以及面部表情"
      : "展示上身服饰细节、发型和面部表情，腰部以上构图";
  } else {
    // Default or '全身标准照'
    framingInstruction = "全身标准照 (Full Body Shot)";
    if (isRealistic) {
        detailFocus = isPet
            ? "展示完整的宠物姿态，包括爪子和尾巴，真实的毛流感"
            : "展示从头到脚的完整穿搭，包括鞋子，自然的站姿，真实的布料物理垂坠感";
    } else {
        detailFocus = "展示从头到脚的完整穿搭，身体比例协调，完美展示服装剪裁";
    }
  }

  // Constructing Prompt
  let modelDesc = "";
  if (isPet) {
      // Pet Description
      // Include Size Category in description for better accuracy, e.g., "Toy/Teacup size Yorkshire Terrier"
      const sizeDesc = config.petSizeCategory ? `体型为${config.petSizeCategory.split(' ')[0]}的` : '';
      modelDesc = `${framingInstruction}，一张极具细节的逼真照片。主体为一只${config.petAge}的${sizeDesc}${config.petBreed} (${config.petSpecies})`;
  } else {
      // Human Description
      const ethnicity = config.ethnicity === '随机' ? getRandom(ETHNICITIES) : config.ethnicity;
      modelDesc = `${framingInstruction}，一张极具细节的逼真照片。模特为${config.ageRange}岁的${ethnicity}${config.gender}`;
  }

  const actionDesc = config.shotType === '面部特写' ? '直视镜头，表情富有张力' : `${randomPose}`;
  
  // Logic for outfit description based on reference image
  // Updated: Only include outfit description if Human. For Pets, we generally assume no clothes unless specified manually in future updates.
  let outfitDesc = "";
  
  if (!isPet) {
      if (config.referenceImage) {
          outfitDesc = `服装/配饰必须参考并复刻提供的参考图片中的风格、剪裁和材质，${config.outfitColor}为主`;
      } else {
          outfitDesc = `身穿${config.outfitColor}${style}`;
      }
  } else {
      // For pets, we omit outfit description to allow natural appearance
      // petColor was handled previously in modelDesc, now removed.
      outfitDesc = "纯天然状态，无任何衣物，无配饰 (Natural, no clothes, no accessories)"; 
  }

  const settingDesc = `背景在${config.setting}`;
  
  // Conditionally add texture prompt
  const technicalDesc = `专业影棚摄影，${texturePrompt}，${randomLighting}，${randomAngle}，8k分辨率，${detailFocus}，时尚摄影大片，对焦清晰，杰作`;

  const prompt = `${modelDesc}，${actionDesc}，${outfitDesc}，${settingDesc}。${technicalDesc}`;
  
  // Metadata string construction
  const modelTypeMeta = isPet 
    ? `${config.petBreed}` 
    : `${config.ethnicity} ${config.gender}`;

  return {
    prompt: prompt,
    metadata: {
      modelType: modelTypeMeta,
      outfit: isPet ? '无 (Pet)' : `${config.outfitColor} ${style}`,
      setting: config.setting
    }
  };
};

export const generateImageBatch = async (
  config: GenerationConfig,
  onProgress: (completed: number, total: number) => void
): Promise<Array<{ imageUrl: string; prompt: string; metadata: any }>> => {
  
  // Determine if using Pro model
  const isPro = config.model === 'gemini-3-pro-image-preview';

  // API Key Selection for Pro
  if (isPro) {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // Trigger key selection
        await aistudio.openSelectKey();
      }
    }
  }

  // Re-instantiate AI client to ensure it picks up the latest key from environment/selection
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const results = [];
  const total = config.batchSize;

  // Safety settings to prevent over-blocking of fashion/model content
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  ];

  for (let i = 0; i < total; i++) {
    try {
      const { prompt, metadata } = buildPrompt(config);
      
      // Add a variation seed to ensure uniqueness even if random parts are similar
      const variationSeed = Math.floor(Math.random() * 1000000);
      const uniquePrompt = `${prompt} [Variation ID: ${variationSeed}]`;

      // Construct request parts (Text + Optional Image)
      const parts: any[] = [{ text: uniquePrompt }];

      // Only add reference image if it's NOT a pet generation, or if we decide to allow it later.
      // Based on UI hiding, we shouldn't have one, but good to check config + subjectType logic.
      if (config.referenceImage && config.subjectType !== 'pet') {
         // Extract base64 data and mimetype
         // format is usually: data:image/png;base64,.....
         try {
            const [header, base64Data] = config.referenceImage.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
            
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            });
         } catch (e) {
             console.error("Error parsing reference image data", e);
         }
      }

      // Configure Image Params
      const imageConfig: any = {
        aspectRatio: config.aspectRatio
      };

      // Only add imageSize if using Pro model (1K, 2K, 4K)
      if (isPro) {
        imageConfig.imageSize = config.resolution || '1K';
      }

      // Use the retry wrapper instead of direct call
      const response = await generateWithRetry(ai, {
        model: config.model, // Use the selected model
        contents: {
          parts: parts,
        },
        config: {
          imageConfig: imageConfig,
          safetySettings: safetySettings
        },
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const base64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            results.push({
              imageUrl: `data:${mimeType};base64,${base64}`,
              prompt: uniquePrompt,
              metadata
            });
            foundImage = true;
            break; 
          }
        }
      }
      
      if (!foundImage) {
        console.warn(`No image found in response for batch item ${i + 1}. Check safety ratings.`);
      }

      // Delay logic adjusted for Rate Limits
      if (i < total - 1) {
        // Pro models have stricter rate limits and higher computation cost.
        // We increase the delay significantly to avoid 429 errors during batching.
        const delayTime = isPro ? 4000 : 1000;
        await wait(delayTime);
      }

    } catch (error) {
      console.error(`Error generating image ${i + 1}:`, error);
      // Optional: Add a longer pause if an error occurred before continuing the batch
      await wait(2000); 
    } finally {
      onProgress(i + 1, total);
    }
  }

  return results;
};
