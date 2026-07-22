/**
 * 🎧 英语单词听写路由
 * POST /dictation/next   — 获取下一个单词
 * POST /dictation/check  — 校验拼写
 * GET  /dictation/words  — 获取词库统计
 * GET  /dictation/wrong  — 获取错误记录
 */
import { Router } from 'express';
import { ok, fail } from '../utils/response.js';
import { dictationWords } from './dictation-words.js';
import type { DictationWord } from './dictation-words.js';

const router = Router();

// ── Session 状态 ──
interface DictSession {
  usedIds: Set<string>;
  currentWord: DictationWord | null;
  wrongWords: Map<string, { word: DictationWord; wrongAnswer: string; count: number; lastTime: string }>;
}

const sessions = new Map<string, DictSession>();

function getSession(sessionId: string): DictSession {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { usedIds: new Set(), currentWord: null, wrongWords: new Map() });
  }
  return sessions.get(sessionId)!;
}

// POST /dictation/next
router.post('/next', async (req, res, next) => {
  try {
    const sessionId = (req as any).userId || req.ip || 'anonymous';
    const body = req.body || {};
    const domain: string | undefined = body.domain;
    const difficulty: number | undefined = body.difficulty;

    const session = getSession(sessionId);

    // 筛选
    let pool = dictationWords;
    if (domain && domain !== 'all') pool = pool.filter(w => w.domain === domain);
    if (difficulty) pool = pool.filter(w => w.difficulty <= difficulty);

    // 过滤已用
    const unused = pool.filter(w => !session.usedIds.has(w.id));
    const available = unused.length > 0 ? unused : pool;

    const word = available[Math.floor(Math.random() * available.length)];
    session.usedIds.add(word.id);
    session.currentWord = word;

    ok(res, {
      id: word.id,
      word: word.word,
      phonetic: word.phonetic,
      chinese: word.chinese,
      sentence: word.sentence,
      difficulty: word.difficulty,
      domain: word.domain,
      progress: { used: session.usedIds.size, total: pool.length },
    });
  } catch (e: any) { next(e); }
});

// POST /dictation/check
router.post('/check', async (req, res, next) => {
  try {
    const sessionId = (req as any).userId || req.ip || 'anonymous';
    const { answer } = req.body || {};
    const session = getSession(sessionId);
    const current = session.currentWord;

    if (!current) { fail(res, 400, '请先获取一个单词'); return; }
    if (!answer?.trim()) { fail(res, 400, '请输入答案'); return; }

    const input = answer.trim().toLowerCase().replace(/[^a-z'-]/g, '');
    const correct = current.word.toLowerCase().replace(/[^a-z'-]/g, '');
    const isCorrect = input === correct;

    // 逐字母对比
    const letters: { index: number; expected: string; got: string }[] = [];
    const maxLen = Math.max(input.length, correct.length);
    for (let i = 0; i < maxLen; i++) {
      if (input[i] !== correct[i]) {
        letters.push({ index: i, expected: correct[i] || ' ', got: input[i] || ' ' });
      }
    }

    // 记录错词
    if (!isCorrect) {
      session.wrongWords.set(current.id, {
        word: current,
        wrongAnswer: answer,
        count: (session.wrongWords.get(current.id)?.count || 0) + 1,
        lastTime: new Date().toISOString(),
      });
    }

    ok(res, { correct: isCorrect, word: current.word, letters, userAnswer: answer });
  } catch (e: any) { next(e); }
});

// GET /dictation/words — 词库统计
router.get('/words', async (_req, res) => {
  const byDomain: Record<string, number> = {};
  for (const w of dictationWords) byDomain[w.domain] = (byDomain[w.domain] || 0) + 1;
  ok(res, { total: dictationWords.length, byDomain, domains: [...new Set(dictationWords.map(w => w.domain))] });
});

// GET /dictation/wrong — 错误记录
router.get('/wrong', async (req, res) => {
  const session = getSession((req as any).userId || req.ip || 'anonymous');
  const words = Array.from(session.wrongWords.values()).map(w => ({
    id: w.word.id,
    word: w.word.word,
    chinese: w.word.chinese,
    phonetic: w.word.phonetic,
    wrongAnswer: w.wrongAnswer,
    count: w.count,
    lastTime: w.lastTime,
  }));
  ok(res, words);
});

export default router;
