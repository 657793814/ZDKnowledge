import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Spin, Empty, Pagination, Tag, Typography, Space, Card, Divider } from 'antd';
import { SearchOutlined, BookOutlined, FireOutlined, ExperimentOutlined } from '@ant-design/icons';
import { searchKnowledge } from '@/api';
import { KnowledgeCard } from '@/components';
import type { KnowledgeNode } from '@/types';
import { SUBJECT_LABELS, SUBJECT_EMOJI } from '@/types';
import { useSubjectStore } from '@/store/subjectStore';

/** 每个学科的快速搜索建议 */
const QUICK_TAGS: Record<string, string[]> = {
  math: ['函数', '方程', '几何', '三角函数', '导数', '向量', '数列', '概率'],
  physics: ['牛顿定律', '电磁感应', '力学', '光学', '热学', '电场', '动量', '万有引力'],
  chemistry: ['氧化还原', '化学平衡', '有机化学', '元素周期表', '离子反应', '物质的量'],
  bio: ['细胞分裂', '光合作用', '遗传', '进化', '生态系统', '呼吸作用', '免疫'],
  eng: ['时态', '从句', '被动语态', '词汇', '写作', '阅读理解', '定语从句'],
  history: ['文艺复兴', '工业革命', '二战', '冷战', '秦汉', '新航路'],
  politics: ['市场经济', '法治', '哲学', '唯物论', '辩证法', '国家制度'],
  geo: ['气候', '洋流', '板块运动', '人口迁移', '水循环', '地图'],
  chinese: ['古诗', '文言文', '修辞', '作文', '阅读理解', '成语'],
  cs: ['算法', '排序', '数据结构', '网络', 'OS', '数据库'],
};



export default function SearchPage() {
  const { currentSubject } = useSubjectStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<KnowledgeNode[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(q);

  useEffect(() => {
    if (!q) {
      setResults([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    const subject = currentSubject;
    searchKnowledge(q, subject, page, pageSize)
      .then((res: any) => {
        if (res && res.items) {
          setResults(res.items);
          setTotal(res.total);
        } else if (Array.isArray(res)) {
          setResults(res);
          setTotal(res.length);
        }
      })
      .finally(() => setLoading(false));
  }, [q, currentSubject, page, pageSize]);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      setPage(1);
      setSearchParams({ q: value });
    }
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const subjectLabel = SUBJECT_LABELS[currentSubject] || currentSubject;
  const quickTags = QUICK_TAGS[currentSubject] || QUICK_TAGS.math;
  const subjectEmoji = SUBJECT_EMOJI[currentSubject] || '📚';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      {/* ── 标题 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          <SearchOutlined style={{ color: '#fff' }} />
        </div>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>搜索知识</Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {subjectEmoji} 当前学科：{subjectLabel}
          </Typography.Text>
        </div>
      </div>

      {/* ── 搜索框 ── */}
      <Input.Search
        placeholder={`在「${subjectLabel}」中搜索知识点...`}
        allowClear
        size="large"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSearch={handleSearch}
        enterButton="搜索"
        style={{ marginBottom: 16 }}
      />

      {/* ── 快速搜索标签 ── */}
      {!q && (
        <Card size="small" style={{ marginBottom: 16, borderRadius: 10, background: '#f8fafc' }} bodyStyle={{ padding: '12px 16px' }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Typography.Text style={{ fontSize: 13, color: '#64748b' }}>
              <FireOutlined style={{ marginRight: 4, color: '#f59e0b' }} />
              热门搜索
            </Typography.Text>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {quickTags.map(tag => (
                <Tag
                  key={tag}
                  onClick={() => { setInputValue(tag); handleSearch(tag); }}
                  style={{ cursor: 'pointer', padding: '2px 12px', borderRadius: 16, fontSize: 13 }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </Space>
        </Card>
      )}

      {/* ── 结果统计 ── */}
      {q && (
        <div style={{
          marginBottom: 16, padding: '8px 14px', background: '#f1f5f9', borderRadius: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <Typography.Text style={{ fontSize: 13, color: '#475569' }}>
            <BookOutlined style={{ marginRight: 4 }} />
            共找到 <strong>{total}</strong> 条与 "<strong>{q}</strong>" 相关的{total > 0 ? '结果' : '知识点'}
          </Typography.Text>
          {total > 0 && (
            <Typography.Text style={{ fontSize: 12, color: '#94a3b8' }}>
              {subjectEmoji} {subjectLabel} · 第 {page}/{Math.ceil(total / pageSize)} 页
            </Typography.Text>
          )}
        </div>
      )}

      {/* ── 内容区 ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 12, color: '#94a3b8' }}>搜索中...</div>
        </div>
      ) : q ? (
        results.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {results.map(node => (
                <div key={node.id} style={{ position: 'relative' }}>
                  <KnowledgeCard node={node} />
                </div>
              ))}
            </div>
            {total > pageSize && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={page}
                  total={total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(t) => `共 ${t} 条结果`}
                />
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <Typography.Title level={4} type="secondary">
              未找到相关结果
            </Typography.Title>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              没有与「{q}」匹配的{subjectLabel}知识点，试试换个关键词
            </Typography.Text>
            <Space wrap>
              {quickTags.slice(0, 5).map(tag => (
                <Tag
                  key={tag}
                  onClick={() => { setInputValue(tag); handleSearch(tag); }}
                  style={{ cursor: 'pointer', padding: '4px 16px', borderRadius: 16, fontSize: 13 }}
                  color="blue"
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 64, opacity: 0.3, marginBottom: 16 }}>
            <ExperimentOutlined />
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 15 }}>
            输入关键词或点击上方热门标签，搜索当前学科知识点
          </Typography.Text>
          <Divider style={{ maxWidth: 300, margin: '24px auto' }} />
          <Typography.Text type="secondary" style={{ fontSize: 13, display: 'block', color: '#94a3b8' }}>
            支持搜索知识点标题、概述和详细内容
          </Typography.Text>
        </div>
      )}
    </div>
  );
}
