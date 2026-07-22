import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card, Button, Input, Tag, Typography, Space, Divider, Progress,
  Spin, Empty, Alert, message, Select, Badge, Tooltip, Row, Col, Statistic,
} from 'antd';
import {
  SoundOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ReloadOutlined, BookOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { fetchNextWord, checkDictation, fetchDictationStats } from '@/api/dictation';
import { useTTS } from '@/hooks/useTTS';
import { useSettingsStore } from '@/store/settingsStore';
import type { DictationWordVO, DictationStats } from '@/api/dictation';

const DOMAIN_LIST = [
  { value: 'all', label: '全部领域' },
  { value: '基础词汇', label: '📗 基础词汇' },
  { value: '常用动词', label: '🏃 常用动词' },
  { value: '常用形容词', label: '🎨 常用形容词' },
  { value: '抽象名词', label: '🧠 抽象名词' },
  { value: '学术词汇', label: '📚 学术词汇' },
  { value: '常考短语', label: '🔤 常考短语' },
  { value: '科技词汇', label: '💻 科技词汇' },
  { value: '进阶词汇', label: '🔥 进阶词汇' },
];

type Phase = 'ready' | 'listening' | 'checking' | 'result';

export default function DictationPage() {
  // ── 状态 ──
  const [phase, setPhase] = useState<Phase>('ready');
  const [word, setWord] = useState<DictationWordVO | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<{ correct: boolean; letters: any[]; word: string; userAnswer: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DictationStats | null>(null);
  const [domain, setDomain] = useState('all');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = useRef<any>(null);

  const { speak, stop, isSpeaking } = useTTS();
  const ttsEngine = useSettingsStore(s => s.ttsEngine);

  // ── 初始化 ──
  useEffect(() => {
    fetchDictationStats().then(setStats);
  }, []);

  // ── 获取下一个单词 ──
  const getNextWord = useCallback(async () => {
    setLoading(true);
    setPhase('ready');
    setResult(null);
    setAnswer('');

    const w = await fetchNextWord(domain === 'all' ? undefined : domain);
    if (!w) {
      message.error('获取单词失败，请重试');
      setLoading(false);
      return;
    }

    setWord(w);
    setPhase('listening');
    setLoading(false);

    // 自动朗读 2 遍
    setTimeout(() => {
      speakWord(w.word);
    }, 300);
  }, [domain]);

  // ── TTS 朗读单词 ──
  const speakWord = useCallback((text: string) => {
    stop();
    speak(text, { rate: 0.8 });
  }, [speak, stop]);

  // ── 提交答案 ──
  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setPhase('checking');
    setLoading(true);

    // 先停止朗读
    stop();

    const res = await checkDictation(answer.trim());
    setLoading(false);
    setLoading(false);

    if (!res) {
      message.error('提交失败');
      setPhase('listening');
      return;
    }

    setResult(res);
    setPhase('result');
    setScore(prev => ({
      correct: prev.correct + (res.correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  // ── 下一题 ──
  const handleNext = () => {
    getNextWord();
    setAnswer('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── 重新播放 ──
  const replay = () => {
    if (word) {
      speakWord(word.word);
    }
  };

  // ── 渲染 ──
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 60px' }}>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>
        🎧 英语单词听写
      </Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        听到单词后输入拼写，系统自动判断正误并逐字母纠错
      </Typography.Text>

      {/* ── 配置栏 ── */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Select
              value={domain}
              onChange={setDomain}
              style={{ width: '100%' }}
              options={DOMAIN_LIST}
            />
          </Col>
          <Col>
            <Tooltip title="正确率">
              <Badge
                count={score.total > 0 ? `${Math.round(score.correct / score.total * 100)}%` : '-'}
                style={{ backgroundColor: score.total > 0 && score.correct / score.total >= 0.7 ? '#52c41a' : '#faad14' }}
              />
            </Tooltip>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SoundOutlined />}
              onClick={getNextWord}
              loading={loading}
              size="large"
              style={{ borderRadius: 8 }}
            >
              开始听写
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ── 主面板 ── */}
      <Card style={{ borderRadius: 12, minHeight: 300 }}>
        {phase === 'ready' && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <BookOutlined style={{ fontSize: 64, color: 'var(--color-text-secondary)', marginBottom: 16 }} />
            <Typography.Title level={4} type="secondary">
              准备好了吗？
            </Typography.Title>
            <Typography.Text type="secondary">
              点击「开始听写」按钮，系统将朗读单词供你拼写
            </Typography.Text>
            {stats && (
              <div style={{ marginTop: 20 }}>
                <Space size={16}>
                  <Statistic title="词库总量" value={stats.total} suffix="词" />
                  <Statistic title="领域数" value={stats.domains.length} suffix="个" />
                </Space>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 12 }}>加载中...</div>
          </div>
        )}

        {phase === 'listening' && word && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{word.domain}</Tag>
              <Tag>{'★'.repeat(word.difficulty)}</Tag>
            </div>

            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              🔊 仔细听，输入你的答案:
            </div>

            {/* 按键区 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              <Button
                size="large"
                icon={<SoundOutlined />}
                onClick={replay}
                type={isSpeaking ? 'primary' : 'default'}
                style={{ borderRadius: 8 }}
              >
                {isSpeaking ? '🔊 播放中...' : '🔊 再听一遍'}
              </Button>
            </div>

            {/* 输入区 */}
            <Input
              ref={inputRef}
              size="large"
              placeholder="输入单词拼写..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onPressEnter={handleSubmit}
              autoFocus
              style={{ maxWidth: 400, textAlign: 'center', fontSize: 18, borderRadius: 8 }}
              prefix="✏️"
            />

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={!answer.trim()}
                size="large"
                style={{ borderRadius: 8, minWidth: 120 }}
              >
                ✅ 提交
              </Button>
            </div>

            {/* 进度 */}
            {word.progress && (
              <div style={{ marginTop: 16 }}>
                <Progress
                  percent={Math.round(word.progress.used / word.progress.total * 100)}
                  size="small"
                  format={() => `${word.progress.used}/${word.progress.total}`}
                  style={{ maxWidth: 300, margin: '0 auto' }}
                />
              </div>
            )}
          </div>
        )}

        {phase === 'result' && result && (
          <div style={{ padding: '10px 0' }}>
            {/* 结果头 */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              {result.correct ? (
                <div>
                  <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
                  <Typography.Title level={4} style={{ color: '#52c41a', margin: '8px 0 0' }}>
                    ✅ 拼写正确！
                  </Typography.Title>
                </div>
              ) : (
                <div>
                  <CloseCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
                  <Typography.Title level={4} style={{ color: '#ff4d4f', margin: '8px 0 0' }}>
                    ❌ 拼写有误
                  </Typography.Title>
                </div>
              )}
            </div>

            <Divider />

            {/* 逐字母纠错 */}
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>拼写对比：</Typography.Text>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {result.word.split('').map((char: string, i: number) => {
                  const error = result.letters.find((r: any) => r.index === i);
                  const gotChar = result.userAnswer[i] || ' ';
                  return (
                    <Tooltip
                      key={i}
                      title={error ? `期望: ${char}, 你写: ${gotChar}` : char}
                    >
                      <div style={{
                        width: 32, height: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${error ? '#ff4d4f' : '#52c41a'}`,
                        borderRadius: 6,
                        background: error ? '#fff1f0' : '#f6ffed',
                        fontWeight: 600,
                        fontSize: 18,
                        color: error ? '#ff4d4f' : '#52c41a',
                      }}>
                        {char}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
              {result.letters.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <Typography.Text type="danger" style={{ fontSize: 13 }}>
                    <CloseCircleOutlined /> 你写了「{result.userAnswer}」 — 红色字母需注意
                  </Typography.Text>
                </div>
              )}
            </div>

            {/* 音标 */}
            {word?.phonetic && (
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Typography.Text code style={{ fontSize: 16 }}>
                  {word.phonetic}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                  {word.chinese}
                </Typography.Text>
              </div>
            )}

            {/* 例句 */}
            {word?.sentence && (
              <div style={{
                background: 'var(--color-surface)',
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 16,
                fontStyle: 'italic',
              }}>
                <Typography.Text style={{ fontSize: 15 }}>
                  💬 {word.sentence}
                </Typography.Text>
              </div>
            )}

            <Divider />

            {/* 操作按钮 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Button icon={<SoundOutlined />} onClick={replay}>
                🔊 再听一遍
              </Button>
              <Button type="primary" onClick={handleNext} size="large" style={{ borderRadius: 8 }}>
                下一题 &gt;
              </Button>
            </div>

            {/* 累计得分 */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Typography.Text type="secondary">
                <TrophyOutlined /> 累计：{score.correct} / {score.total}（
                {score.total > 0 ? Math.round(score.correct / score.total * 100) : 0}%）
              </Typography.Text>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
