/**
 * TTS 文本朗诵路由
 * POST /tts — 使用 edge-tts 将文本转为音频流
 * GET  /tts/voices — 返回支持的中文语音列表（含语言分类和性别）
 */
import { Router } from 'express';
import { execSync } from 'child_process';
import { unlinkSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ttsCache } from '../utils/ttsCache.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

interface TTSRequestBody {
  text: string;
  voice?: string;
  rate?: number;
}

// ── 语音定义（含语言分类和性别）──
interface VoiceDef {
  voice: string;
  label: string;
  gender: 'male' | 'female';
  category: 'mandarin' | 'cantonese' | 'taiwanese' | 'dialect';
}

const ZH_VOICES: VoiceDef[] = [
  // ── 普通话 ──
  { voice: 'zh-CN-XiaoxiaoNeural', label: '晓晓', gender: 'female', category: 'mandarin' },
  { voice: 'zh-CN-XiaoyiNeural',   label: '晓依', gender: 'female', category: 'mandarin' },
  { voice: 'zh-CN-YunjianNeural',  label: '云健', gender: 'male',   category: 'mandarin' },
  { voice: 'zh-CN-YunxiNeural',    label: '云希', gender: 'male',   category: 'mandarin' },
  { voice: 'zh-CN-YunxiaNeural',   label: '云夏', gender: 'male',   category: 'mandarin' },
  { voice: 'zh-CN-YunyangNeural',  label: '云扬', gender: 'male',   category: 'mandarin' },
  // ── 方言 ──
  { voice: 'zh-CN-liaoning-XiaobeiNeural', label: '小北（辽宁）', gender: 'female', category: 'dialect' },
  { voice: 'zh-CN-shaanxi-XiaoniNeural',   label: '小妮（陕西）', gender: 'female', category: 'dialect' },
  // ── 粤语 ──
  { voice: 'zh-HK-HiuGaaiNeural',  label: '晓佳', gender: 'female', category: 'cantonese' },
  { voice: 'zh-HK-HiuMaanNeural',  label: '晓文', gender: 'female', category: 'cantonese' },
  { voice: 'zh-HK-WanLungNeural',  label: '云龙', gender: 'male',   category: 'cantonese' },
  // ── 台湾国语 ──
  { voice: 'zh-TW-HsiaoChenNeural', label: '晓真', gender: 'female', category: 'taiwanese' },
  { voice: 'zh-TW-HsiaoYuNeural',   label: '晓雨', gender: 'female', category: 'taiwanese' },
  { voice: 'zh-TW-YunJheNeural',    label: '云哲', gender: 'male',   category: 'taiwanese' },
];

const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural';

// 根据语言+性别自动推荐最合适的语音
function resolveVoice(language?: string, gender?: string): string {
  const candidates = ZH_VOICES.filter(v => {
    if (language && v.category !== language) return false;
    if (gender && v.gender !== gender) return false;
    return true;
  });
  return candidates.length > 0 ? candidates[0].voice : DEFAULT_VOICE;
}

// POST /tts
router.post('/', async (req, res, next) => {
  try {
    const { text, voice, rate = 1.0 } = req.body as TTSRequestBody;
    if (!text || !text.trim()) {
      res.status(400).json({ code: 400, msg: 'text is required', data: null });
      return;
    }

    // 缓存命中（按 text+voice 组合键，不同语音不共用缓存）
    const cacheKey = `${voice || DEFAULT_VOICE}::${text}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      res.set('Content-Type', 'audio/mpeg');
      res.set('X-TTS-Cache', 'hit');
      res.send(cached);
      return;
    }

    // 校验 voice 是否有效
    const selectedVoice = ZH_VOICES.find(v => v.voice === voice)?.voice || DEFAULT_VOICE;

    // 写入临时文件
    const tmpDir = join(__dirname, '../../.tts-cache');
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
    const tmpFile = join(tmpDir, `tts-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`);

    const rateParam = rate !== 1.0
      ? `--rate=${rate > 1 ? '+' : ''}${Math.round((rate - 1) * 100)}%`
      : '';
    const cmd = [
      'edge-tts',
      `--voice "${selectedVoice}"`,
      `--text "${text.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
      `--write-media "${tmpFile}"`,
      rateParam,
    ].filter(Boolean).join(' ');

    execSync(cmd, { timeout: 30000 });

    const audioBuffer = readFileSync(tmpFile);

    ttsCache.set(cacheKey, audioBuffer);

    try { unlinkSync(tmpFile); } catch {}

    res.set('Content-Type', 'audio/mpeg');
    res.set('X-TTS-Cache', 'miss');
    res.send(audioBuffer);
  } catch (e: any) {
    res.status(500).json({
      code: 500,
      msg: 'TTS generation failed: ' + (e?.message || 'unknown error'),
      data: null,
    });
  }
});

// GET /tts/voices — 返回语音列表（含分类和性别）
router.get('/voices', (_req, res) => {
  res.json({ code: 200, msg: 'ok', data: ZH_VOICES });
});

export default router;
