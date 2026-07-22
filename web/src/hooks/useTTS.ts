import { useRef, useState, useCallback } from 'react';
import { fetchTTS } from '@/api/tts';
import { mathToSpeech } from '@/utils/mathToSpeech';
import { useSettingsStore } from '@/store/settingsStore';

type TTSState = 'idle' | 'speaking' | 'paused' | 'loading';
export type TTSEngine = 'webspeech' | 'edge' | 'auto';

/**
 * Web Speech API + Edge TTS 双引擎文本朗读 Hook
 *
 * auto 策略：
 *   1. 尝试 Edge TTS（后端合成，支持精确语音选择：普通话/粤语/台语/男声/女声）
 *   2. 失败则降级为 Web Speech API（浏览器原生，仅支持基本中文 locale）
 *
 * TTS 设置从 useSettingsStore 读取（用户可在设置页面调整）
 *
 * 用法:
 *   const { isSpeaking, isEdgeEngine, speak, stop } = useTTS();
 *   speak('要朗读的文本');
 */
export function useTTS() {
  const [state, setState] = useState<TTSState>('idle');
  const [currentEngine, setCurrentEngine] = useState<string>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, overrides?: { rate?: number }) => {
    // 取消当前朗读
    stop();

    if (typeof window === 'undefined') return;
    if (!text.trim()) return;

    const speechText = mathToSpeech(text);
    // 实时读取 store（避免闭包过期）
    const store = useSettingsStore.getState();
    const rate = overrides?.rate ?? store.ttsRate;
    const engine = store.ttsEngine;
    const ttsVoice = store.ttsVoice;
    const ttsLanguage = store.ttsLanguage;
    const ttsGender = store.ttsGender;

    console.log('[TTS] speak called:', { engine, voice: ttsVoice, lang: ttsLanguage, gender: ttsGender, rate });

    // ── Edge TTS 优先（auto + edge 模式）──
    // Edge 能精确控制语音（普通话/粤语/台语 + 男声/女声），Web Speech 做不到
    if (engine === 'edge' || (engine === 'auto')) {
      setState('loading');
      setCurrentEngine('edge');
      try {
        const audioUrl = await fetchTTS(speechText, ttsVoice, rate);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => {
            setState('idle');
            setCurrentEngine('idle');
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            setState('idle');
            setCurrentEngine('idle');
            URL.revokeObjectURL(audioUrl);
            // Edge 失败，auto 模式下降级
            if (engine === 'auto') {
              speakWebSpeechFallback(speechText, rate, ttsLanguage, ttsGender);
            }
          };
          await audio.play();
          setState('speaking');
          return;
        }
      } catch (e) {
        console.warn('[TTS] Edge TTS failed:', e);
      }
      // Edge 失败，auto 模式下降级
      if (engine === 'auto') {
        speakWebSpeechFallback(speechText, rate, ttsLanguage, ttsGender);
        return;
      }
      setState('idle');
      setCurrentEngine('idle');
      return;
    }

    // ── Web Speech API（仅 webspeech 模式）──
    // 仅当用户手动选择此模式时才使用
    if (engine === 'webspeech') {
      speakWebSpeechFallback(speechText, rate, ttsLanguage, ttsGender);
    }
  }, []); // 不依赖闭包缓存，全部通过 getState 实时读取

  /** Web Speech 降级（locale 匹配，但无法精确控制语音） */
  const speakWebSpeechFallback = useCallback((text: string, rate: number, language?: string, gender?: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setCurrentEngine('webspeech');

    const utterance = new SpeechSynthesisUtterance(text);

    // 映射语言→浏览器 locale
    const localeMap: Record<string, string> = {
      mandarin: 'zh-CN',
      cantonese: 'zh-HK',
      taiwanese: 'zh-TW',
      dialect: 'zh-CN',
    };
    const targetLocale = localeMap[language || ''] || 'zh-CN';
    utterance.lang = targetLocale;

    // 按用户选择语言匹配语音
    const voices = window.speechSynthesis.getVoices();
    let matched = voices.find(v => v.lang === targetLocale);
    if (!matched) matched = voices.find(v => v.lang.startsWith(targetLocale));
    if (!matched) matched = voices.find(v => v.lang.startsWith('zh'));
    if (matched) utterance.voice = matched;

    utterance.rate = rate;

    utterance.onstart = () => { setState('speaking'); };
    utterance.onend = () => { setState('idle'); setCurrentEngine('idle'); };
    utterance.onpause = () => setState('paused');
    utterance.onresume = () => setState('speaking');
    utterance.onerror = (e) => { console.warn('[TTS] WS error:', e); setState('idle'); setCurrentEngine('idle'); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setState('paused');
      return;
    }
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setState('speaking');
      return;
    }
    if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setState('idle');
    setCurrentEngine('idle');
  }, []);

  const setRate = useCallback((rate: number) => {
    useSettingsStore.getState().setTtsRate(rate);
    if (utteranceRef.current) {
      utteranceRef.current.rate = rate;
    }
  }, []);

  const isSpeaking = state === 'speaking';
  const isEdgeEngine = currentEngine === 'edge';
  const isLoading = state === 'loading';

  return {
    state,
    isSpeaking,
    isLoading,
    currentEngine,
    isEdgeEngine,
    speak,
    pause,
    resume,
    stop,
    setRate,
  };
}
