import { create } from 'zustand';
import type { TTSEngine } from '@/hooks/useTTS';

// ── 语音完整定义 ──
export interface TTSVoice {
  voice: string;
  label: string;
  gender: 'male' | 'female';
  category: 'mandarin' | 'cantonese' | 'taiwanese' | 'dialect';
}

// ── 语言选项 ──
export const LANGUAGE_OPTIONS = [
  { value: 'mandarin', label: '🗣️ 普通话' },
  { value: 'cantonese', label: '🇭🇰 粤语' },
  { value: 'taiwanese', label: '🇹🇼 台湾国语' },
  { value: 'dialect', label: '🗺️ 方言' },
] as const;

export type TTSLanguage = (typeof LANGUAGE_OPTIONS)[number]['value'];

// ── 语音查找逻辑 ──
export function resolveVoice(
  voices: TTSVoice[],
  language: TTSLanguage,
  gender: 'male' | 'female',
): string {
  const match = voices.find(v => v.category === language && v.gender === gender);
  return match?.voice ?? voices[0]?.voice ?? 'zh-CN-XiaoxiaoNeural';
}

export function getLanguageLabel(language: TTSLanguage): string {
  return LANGUAGE_OPTIONS.find(o => o.value === language)?.label ?? language;
}

// ── 语音按分类分组 ──
export function getFilteredVoices(
  voices: TTSVoice[],
  language: TTSLanguage,
  gender: 'male' | 'female',
): TTSVoice[] {
  return voices.filter(v => v.category === language && v.gender === gender);
}

// ── 离线完整语音列表（后端不可用时 fallback） ──
export const FALLBACK_VOICES: TTSVoice[] = [
  { voice: 'zh-CN-XiaoxiaoNeural', label: '晓晓', gender: 'female', category: 'mandarin' },
  { voice: 'zh-CN-XiaoyiNeural',   label: '晓依', gender: 'female', category: 'mandarin' },
  { voice: 'zh-CN-YunjianNeural',  label: '云健', gender: 'male',   category: 'mandarin' },
  { voice: 'zh-CN-YunxiNeural',    label: '云希', gender: 'male',   category: 'mandarin' },
  { voice: 'zh-CN-YunxiaNeural',   label: '云夏', gender: 'male',   category: 'mandarin' },
  { voice: 'zh-CN-YunyangNeural',  label: '云扬', gender: 'male',   category: 'mandarin' },
  { voice: 'zh-CN-liaoning-XiaobeiNeural', label: '小北（辽宁）', gender: 'female', category: 'dialect' },
  { voice: 'zh-CN-shaanxi-XiaoniNeural',   label: '小妮（陕西）', gender: 'female', category: 'dialect' },
  { voice: 'zh-HK-HiuGaaiNeural',  label: '晓佳', gender: 'female', category: 'cantonese' },
  { voice: 'zh-HK-HiuMaanNeural',  label: '晓文', gender: 'female', category: 'cantonese' },
  { voice: 'zh-HK-WanLungNeural',  label: '云龙', gender: 'male',   category: 'cantonese' },
  { voice: 'zh-TW-HsiaoChenNeural', label: '晓真', gender: 'female', category: 'taiwanese' },
  { voice: 'zh-TW-HsiaoYuNeural',   label: '晓雨', gender: 'female', category: 'taiwanese' },
  { voice: 'zh-TW-YunJheNeural',    label: '云哲', gender: 'male',   category: 'taiwanese' },
];

// ── 默认值 ──
const DEFAULT_LANGUAGE: TTSLanguage = 'mandarin';
const DEFAULT_GENDER: 'male' | 'female' = 'female';
const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural';
const DEFAULT_ENGINE: TTSEngine = 'auto';

interface SettingsStore {
  // ── TTS ──
  ttsEngine: TTSEngine;
  ttsLanguage: TTSLanguage;
  ttsGender: 'male' | 'female';
  ttsVoice: string;           // 实际选中的具体语音
  ttsRate: number;
  ttsVoices: TTSVoice[];      // 从后端加载的完整语音列表
  setTtsEngine: (engine: TTSEngine) => void;
  setTtsLanguage: (lang: TTSLanguage) => void;
  setTtsGender: (gender: 'male' | 'female') => void;
  setTtsVoice: (voice: string) => void;
  setTtsRate: (rate: number) => void;
  setTtsVoices: (voices: TTSVoice[]) => void;
}

function load<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(`settings_${key}`);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, val: T) {
  try {
    localStorage.setItem(`settings_${key}`, JSON.stringify(val));
  } catch { /* ignore */ }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ttsEngine: load<TTSEngine>('ttsEngine', DEFAULT_ENGINE),
  ttsLanguage: load<TTSLanguage>('ttsLanguage', DEFAULT_LANGUAGE),
  ttsGender: load<'male' | 'female'>('ttsGender', DEFAULT_GENDER),
  ttsVoice: load<string>('ttsVoice', DEFAULT_VOICE),
  ttsRate: load<number>('ttsRate', 1.0),
  ttsVoices: FALLBACK_VOICES as TTSVoice[],

  setTtsEngine: (engine) => {
    save('ttsEngine', engine);
    set({ ttsEngine: engine });
  },

  setTtsLanguage: (lang) => {
    save('ttsLanguage', lang);
    // 自动选取当前语言+性别下的第一个语音
    const { ttsGender, ttsVoices } = get();
    const first = ttsVoices.find(v => v.category === lang && v.gender === ttsGender);
    const voice = first?.voice ?? DEFAULT_VOICE;
    save('ttsVoice', voice);
    set({ ttsLanguage: lang, ttsVoice: voice });
  },

  setTtsGender: (gender) => {
    save('ttsGender', gender);
    // 自动选取当前语言+性别下的第一个语音
    const { ttsLanguage, ttsVoices } = get();
    const first = ttsVoices.find(v => v.category === ttsLanguage && v.gender === gender);
    const voice = first?.voice ?? DEFAULT_VOICE;
    save('ttsVoice', voice);
    set({ ttsGender: gender, ttsVoice: voice });
  },

  setTtsVoice: (voice) => {
    save('ttsVoice', voice);
    set({ ttsVoice: voice });
  },

  setTtsRate: (rate) => {
    save('ttsRate', rate);
    set({ ttsRate: rate });
  },

  setTtsVoices: (voices) => {
    // 如果后端返回空列表，保留现有的 fallback 语音列表
    if (voices.length === 0) return;
    const { ttsLanguage, ttsGender, ttsVoice } = get();
    const exists = voices.find(v => v.voice === ttsVoice);
    if (!exists) {
      const first = voices.find(v => v.category === ttsLanguage && v.gender === ttsGender);
      const voice = first?.voice ?? DEFAULT_VOICE;
      save('ttsVoice', voice);
      set({ ttsVoices: voices, ttsVoice: voice });
    } else {
      set({ ttsVoices: voices });
    }
  },
}));
