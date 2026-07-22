import { useEffect, useState } from 'react';
import { Card, Select, Slider, Button, Space, Typography, Tag, Divider } from 'antd';
import { SoundOutlined, BgColorsOutlined, PlayCircleOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { useSettingsStore, LANGUAGE_OPTIONS, getFilteredVoices, FALLBACK_VOICES } from '@/store/settingsStore';
import type { TTSLanguage } from '@/store/settingsStore';
import { useTheme } from '@/themes/ThemeContext';
import { useTTS } from '@/hooks/useTTS';
import { getTTSVoices } from '@/api/tts';
import type { TTSEngine } from '@/hooks/useTTS';



const GENDER_OPTIONS = [
  { value: 'female', label: '👩 女声' },
  { value: 'male',   label: '👨 男声' },
];

export default function SettingsPage() {
  const {
    ttsEngine, ttsVoice, ttsRate, ttsLanguage, ttsGender,
    ttsVoices,
    setTtsEngine, setTtsVoice, setTtsRate,
    setTtsLanguage, setTtsGender, setTtsVoices,
  } = useSettingsStore();

  const [loaded, setLoaded] = useState(false);

  // 语音列表（优先使用后端返回的，store 已初始化离线备用列表）
  const activeVoices = ttsVoices;

  // 当前语言+性别过滤后的语音
  const filtered = getFilteredVoices(activeVoices, ttsLanguage, ttsGender);

  const { speak, stop, isSpeaking, isLoading, currentEngine } = useTTS();

  // ── 主题 ──
  const { themeId, themes, setTheme } = useTheme();

  // ── 初始化：加载语音列表 ──
  useEffect(() => {
    if (loaded) return;
    setLoaded(true);
    getTTSVoices().then(data => {
      if (data.length > 0) setTtsVoices(data);
    });
  }, []);

  const testPlay = () => {
    stop();
    const text = `欢迎使用知识动力学习平台，这是一段语音测试。当前语速为${ttsRate.toFixed(1)}倍。`;
    speak(text, { rate: ttsRate });
  };

  const engineLabel: Record<TTSEngine, string> = {
    auto: '自动（优先 Edge TTS，失败降级 Web Speech）',
    edge: '仅 Edge TTS（在线高音质）',
    webspeech: '仅 Web Speech（浏览器原生，离线可用）',
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 60px' }}>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        ⚙️ 设置
      </Typography.Title>

      {/* ── 🎙️ TTS 设置 ── */}
      <Card
        title={<Space><SoundOutlined /> 语音朗读（TTS）</Space>}
        extra={
          currentEngine !== 'idle' && (
            <Tag color={currentEngine === 'edge' ? 'blue' : 'green'}>
              引擎：{currentEngine === 'edge' ? 'Edge TTS' : 'Web Speech'}
            </Tag>
          )
        }
        style={{ borderRadius: 12, marginBottom: 20 }}
      >
        {/* 引擎模式 */}
        <div style={{ marginBottom: 20 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
            引擎模式
          </Typography.Text>
          <Select
            value={ttsEngine}
            onChange={setTtsEngine}
            style={{ width: '100%' }}
            options={[
              { value: 'auto', label: engineLabel.auto },
              { value: 'edge', label: engineLabel.edge },
              { value: 'webspeech', label: engineLabel.webspeech },
            ]}
          />
        </div>

        {/* 语言 + 性别（两列布局） */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
              语言
            </Typography.Text>
            <Select
              value={ttsLanguage}
              onChange={setTtsLanguage}
              style={{ width: '100%' }}
              options={LANGUAGE_OPTIONS.map(o => ({
                value: o.value,
                label: o.label,
              }))}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
              声线
            </Typography.Text>
            <Select
              value={ttsGender}
              onChange={setTtsGender}
              style={{ width: '100%' }}
              options={GENDER_OPTIONS}
            />
          </div>
        </div>

        {/* 具体语音（级联结果） */}
        {filtered.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
              具体语音 <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>（选填，默认使用第一个）</span>
            </Typography.Text>
            <Select
              value={ttsVoice}
              onChange={setTtsVoice}
              style={{ width: '100%' }}
              options={filtered.map(v => ({
                value: v.voice,
                label: v.label,
              }))}
            />
          </div>
        )}

        {/* 语速 */}
        <div style={{ marginBottom: 20 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
            语速：{ttsRate.toFixed(1)}x
          </Typography.Text>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={ttsRate}
            onChange={setTtsRate}
            marks={{ 0.5: '慢', 1.0: '正常', 1.5: '快', 2.0: '最快' }}
          />
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* 试听 */}
        <Space>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={testPlay}
            type="primary"
            size="large"
            style={{ borderRadius: 8 }}
          >
            🔊 {isLoading ? '⏳ 合成中...' : isSpeaking ? '正在播放...' : '试听语音'}
          </Button>
          {(isSpeaking || isLoading) && (
            <Button onClick={stop} size="large" style={{ borderRadius: 8 }}>
              ⏹ 停止
            </Button>
          )}
        </Space>
      </Card>

      {/* ── 🎨 主题皮肤 ── */}
      <Card
        title={<Space><BgColorsOutlined /> 主题皮肤</Space>}
        style={{ borderRadius: 12, marginBottom: 20 }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}>
          {themes.map((t: any) => {
            const active = t.id === themeId;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: active ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                  background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', top: 4, right: 8,
                    color: 'var(--color-primary)',
                    fontSize: 16,
                  }}>✓</div>
                )}
                <div style={{ fontSize: 32, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{
                  fontWeight: active ? 700 : 400,
                  fontSize: 14,
                  color: active ? 'var(--color-primary)' : 'var(--color-text)',
                }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  {t.description}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
