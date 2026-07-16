import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import { SUBJECT_LABELS, SUBJECT_DOMAINS, DOMAIN_COLORS } from '@/types';
import type { SubjectKey } from '@/store/subjectStore';
import { useSubjectStore } from '@/store/subjectStore';
import { useSpaceCanvas } from '@/hooks/useSpaceCanvas';

// ─── 星系配色 ───
const GALAXY_COLORS: Record<string, {
  main: string; glow: string; accent: string; inner: string; ring: string;
}> = {
  math: {
    main: '#6366f1',
    glow: 'rgba(99,102,241,0.6)',
    accent: '#a5b4fc',
    inner: '#818cf8',
    ring: 'rgba(129,140,248,0.3)',
  },
  physics: {
    main: '#f59e0b',
    glow: 'rgba(245,158,11,0.6)',
    accent: '#fde68a',
    inner: '#fbbf24',
    ring: 'rgba(251,191,36,0.3)',
  },
  chemistry: {
    main: '#10b981',
    glow: 'rgba(16,185,129,0.6)',
    accent: '#6ee7b7',
    inner: '#34d399',
    ring: 'rgba(52,211,153,0.3)',
  },
};

const SUBJECT_EMOJI: Record<string, string> = {
  math: '📐',
  physics: '⚛️',
  chemistry: '🧪',
};

// ─── 每个星系内部的旋转粒子 ───
function genGalaxyParticles(count: number, colors: typeof GALAXY_COLORS.math) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360,
    radius: 18 + Math.random() * 55,
    size: 1.0 + Math.random() * 2.5,
    speed: 0.4 + Math.random() * 0.8,
    delay: Math.random() * 5,
    opacity: 0.3 + Math.random() * 0.5,
    hue: i % 3 === 0 ? colors.accent : '#fff',
  }));
}

// ─── 星座连线 ───
const CONSTELLATIONS: { from: number; to: number }[] = [];
for (let i = 0; i < 12; i++) {
  CONSTELLATIONS.push({ from: Math.floor(Math.random() * 100), to: Math.floor(Math.random() * 100) });
}

