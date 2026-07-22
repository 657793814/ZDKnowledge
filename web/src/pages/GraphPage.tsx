import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Tag, Typography, Space, Tooltip, Button } from 'antd';
import { ArrowLeftOutlined, BranchesOutlined, AimOutlined } from '@ant-design/icons';
import { fetchGraph } from '@/api';
import { KnowledgeGraph, GraphControls } from '@/components';
import type { GraphNodeVO, GraphEdgeVO, KnowledgeGraphVO } from '@/types';
import { SUBJECT_LABELS, SUBJECT_EMOJI } from '@/types';
import { useSubjectStore } from '@/store/subjectStore';

export default function GraphPage() {
  const { domain } = useParams();
  const navigate = useNavigate();
  const { currentSubject } = useSubjectStore();
  const [graphData, setGraphData] = useState<KnowledgeGraphVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  // 加载图数据
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setGraphData(null);
    setError(null);

    fetchGraph(currentSubject, domain)
      .then((data) => {
        if (!cancelled) {
          if (!data || !data.nodes || data.nodes.length === 0) {
            setError('暂无知识点数据');
          } else {
            setGraphData(data);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError('加载失败，请检查网络连接');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentSubject, domain]);

  // 响应式尺寸
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      ro.disconnect();
    };
  }, []);

  const handleDomainChange = (d: string | null) => {
    if (d) {
      navigate(`/graph/${encodeURIComponent(d)}`);
    } else {
      navigate('/graph');
    }
  };

  const handleNodeClick = (id: string) => {
    navigate(`/knowledge/${id}`);
  };

  // 过滤
  const filteredNodes = useMemo<GraphNodeVO[]>(
    () => graphData?.nodes.filter(n => !currentLevel || n.level === currentLevel) || [],
    [graphData?.nodes, currentLevel]
  );

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo<GraphEdgeVO[]>(
    () => graphData?.edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)) || [],
    [graphData?.edges, filteredNodeIds]
  );

  const levels = useMemo(() => {
    if (!graphData?.nodes) return [];
    return [...new Set(graphData.nodes.map(n => n.level).filter(Boolean))] as string[];
  }, [graphData?.nodes]);

  const subjectLabel = (SUBJECT_LABELS as any)[currentSubject] || currentSubject;

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* ── 顶栏 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginRight: 4 }}>
          返回首页
        </Button>
        <Typography.Text strong style={{ fontSize: 15, marginRight: 8 }}>
          {SUBJECT_EMOJI[currentSubject] || ''} {subjectLabel}
        </Typography.Text>
        {graphData && !error && (
          <>
            <Tag icon={<BranchesOutlined />} style={{ borderRadius: 12 }}>
              {graphData.nodes.length} 节点 · {graphData.edges.length} 关系
            </Tag>
            {domain && <Tag color="blue" closable onClose={() => handleDomainChange(null)}>{domain}</Tag>}
            {currentLevel && <Tag color="purple" closable onClose={() => setCurrentLevel(null)}>{currentLevel}</Tag>}
            {levels.length > 0 && (
              <Space size={4} style={{ marginLeft: 'auto' }}>
                <Tooltip title="按学习阶段筛选">
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>级别</span>
                </Tooltip>
                {levels.map(l => (
                  <Tag
                    key={l}
                    style={{ cursor: 'pointer', borderRadius: 8 }}
                    color={currentLevel === l ? 'purple' : undefined}
                    onClick={() => setCurrentLevel(currentLevel === l ? null : l)}
                  >
                    {l}
                  </Tag>
                ))}
              </Space>
            )}
          </>
        )}
      </div>

      {/* ── 图容器 ── */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', background: '#fafbfc' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 16 }}>
            <Spin size="large" />
            <Typography.Text type="secondary">加载知识图谱...</Typography.Text>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', paddingTop: 120 }}>
            <div style={{ fontSize: 56, opacity: 0.2, marginBottom: 12 }}><AimOutlined /></div>
            <Typography.Title level={4} type="secondary" style={{ fontWeight: 400 }}>
              {error === '暂无知识点数据'
                ? `${subjectLabel} 暂无知识点数据`
                : error}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, marginBottom: 16 }}>
              {error === '暂无知识点数据'
                ? '请先运行种子数据初始化，或切换到其他学科'
                : '请检查后端服务是否正常运行'}
            </Typography.Text>
            {error === '暂无知识点数据' && (
              <Button onClick={() => handleDomainChange(null)}>查看全部学科</Button>
            )}
          </div>
        ) : filteredNodes.length > 0 ? (
          <KnowledgeGraph
            key={domain || '__full__'}
            nodes={filteredNodes}
            edges={filteredEdges}
            width={size.width}
            height={size.height}
            onNodeClick={handleNodeClick}
          />
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 120, color: '#94a3b8' }}>
            <div style={{ fontSize: 56, opacity: 0.2, marginBottom: 12 }}><BranchesOutlined /></div>
            <p style={{ fontSize: 18 }}>当前筛选条件下没有节点</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              {currentLevel ? `当前仅显示「${currentLevel}」级别` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
