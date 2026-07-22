/**
 * TTS API（使用原生 fetch 绕过 axios 拦截器）
 */

const API_BASE = import.meta.env.PROD ? 'http://localhost:3001' : '/api';

export interface TTSVoiceDTO {
  voice: string;
  label: string;
  gender: 'male' | 'female';
  category: 'mandarin' | 'cantonese' | 'taiwanese' | 'dialect';
}

/**
 * 调用后端 Edge TTS 合成语音
 * 返回音频 blob URL，失败返回 null
 */
export async function fetchTTS(text: string, voice?: string, rate?: number): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, rate }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size === 0) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/**
 * 从后端获取可用语音列表
 */
export async function getTTSVoices(): Promise<TTSVoiceDTO[]> {
  try {
    const res = await fetch(`${API_BASE}/tts/voices`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}
