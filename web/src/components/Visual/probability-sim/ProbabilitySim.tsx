import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Slider, Card, Row, Col, Statistic, Segmented, Space, Progress } from 'antd';
import { ReloadOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

type HistoryItem = string;

interface SimResult {
  heads: number;
  tails: number;
  total: number;
  history: HistoryItem[];
}

export default function ProbabilitySim() {
  const [mode, setMode] = useState<'coin' | 'dice'>('coin');
  const [runCount, setRunCount] = useState(100);
  const [speed, setSpeed] = useState(50);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimResult>({ heads: 0, tails: 0, total: 0, history: [] });
  const intervalRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const runOnce = useCallback(() => {
    if (mode === 'coin') {
      const isHead = Math.random() < 0.5;
      setResult(prev => ({
        heads: prev.heads + (isHead ? 1 : 0),
        tails: prev.tails + (isHead ? 0 : 1),
        total: prev.total + 1,
        history: [...prev.history, isHead ? 'H' : 'T'].slice(-50),
      }));
    } else {
      const face = Math.floor(Math.random() * 6) + 1;
      setResult(prev => ({
        heads: prev.heads + (face === 6 ? 1 : 0),
        tails: prev.tails + (face === 1 ? 1 : 0),
        total: prev.total + 1,
        history: [...prev.history, String(face) as any].slice(-50),
      }));
    }
  }, [mode]);

  const start = useCallback(() => {
    if (running) { stop(); return; }

    const maxTotal = result.total + runCount;
    const intervalMs = Math.max(10, 510 - speed * 5);

    setRunning(true);
    intervalRef.current = window.setInterval(() => {
      setResult(prev => {
        if (prev.total >= maxTotal) {
          stop();
          return prev;
        }
        if (mode === 'coin') {
          const isHead = Math.random() < 0.5;
          return {
            heads: prev.heads + (isHead ? 1 : 0),
            tails: prev.tails + (isHead ? 0 : 1),
            total: prev.total + 1,
            history: [...prev.history, isHead ? 'H' : 'T'].slice(-50),
          };
        } else {
          const face = Math.floor(Math.random() * 6) + 1;
          return {
            heads: prev.heads + (face === 6 ? 1 : 0),
            tails: prev.tails + (face === 1 ? 1 : 0),
            total: prev.total + 1,
            history: [...prev.history, String(face) as any].slice(-50),
          };
        }
      });
    }, intervalMs);
  }, [running, result.total, runCount, speed, mode, stop]);

  const reset = useCallback(() => {
    stop();
    setResult({ heads: 0, tails: 0, total: 0, history: [] });
  }, [stop]);

  const headProb = result.total > 0 ? (result.heads / result.total * 100) : 0;

  return (
    <Card title={null} size="small" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <Segmented
          value={mode}
          onChange={(val) => { reset(); setMode(val as 'coin' | 'dice'); }}
          options={[
            { value: 'coin', label: '🪙 抛硬币' },
            { value: 'dice', label: '🎲 掷骰子' },
          ]}
        />
      </div>

      {/* 可视化结果 */}
      <div style={{
        height: 80, background: '#f0f5ff', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        marginBottom: 12, fontSize: 20, overflow: 'hidden',
        padding: '0 8px',
      }}>
        {result.history.length === 0 ? (
          <span style={{ color: '#94a3b8', fontSize: 14 }}>点击「开始模拟」查看结果</span>
        ) : (
          result.history.map((h, i) => {
            if (mode === 'coin') {
              return <span key={i} style={{ fontSize: 22 }}>{h === 'H' ? '🪙' : '🪙'}</span>;
            }
            const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            return <span key={i} style={{ fontSize: 22 }}>{diceFaces[parseInt(h as string) - 1] || '🎲'}</span>;
          })
        )}
      </div>

      {/* 统计 */}
      <Row gutter={8} style={{ marginBottom: 12 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title={mode === 'coin' ? '正面' : '🎯 出现 6'}
              value={result.heads}
              valueStyle={{ color: '#3B82F6', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title={mode === 'coin' ? '反面' : '⚪ 出现 1'}
              value={result.tails}
              valueStyle={{ color: '#8B5CF6', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="总次数"
              value={result.total}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 概率条 */}
      {result.total > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Progress
            percent={Math.round(headProb)}
            success={{ percent: Math.round(100 - headProb), strokeColor: '#8B5CF6' }}
            strokeColor="#3B82F6"
            format={() => `正面 ${headProb.toFixed(1)}% / 反面 ${(100 - headProb).toFixed(1)}%`}
          />
          <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            {mode === 'coin'
              ? '理论概率：正面 50% / 反面 50% — 试验次数越多越接近'
              : '理论概率：每个面约 16.67% — 试验次数越多越均匀'}
          </div>
        </div>
      )}

      {/* 控制 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Space>
          <Button
            type="primary"
            icon={running ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={start}
          >
            {running ? '暂停' : '开始模拟'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={reset}>重置</Button>
        </Space>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>次数:</span>
          <Slider
            min={10}
            max={1000}
            step={10}
            value={runCount}
            onChange={setRunCount}
            style={{ width: 100 }}
          />
          <span style={{ fontSize: 12, minWidth: 30 }}>{runCount}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>速度:</span>
          <Slider
            min={1}
            max={100}
            value={speed}
            onChange={setSpeed}
            style={{ width: 80 }}
          />
        </div>
      </div>
    </Card>
  );
}
