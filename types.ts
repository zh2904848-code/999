

export interface GeneratedAsset {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: number;
  metadata: {
    modelType: string;
    outfit: string;
    setting: string;
  };
  originalConfig?: GenerationConfig;
}

export interface GenerationConfig {
  model: string; // 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'
  resolution: string; // '1K' | '2K' | '4K'
  batchSize: number;
  
  // Subject Type
  subjectType: 'human' | 'pet';

  // Human Params
  gender: string;
  ethnicity: string; // '随机' | specific
  ageRange: string;

  // Pet Params
  petSpecies: string;
  petSizeCategory: string; // New field for Size classification
  petBreed: string;
  petAge: string;
  // petColor removed

  outfitStyle: string; // '随机' | specific
  outfitColor: string;
  setting: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  shotType: string;
  textureStyle: string;
  referenceImage?: string; // Base64 string of the uploaded reference image
}

export enum ViewState {
  LIBRARY = 'LIBRARY',
  GENERATE = 'GENERATE',
  SETTINGS = 'SETTINGS'
}

export const MODELS = [
  { id: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash (快速/标准)' },
  { id: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (高画质)' }
];

export const RESOLUTIONS = [
  '1K',
  '2K',
  '4K'
];

export const SUBJECT_TYPES = [
  { id: 'human', label: '人类模特 (Human)' },
  { id: 'pet', label: '宠物模特 (Pet)' }
];

export const ETHNICITIES = [
  '随机',
  '白人',
  '黑人 / 非裔',
  '东亚',
  '南亚',
  '西班牙裔 / 拉丁裔',
  '中东',
  '混血'
];

export const AGE_RANGES = [
  '0-12',
  '12-20',
  '20-30',
  '30-40',
  '40-50',
  '50-60',
  '60-70'
];

export const PET_SPECIES = [
  '狗 (Dog)',
  '猫 (Cat)',
  '兔子 (Rabbit)',
  '鸟 (Bird)',
  '鼠 (Hamster/Mouse)',
  '其他 (Other)'
];

// Complex Hierarchy for Dogs, Cats, Small Pets, and Birds
export const PET_HIERARCHY: Record<string, Record<string, string[]>> = {
  '狗 (Dog)': {
    '超小型犬 (Toy/Teacup)': ['约克夏梗 (Yorkshire Terrier)', '吉娃娃 (Chihuahua)'],
    '小型犬 (Small)': ['法国斗牛犬 (French Bulldog)', '迷你贵宾犬 (Miniature Poodle)', '玩具贵宾犬 (Toy Poodle)', '比格犬 (Beagle)', '西施犬 (Shih Tzu)', '波士顿梗 (Boston Terrier)'],
    '中型犬 (Medium)': ['斗牛犬 (Bulldog)', '西伯利亚雪橇犬 (Siberian Husky)', '澳大利亚牧羊犬 (Australian Shepherd)', '边境牧羊犬 (Border Collie)'],
    '大型犬 (Large)': ['拉布拉多寻回犬 (Labrador Retriever)', '德国牧羊犬 (German Shepherd)', '金毛寻回犬 (Golden Retriever)', '标准贵宾犬 (Standard Poodle)', '德国短毛指示犬 (German Shorthaired Pointer)', '杜宾犬 (Doberman Pinscher)', '大麦町犬 (Dalmatian)', '拳师犬 (Boxer)'],
    '巨型犬 (Giant)': ['伯恩山犬 (Bernese Mountain Dog)', '罗威纳犬 (Rottweiler)']
  },
  '猫 (Cat)': {
    '超小型 (Super Small)': ['新加坡猫 (Singapura)'],
    '小型到中型 (Small-Medium)': ['德文卷毛猫 (Devon Rex)', '柯尼斯卷毛猫 (Cornish Rex)'],
    '中型 (Medium)': ['暹罗猫 (Siamese)', '异国短毛猫 (Exotic Shorthair)', '苏格兰折耳猫 (Scottish Fold)', '斯芬克斯猫 (Sphynx)', '俄罗斯蓝猫 (Russian Blue)', '阿比西尼亚猫 (Abyssinian)', '东方短毛猫 (Oriental Shorthair)', '土耳其安哥拉猫 (Turkish Angora)', '埃及猫 (Egyptian Mau)'],
    '中型到大型 (Medium-Large)': ['英国短毛猫 (British Shorthair)', '美国短毛猫 (American Shorthair)', '孟加拉猫 (Bengal)', '伯曼猫 (Birman)'],
    '大型 (Large)': ['布偶猫 (Ragdoll)', '挪威森林猫 (Norwegian Forest Cat)'],
    '超大型 (Super Large)': ['缅因猫 (Maine Coon)', '波斯猫 (Persian)']
  },
  '鼠 (Hamster/Mouse)': {
    '小型 (Small)': [
      '叙利亚仓鼠 (Syrian Hamster)',
      '侏儒仓鼠 (Dwarf Hamster)',
      '豚鼠/荷兰猪 (Guinea Pig)',
      '刺猬 (Hedgehog)',
      '蜜袋鼯 (Sugar Glider)',
      '龙猫/毛丝鼠 (Chinchilla)'
    ]
  },
  '鸟 (Bird)': {
    '小型鹦鹉 (Small Parrot)': [
      '虎皮鹦鹉 (Budgerigar)',
      '太平洋鹦鹉 (Parrotlet)',
      '横斑鹦鹉 (Lineolated Parakeet)',
      '爱情鸟 (Lovebird)',
      '玄凤鹦鹉 (Cockatiel)'
    ],
    '中型鹦鹉 (Medium Parrot)': [
      '绿颊锥尾鹦鹉 (Green-cheeked Conure)',
      '塞内加尔鹦鹉 (Senegal Parrot)',
      '金太阳锥尾鹦鹉 (Sun Conure)',
      '和尚鹦鹉 (Quaker Parrot)',
      '红腹锥尾鹦鹉 (Pyrrhura Conure)',
      '小太阳锥尾鹦鹉 (Yellow-sided Conure)',
      '红肩金刚鹦鹉 (Hahn\'s Macaw)'
    ],
    '大型鹦鹉 (Large Parrot)': [
      '非洲灰鹦鹉 (African Grey) (Timneh)'
    ]
  }
};

// Fallback generic lists for other species if needed
export const RABBIT_BREEDS = [
  '垂耳兔 (Holland Lop)',
  '侏儒兔 (Netherland Dwarf)',
  '狮头兔 (Lionhead)',
  '安哥拉兔 (Angora)',
  '雷克斯兔 (Rex)'
];

export const PET_AGE_RANGES = [
  '幼年 (Baby/Puppy/Kitten)',
  '青年 (Young)',
  '成年 (Adult)',
  '老年 (Senior)'
];

export const OUTFIT_STYLES = [
  '随机',
  '高级定制时装',
  '商务职业装',
  '休闲街头风',
  '极简主义',
  '运动休闲 / 瑜伽',
  '晚礼服',
  '前卫先锋',
  '赛博朋克 / 机能风',
  '复古 90 年代',
  '居家休闲'
];

export const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];

export const SHOT_TYPES = [
  '全身标准照',
  '上半身肖像',
  '面部特写'
];

export const TEXTURE_STYLES = [
  '标准完美 (Standard AI)',
  '真实原生 (Raw/Realistic)'
];

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  model: 'gemini-2.5-flash-image',
  resolution: '1K',
  batchSize: 4,
  
  subjectType: 'human',
  gender: '女性',
  ethnicity: '随机',
  ageRange: '20-30',
  
  petSpecies: '狗 (Dog)',
  petSizeCategory: '大型犬 (Large)',
  petBreed: '金毛寻回犬 (Golden Retriever)',
  petAge: '成年 (Adult)',
  
  outfitStyle: '高级定制时装',
  outfitColor: '中性色',
  setting: '白色影棚背景',
  aspectRatio: '3:4',
  shotType: '全身标准照',
  textureStyle: '标准完美 (Standard AI)'
};