export default function CosmicHome() {
  const navigate = useNavigate();
  const { setSubject } = useSubjectStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [entered, setEntered] = useState(false);
  const [hoveredGalaxy, setHoveredGalaxy] = useState<string | null>(null);

  // Canvas 鼠标位置同步
  const { setMouse } = useSpaceCanvas(canvasRef, () => setEntered(true));

  const subjects = useMemo(() => (['math', 'physics', 'chemistry'] as SubjectKey[]), []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouse(
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height
    );
  }, [setMouse]);

  const handleEnterSubject = useCallback((subject: SubjectKey) => {
    setSubject(subject);
    navigate('/graph');
  }, [setSubject, navigate]);

  // 星系排列：弧形 3D 布局
  const galaxyLayout = [
    { left: '14%', top: '37%', z: -60, scale: 0.92 },
    { left: '50%', top: '28%', z: 40, scale: 1.10 },
    { left: '84%', top: '40%', z: -30, scale: 0.94 },
  ];

  const galaxyColors = [GALAXY_COLORS.math, GALAXY_COLORS.physics, GALAXY_COLORS.chemistry];
  const galaxyParticles = subjects.map((s, i) => genGalaxyParticles(30, galaxyColors[i]));

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={(e) => { e.stopPropagation(); }}
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
          width: '100%', height: '100%',
          display: 'block',
        }}
      />

      <style>{`
        @keyframes galaxyPulse {
          0%, 100% { box-shadow: 0 0 30px var(--glow); }
          50% { box-shadow: 0 0 60px var(--glow), 0 0 100px var(--glow-dim); }
        }
        @keyframes orbitRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitRotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes floatText {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }
        @keyframes titleReveal {
          from { opacity: 0; transform: translateY(40px) scale(0.9); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes subtitleReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes galaxyEnter {
          from { opacity: 0; transform: translate(-50%, -50%) translateZ(-300px) scale(0.3); filter: blur(15px); }
          to { opacity: 1; transform: translate(-50%, -50%) translateZ(var(--z)) scale(var(--scl)); filter: blur(0); }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg); }
          to { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
        }
        @keyframes introFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes constellationDraw {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }

        .galaxy-wrapper {
          position: absolute;
          cursor: pointer;
          transform-style: preserve-3d;
          will-change: transform;
          transition: transform 0.15s cubic-bezier(0.23, 1, 0.32, 1);
          animation: galaxyEnter 1.8s cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }
        .galaxy-wrapper:nth-child(1) { animation-delay: 0.3s; }
        .galaxy-wrapper:nth-child(2) { animation-delay: 0.7s; }
        .galaxy-wrapper:nth-child(3) { animation-delay: 1.1s; }

        .galaxy-wrapper:hover { z-index: 100 !important; }
        .galaxy-wrapper:hover .galaxy-nucleus {
          box-shadow: 0 0 80px var(--glow), 0 0 150px var(--glow-dim) !important;
          transform: translate(-50%, -50%) scale(1.05);
        }
        .galaxy-wrapper:hover .orbit-ring {
          opacity: 0.5 !important;
          border-width: 2px;
        }
        .galaxy-wrapper:hover .domain-dot {
          filter: brightness(1.8) drop-shadow(0 0 8px white);
          transform: scale(1.3);
        }
        .galaxy-wrapper:hover .galaxy-label {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(0) scale(1) !important;
        }
        .galaxy-wrapper:hover .galaxy-emoji {
          transform: translate(-50%, -50%) scale(1.2);
        }
        .particle-dot {
          position: absolute;
          border-radius: 50%;
          animation: starSpin linear infinite;
        }
      `}</style>

      {/* ═══ 标题动画层 ═══ */}
      <div style={{
        position: 'absolute', top: '4%', left: 0, right: 0,
        textAlign: 'center', zIndex: 50, pointerEvents: 'none',
      }}>
        {/* 主标题 */}
        <div style={{
          animation: 'titleReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
        }}>
          <Typography.Title level={1} style={{
            margin: 0,
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 25%, #fde68a 55%, #6ee7b7 80%, #a5b4fc 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 40px rgba(99,102,241,0.25))',
            lineHeight: 1.2,
          }}>
            知识动力
          </Typography.Title>
        </div>

        {/* 副标题 */}
        <div style={{
          animation: 'subtitleReveal 1s ease-out 1s both',
          marginTop: 12,
        }}>
          <span style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 'clamp(11px, 1.2vw, 14px)',
            letterSpacing: '0.6em',
            textShadow: '0 0 20px rgba(0,0,0,0.8)',
          }}>
            探索知识的浩瀚宇宙
          </span>
        </div>

        {/* 装饰分隔线 */}
        <div style={{
          animation: 'subtitleReveal 1s ease-out 1.3s both',
          marginTop: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(165,180,252,0.3))' }} />
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(165,180,252,0.3)' }} />
          <span style={{ width: 40, height: 1, background: 'linear-gradient(90deg, rgba(165,180,252,0.3), transparent)' }} />
        </div>
      </div>

      {/* ═══ 三个星系 ═══ */}
      {subjects.map((subject, idx) => {
        const colors = galaxyColors[idx];
        const domains = Object.entries(SUBJECT_DOMAINS[subject] || {});
        const label = SUBJECT_LABELS[subject];
        const layout = galaxyLayout[idx];
        const particles = galaxyParticles[idx];
        const isHovered = hoveredGalaxy === subject;

        return (
          <div
            key={subject}
            className="galaxy-wrapper"
            style={{
              left: layout.left,
              top: layout.top,
              transform: `translate(-50%, -50%) translateZ(${layout.z}px) scale(${layout.scale})`,
              '--z': `${layout.z}px`,
              '--scl': layout.scale,
              width: 300, height: 300,
              transformStyle: 'preserve-3d',
              '--glow': colors.glow,
              '--glow-dim': colors.glow.replace('0.6', '0.1'),
            } as React.CSSProperties}
            onClick={() => handleEnterSubject(subject)}
            onMouseEnter={() => setHoveredGalaxy(subject)}
            onMouseLeave={() => setHoveredGalaxy(null)}
            title={`进入${String(label)}的知识星系`}
          >
            {/* 星系外发光晕 */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 340, height: 340, borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.glow.replace('0.6', '0.06')} 0%, transparent 70%)`,
              pointerEvents: 'none',
              transition: 'all 0.6s ease',
              opacity: isHovered ? 1 : 0.6,
            }} />

            {/* 轨道环 1 — 大水平 */}
            <div className="orbit-ring" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 280, height: 280, borderRadius: '50%',
              border: `1.5px solid ${colors.ring}`,
              opacity: 0.2,
              animation: 'orbitRotate 30s linear infinite',
              transition: 'opacity 0.4s ease, border-width 0.3s',
              pointerEvents: 'none',
            } as React.CSSProperties} />

            {/* 轨道环 2 — 倾斜 */}
            <div className="orbit-ring" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotateX(70deg)',
              width: 240, height: 240, borderRadius: '50%',
              border: `1px solid ${colors.ring}`,
              opacity: 0.1,
              animation: 'orbitRotateReverse 40s linear infinite',
              transition: 'opacity 0.4s ease',
              pointerEvents: 'none',
            } as React.CSSProperties} />

            {/* 轨道环 3 — 小垂直 */}
            <div className="orbit-ring" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotateY(45deg)',
              width: 200, height: 200, borderRadius: '50%',
              border: `0.5px solid ${colors.ring}`,
              opacity: 0.06,
              animation: 'orbitRotateReverse 50s linear infinite',
              pointerEvents: 'none',
            } as React.CSSProperties} />

            {/* 轨道上的领域星球 */}
            {domains.map(([domainKey, domainLabel], di) => {
              const angle = (di / domains.length) * 360 + 15;
              const dotColor = DOMAIN_COLORS[domainKey] || colors.main;
              return (
                <div key={domainKey} style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 0, height: 0,
                  animation: `orbitRotate ${25 + di * 1.5}s linear infinite`,
                  pointerEvents: 'none',
                } as React.CSSProperties}>
                  <div style={{
                    position: 'absolute',
                    transform: `rotate(${angle}deg) translateX(140px)`,
                    transformOrigin: '0 0',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  }}>
                    <div className="domain-dot" style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: dotColor,
                      boxShadow: `0 0 8px ${dotColor}`,
                      transition: 'all 0.3s ease',
                    }} />
                    <span className="domain-dot-label" style={{
                      fontSize: 8, color: 'rgba(255,255,255,0.35)',
                      whiteSpace: 'nowrap',
                      textShadow: '0 0 8px rgba(0,0,0,0.9)',
                      letterSpacing: 1,
                      opacity: isHovered ? 0.9 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(-4px)',
                      transition: 'all 0.4s ease',
                      transitionDelay: `${di * 0.05}s`,
                    }}>
                      {String(domainLabel).replace(/^[^\s]+\s/, '')}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* 星系核 — 主体 */}
            <div className="galaxy-nucleus" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 130, height: 130, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${colors.accent} 0%, ${colors.main} 35%, ${colors.main}dd 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${colors.glow}`,
              animation: 'galaxyPulse 4s ease-in-out infinite',
              animationDelay: `${idx * 0.8}s`,
              transition: 'box-shadow 0.4s ease, transform 0.4s ease',
              '--glow': colors.glow,
              '--glow-dim': colors.glow.replace('0.6', '0.1'),
            } as React.CSSProperties}>
              <span className="galaxy-emoji" style={{
                fontSize: 48,
                transition: 'transform 0.3s ease',
              }}>
                {SUBJECT_EMOJI[subject]}
              </span>
            </div>

            {/* 星系核内部旋转粒子 */}
            {particles.map(p => (
              <div key={p.id} className="particle-dot" style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 0, height: 0,
                animationDuration: `${5 / p.speed}s`,
                animationDelay: `${p.delay}s`,
                '--r': `${p.radius}px`,
                pointerEvents: 'none',
              } as React.CSSProperties}>
                <div style={{
                  position: 'absolute',
                  width: p.size, height: p.size, borderRadius: '50%',
                  background: p.hue,
                  opacity: p.opacity * (isHovered ? 1.2 : 1),
                  transform: `translateX(${p.radius}px)`,
                  boxShadow: `0 0 ${p.size * 2}px ${p.hue}`,
                  transition: 'opacity 0.4s ease',
                }} />
              </div>
            ))}

            {/* 星系底部标签 */}
            <div className="galaxy-label" style={{
              position: 'absolute', bottom: -40, left: '50%',
              transform: 'translateX(-50%) translateY(10px) scale(0.9)',
              opacity: 0,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              whiteSpace: 'nowrap', pointerEvents: 'none',
              color: colors.accent,
              fontSize: 'clamp(16px, 1.8vw, 22px)',
              fontWeight: 700,
              letterSpacing: 5,
              textShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
            }}>
              {String(label)}
            </div>
          </div>
        );
      })}

      {/* ═══ 底部导航 ═══ */}
      <div style={{
        position: 'absolute', bottom: '4%', left: 0, right: 0,
        textAlign: 'center', zIndex: 50, pointerEvents: 'none',
        animation: 'introFadeIn 2s ease-out 2s both',
      }}>
        <div style={{
          animation: 'floatText 4s ease-in-out infinite',
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.1)', fontSize: 11, letterSpacing: 5,
            marginBottom: 14,
          }}>
            ✦  将鼠标悬浮于星系之上  ✦
          </div>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 20, pointerEvents: 'auto',
        }}>
          {subjects.map(s => (
            <span
              key={s}
              style={{
                color: GALAXY_COLORS[s].accent, fontSize: 13, opacity: 0.3,
                cursor: 'pointer', transition: 'all 0.4s',
                letterSpacing: 2,
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid transparent',
              }}
              onClick={() => handleEnterSubject(s)}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.opacity = '0.8';
                (e.target as HTMLElement).style.borderColor = GALAXY_COLORS[s].glow;
                (e.target as HTMLElement).style.background = `${GALAXY_COLORS[s].glow.replace('0.6', '0.08')}`;
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.opacity = '0.3';
                (e.target as HTMLElement).style.borderColor = 'transparent';
                (e.target as HTMLElement).style.background = 'transparent';
              }}
            >
              {GALAXY_COLORS[s].accent === '#a5b4fc' ? '✦' : GALAXY_COLORS[s].accent === '#fde68a' ? '✦' : '✦'} {String(SUBJECT_LABELS[s])}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ 版本号 ═══ */}
      <div style={{
        position: 'absolute', bottom: '1.5%', right: '3%',
        color: 'rgba(255,255,255,0.04)', fontSize: 9, zIndex: 50,
        letterSpacing: 2, pointerEvents: 'none',
        animation: 'introFadeIn 3s ease-out 3s both',
      }}>
        KnowledgePower v0.1
      </div>
    </div>
  );
}
