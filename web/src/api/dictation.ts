/**
 * 🎧 英语单词听写 API
 */
import request from './request';


// ── 类型 ──
export interface DictationWordVO {
  id: string;
  word: string;
  phonetic: string;
  chinese: string;
  sentence?: string;
  difficulty: number;
  domain: string;
  progress: { used: number; total: number };
}

export interface DictationCheckResult {
  correct: boolean;
  word: string;
  letters: { index: number; expected: string; got: string }[];
  userAnswer: string;
}

export interface DictationStats {
  total: number;
  byDomain: Record<string, number>;
  domains: string[];
}

export interface DictationWrongRecord {
  id: string;
  word: string;
  chinese: string;
  phonetic: string;
  wrongAnswer: string;
  count: number;
  lastTime: string;
}

// ── API ──
export async function fetchNextWord(domain?: string, difficulty?: number): Promise<DictationWordVO | null> {
  try {
    const res = await request.post<DictationWordVO>('/dictation/next', { domain, difficulty });
    return res.data;
  } catch {
    return null;
  }
}

export async function checkDictation(answer: string): Promise<DictationCheckResult | null> {
  try {
    const res = await request.post<DictationCheckResult>('/dictation/check', { answer });
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchDictationStats(): Promise<DictationStats | null> {
  try {
    const res = await request.get<DictationStats>('/dictation/words');
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchDictationWrongBook(): Promise<DictationWrongRecord[]> {
  try {
    const res = await request.get<DictationWrongRecord[]>('/dictation/wrong');
    return res.data ?? [];
  } catch {
    return [];
  }
}
