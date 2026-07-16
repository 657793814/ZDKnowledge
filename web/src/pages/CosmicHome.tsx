import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import { SUBJECT_LABELS, SUBJECT_DOMAINS, DOMAIN_COLORS } from '@/types';
import type { SubjectKey } from '@/store/subjectStore';
import { useSubjectStore } from '@/store/subjectStore';
import { useSpaceCanvas } from '@/hooks/useSpaceCanvas';

// ─── 学科配色 ───
const SUBJECT_COLORS: Record<SubjectKey, {
  main: string; glow: string; accent: string; ring: string;
}> = {
  math:     { main: '#6366f1', glow: 'rgba(99,102,241,0.5)', accent: '#a5b4fc', ring: 'rgba(165,180,252,0.2)' },
  physics:  { main: '#f59e0b', glow: 'rgba(245,158,11,0.5)', accent: '#fde68a', ring: 'rgba(253,230,138,0.2)' },
  chemistry:{ main: '#10b981', glow: 'rgba(16,185,129,0.5)', accent: '#6ee7b7', ring: 'rgba(110,231,183,0.2)' },
};

const SUBJECT_EMOJI: Record<SubjectKey, string> = {
  math: '📐', physics: '⚛️', chemistry: '🧪',
};

// ─── 单个领域星球 ───
function DomainPlanet({ domainKey, domainLabel, color, orbitRadius, orbitDuration, orbitDelay, subject, onEnterSubject }: {
  domainKey: string; domainLabel: string; color: string;
  orbitRadius: number; orbitDuration: number; orbitDelay: number;
  subject: SubjectKey; onEnterSubject: () => void;
}) {
  const [showLabel, setShowLabel] = useState(false);
  // 非领域部分的标签（去除前缀）
  const shortLabel = String(domainLabel).replace(/^[^\s]+\s/, '');

  return (
    <div
      style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 0, height: 0,
        animation: `orbit ${orbitDuration}s linear infinite`,
        animationDelay: `${orbitDelay}s`,
        pointerEvents: 'none',
      } as React.CSSProperties}
    >
      {/* 轨道圆环（极淡） */}
      <div style={{
        position: 'absolute', top: -orbitRadius, left: -orbitRadius,
        width: orbitRadius * 2, height: orbitRadius * 2,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          position: 'absolute',
          transform: `translateX(${orbitRadius}px)`,
          transformOrigin: '0 0',
        }}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        onClick={onEnterSubject}
      >
        {/* 星球本体 */}
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${color}cc, ${color}88)`,
          boxShadow: `0 0 12px ${color}`,
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto',
        }}
          className="domain-dot"
        />

        {/* 悬浮标签 */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 22,
          transform: 'translateX(-50%)',
          opacity: showLabel ? 1 : 0,
          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          padding: '3px 10px',
          borderRadius: 6,
          border: `1px solid ${color}44`,
        }}>
          <span style={{
            fontSize: 11, color: '#fff', fontWeight: 500,
            textShadow: '0 0 8px rgba(0,0,0,0.8)',
          }}>
            {shortLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── 主组件 ───
export default function CosmicHome() {
  const navigate = useNavigate();
  const { setSubject } = useSubjectStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [entered, setEntered] = useState(false);
  const [hoveredSubject, setHoveredSubject] = useState<SubjectKey | null>(null);

  useSpaceCanvas(canvasRef, () => setEntered(true));

  const subjects: SubjectKey[] = ['math', 'physics', 'chemistry'];

  const handleEnterSubject = (subject: SubjectKey) => {
    setSubject(subject);
    navigate('/graph');
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        cursor: 'default',
      }}
    >
      {/* ═══ Canvas 深空背景 ═══ */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', display: 'block',
        }}
      />

      <style>{`
        @keyframes titleReveal {
          from { opacity: 0; transform: translateY(40px) scale(0.9); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes subtitleReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes introFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes planetPulse {
          0%, 100% { box-shadow: 0 0 20px var(--planet-glow); }
          50% { box-shadow: 0 0 40px var(--planet-glow), 0 0 80px var(--planet-glow-dim); }
        }
        @keyframes subjectEnter {
          from { opacity: 0; transform: scale(0); filter: blur(20px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes floatHint {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }
        @keyframes ringSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .subject-core {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          animation: subjectEnter 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.4s ease;
        }
        .subject-core:hover {
          transform: translate(-50%, -50%) scale(1.15) !important;
          z-index: 100;
        }
        .subject-core:hover .subject-name {
          opacity: 1 !important;
        }
        .subject-core:hover .ring-glow {
          opacity: 1 !important;
        }
        .subject-core:nth-child(3) { animation-delay: 0.15s; }
        .subject-core:nth-child(4) { animation-delay: 0.35s; }
        .subject-core:nth-child(5) { animation-delay: 0.55s; }

        .subject-name {
          position: absolute;
          bottom: -42px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
          pointer-events: none;
          font-size: clamp(14px, 1.5vw, 18px);
          font-weight: 700;
          letter-spacing: 4px;
        }

        .domain-dot:hover {
          transform: scale(1.4) !important;
          filter: brightness(1.4);
        }
      `}</style>

      {/* ═══ 标题 ═══ */}
      <div style={{
        position: 'absolute', top: '4%', left: 0, right: 0,
        textAlign: 'center', zIndex: 50, pointerEvents: 'none',
      }}>
        <div style={{ animation: 'titleReveal 1.2s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>
          <Typography.Title level={1} style={{
            margin: 0,
            fontSize: 'clamp(34px, 5.5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 20%, #fde68a 45%, #6ee7b7 70%, #a5b4fc 90%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 50px rgba(99,102,241,0.3))',
            lineHeight: 1.2,
          }}>
            知识动力
          </Typography.Title>
        </div>
        <div style={{ animation: 'subtitleReveal 1s ease-out 1s both', marginTop: 12 }}>
          <span style={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: 'clamp(11px, 1.1vw, 14px)',
            letterSpacing: '0.6em',
            textShadow: '0 0 20px rgba(0,0,0,0.8)',
          }}>
            探索知识的浩瀚宇宙
          </span>
        </div>
      </div>

      {/* ═══ 三个学科核心星球（三角形排列）═══ */}
      {/* 
        整体布局：一个大轨道系统，三个学科核心在三角形顶点，
        各自的领域星球绕各核心公转。
      */}

      {/* 核心 1 — 数学（左上） */}
      {(() => {
        const subject: SubjectKey = 'math';
        const colors = SUBJECT_COLORS[subject];
        const domains = Object.entries(SUBJECT_DOMAINS[subject] || {});
        return (
          <div
            className="subject-core"
            style={{
              transform: 'translate(-50%, -50%)',
              width: 110, height: 110, top: '38%', left: '32%',
              background: `radial-gradient(circle at 30% 25%, ${colors.accent} 0%, ${colors.main} 40%, ${colors.main}88 100%)`,
              boxShadow: `0 0 40px ${colors.glow}`,
              '--planet-glow': colors.glow,
              '--planet-glow-dim': colors.glow.replace('0.5', '0.1'),
            } as React.CSSProperties}
            onClick={() => handleEnterSubject(subject)}
          >
            <span style={{ fontSize: 36, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>
              {SUBJECT_EMOJI[subject]}
            </span>
            <div className="subject-name" style={{ color: colors.accent, textShadow: `0 0 30px ${colors.glow}` }}>
              {SUBJECT_LABELS[subject]}
            </div>

            {/* 发光环 */}
            <div className="ring-glow" style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.glow.replace('0.5', '0.08')} 0%, transparent 70%)`,
              pointerEvents: 'none', opacity: 0,
              transition: 'opacity 0.6s ease',
            }} />

            {/* 领域星球 */}
            {domains.map(([dk, dl], di) => (
              <DomainPlanet
                key={dk}
                domainKey={dk}
                domainLabel={dl}
                color={DOMAIN_COLORS[dk] || colors.main}
                orbitRadius={55 + (di % 3) * 20}
                orbitDuration={18 + di * 2}
                orbitDelay={di * 0.3}
                subject={subject}
                onEnterSubject={() => handleEnterSubject(subject)}
              />
            ))}
          </div>
        );
      })()}

      {/* 核心 2 — 物理（右上） */}
      {(() => {
        const subject: SubjectKey = 'physics';
        const colors = SUBJECT_COLORS[subject];
        const domains = Object.entries(SUBJECT_DOMAINS[subject] || {});
        return (
          <div
            className="subject-core"
            style={{
              transform: 'translate(-50%, -50%)',
              width: 120, height: 120, top: '35%', left: '68%',
              background: `radial-gradient(circle at 30% 25%, ${colors.accent} 0%, ${colors.main} 40%, ${colors.main}88 100%)`,
              boxShadow: `0 0 40px ${colors.glow}`,
              '--planet-glow': colors.glow,
              '--planet-glow-dim': colors.glow.replace('0.5', '0.1'),
            } as React.CSSProperties}
            onClick={() => handleEnterSubject(subject)}
          >
            <span style={{ fontSize: 40, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>
              {SUBJECT_EMOJI[subject]}
            </span>
            <div className="subject-name" style={{ color: colors.accent, textShadow: `0 0 30px ${colors.glow}` }}>
              {SUBJECT_LABELS[subject]}
            </div>
            <div className="ring-glow" style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.glow.replace('0.5', '0.08')} 0%, transparent 70%)`,
              pointerEvents: 'none', opacity: 0,
              transition: 'opacity 0.6s ease',
            }} />
            {domains.map(([dk, dl], di) => (
              <DomainPlanet
                key={dk} domainKey={dk} domainLabel={dl}
                color={DOMAIN_COLORS[dk] || colors.main}
                orbitRadius={60 + (di % 3) * 22}
                orbitDuration={20 + di * 2.5}
                orbitDelay={di * 0.4}
                subject={subject}
                onEnterSubject={() => handleEnterSubject(subject)}
              />
            ))}
          </div>
        );
      })()}

      {/* 核心 3 — 化学（下中） */}
      {(() => {
        const subject: SubjectKey = 'chemistry';
        const colors = SUBJECT_COLORS[subject];
        const domains = Object.entries(SUBJECT_DOMAINS[subject] || {});
        return (
          <div
            className="subject-core"
            style={{
              transform: 'translate(-50%, -50%)',
              width: 100, height: 100, top: '62%', left: '50%',
              background: `radial-gradient(circle at 30% 25%, ${colors.accent} 0%, ${colors.main} 40%, ${colors.main}88 100%)`,
              boxShadow: `0 0 40px ${colors.glow}`,
              '--planet-glow': colors.glow,
              '--planet-glow-dim': colors.glow.replace('0.5', '0.1'),
            } as React.CSSProperties}
            onClick={() => handleEnterSubject(subject)}
          >
            <span style={{ fontSize: 34, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>
              {SUBJECT_EMOJI[subject]}
            </span>
            <div className="subject-name" style={{ color: colors.accent, textShadow: `0 0 30px ${colors.glow}` }}>
              {SUBJECT_LABELS[subject]}
            </div>
            <div className="ring-glow" style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.glow.replace('0.5', '0.08')} 0%, transparent 70%)`,
              pointerEvents: 'none', opacity: 0,
              transition: 'opacity 0.6s ease',
            }} />
            {domains.map(([dk, dl], di) => (
              <DomainPlanet
                key={dk} domainKey={dk} domainLabel={dl}
                color={DOMAIN_COLORS[dk] || colors.main}
                orbitRadius={50 + (di % 3) * 18}
                orbitDuration={16 + di * 1.8}
                orbitDelay={di * 0.25}
                subject={subject}
                onEnterSubject={() => handleEnterSubject(subject)}
              />
            ))}
          </div>
        );
      })()}

      {/* ═══ 底部导航 ═══ */}
      <div style={{
        position: 'absolute', bottom: '3%', left: 0, right: 0,
        textAlign: 'center', zIndex: 50,
        animation: 'introFadeIn 2s ease-out 2s both',
      }}>
        <div style={{ animation: 'floatHint 4s ease-in-out infinite' }}>
          <div style={{
            color: 'rgba(255,255,255,0.10)', fontSize: 11, letterSpacing: 5,
            marginBottom: 16,
          }}>
            ✦  点击学科核心进入知识星系  ✦
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          {subjects.map(s => {
            const colors = SUBJECT_COLORS[s];
            return (
              <span
                key={s}
                style={{
                  color: colors.accent, fontSize: 13, opacity: 0.35,
                  cursor: 'pointer', transition: 'all 0.4s',
                  letterSpacing: 2, padding: '4px 14px', borderRadius: 20,
                  border: '1px solid transparent',
                  pointerEvents: 'auto',
                }}
                onClick={() => handleEnterSubject(s)}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.opacity = '0.8';
                  (e.target as HTMLElement).style.borderColor = colors.glow;
                  (e.target as HTMLElement).style.background = colors.glow.replace('0.5', '0.08');
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.opacity = '0.35';
                  (e.target as HTMLElement).style.borderColor = 'transparent';
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
              >
                ✦ {String(SUBJECT_LABELS[s])}
              </span>
            );
          })}
        </div>
      </div>

      {/* ═══ 版本号 ═══ */}
      <div style={{
        position: 'absolute', bottom: '1.2%', right: '3%',
        color: 'rgba(255,255,255,0.04)', fontSize: 9, zIndex: 50,
        letterSpacing: 2, pointerEvents: 'none',
        animation: 'introFadeIn 3s ease-out 3s both',
      }}>
        KnowledgePower v0.1
      </div>
    </div>
  );
}
