/**
 * 🚀 动漫级宇宙场景 — Canvas 渲染引擎
 * 
 * 视觉参考：君の名は。/ 天気の子 / ヴァイオレット・エヴァーガーデン
 * 
 * 功能：
 * - 3D 景深星场（1500+ 星，4 层深度，鼠标视差）
 * - 星云（7 层彩色渐变云团，缓慢漂移）
 * - 极光（飘动透明彩色光幕）
 * - 流星（偶发拖尾）
 * - 光尘（悬浮微粒）
 * - 渐变晕影 + 色调映射
 * - 模拟泛光辉光
 */

// ─── 类型 ───

export interface SceneConfig {
  width: number;
  height: number;
  dpr: number;
  mouseX: number;
  mouseY: number;
  time: number;
  delta: number;
}

interface IStar {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: number; // 色相偏移：0=白, 0.1=暖黄, 0.6=蓝
}

interface INebula {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color1: string;
  color2: string;
  speedX: number;
  speedY: number;
  phase: number;
  opacity: number;
}

interface IAurora {
  points: { x: number; y: number }[];
  color: string;
  opacity: number;
  speed: number;
  phase: number;
  width: number;
}

interface IMote {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  phase: number;
}

interface IShootingStar {
  x: number;
  y: number;
  speed: number;
  angle: number;
  length: number;
  life: number;
  maxLife: number;
  active: boolean;
  trail: { x: number; y: number }[];
}

// ─── 配色：新海诚风格 ───

const PALETTE = {
  sky: ['#0a0520', '#0f0830', '#1a0a3a', '#0d0d2b'],
  nebula: [
    { c1: 'rgba(120, 80, 255,', c2: 'rgba(60, 30, 180,' },   // 紫蓝
    { c1: 'rgba(200, 100, 255,', c2: 'rgba(140, 50, 200,' },  // 紫粉
    { c1: 'rgba(255, 180, 50,', c2: 'rgba(200, 120, 20,' },   // 暖金
    { c1: 'rgba(50, 200, 255,', c2: 'rgba(20, 120, 200,' },   // 冰蓝
    { c1: 'rgba(255, 100, 150,', c2: 'rgba(200, 50, 100,' },  // 粉红
    { c1: 'rgba(100, 255, 180,', c2: 'rgba(50, 180, 120,' },  // 青绿
    { c1: 'rgba(180, 100, 255,', c2: 'rgba(100, 50, 200,' },  // 淡紫
  ],
  aurora: [
    { color: 'rgba(100, 200, 255,', opacity: 0.12 },
    { color: 'rgba(150, 80, 255,', opacity: 0.08 },
    { color: 'rgba(50, 255, 180,', opacity: 0.06 },
  ],
  glow: [
    { color: 'rgba(99, 102, 241,', opacity: 0.3 },    // 数学蓝
    { color: 'rgba(245, 158, 11,', opacity: 0.25 },   // 物理金
    { color: 'rgba(16, 185, 129,', opacity: 0.25 },   // 化学绿
  ],
};

// ─── 场景类 ───

export class SpaceScene {
  private ctx: CanvasRenderingContext2D;
  private stars: IStar[] = [];
  private nebula: INebula[] = [];
  private aurora: IAurora[] = [];
  private motes: IMote[] = [];
  private shootingStars: IShootingStar[] = [];
  private time = 0;
  private lastShootingStarTime = 0;
  private mouseX = 0.5;
  private mouseY = 0.5;
  private w = 0;
  private h = 0;
  private dpr = 1;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /** 初始化或重置大小 */
  init(width: number, height: number, dpr: number) {
    this.w = width;
    this.h = height;
    this.dpr = dpr;

    this.createStars();
    this.createNebula();
    this.createAurora();
    this.createMotes();
    this.createShootingStars();
  }

  /** 更新鼠标位置 */
  setMouse(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }

  // ─── 星场 (1500+ 星, 3D 深度) ───

  private createStars() {
    this.stars = [];
    const count = 1800;
    for (let i = 0; i < count; i++) {
      const z = Math.random() * 4 + 0.5; // 深度 0.5~4.5
      const r = Math.random();
      let hue = 0; // default white
      // ~15% 的星星有颜色
      if (r < 0.05) hue = 0.08; // 暖黄
      else if (r < 0.10) hue = 0.58; // 淡蓝
      else if (r < 0.13) hue = 0.02; // 橙红
      else if (r < 0.15) hue = 0.75; // 淡紫

      this.stars.push({
        x: (Math.random() - 0.5) * 2 * this.w * 1.5,
        y: (Math.random() - 0.5) * 2 * this.h * 1.5,
        z,
        size: (0.5 + Math.random() * 2.5) / z,
        brightness: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 0.5 + Math.random() * 3,
        twinklePhase: Math.random() * Math.PI * 2,
        hue,
      });
    }
  }

  private drawStars() {
    const ctx = this.ctx;
    const { w, h } = this;
    const parallaxX = (this.mouseX - 0.5) * 40;
    const parallaxY = (this.mouseY - 0.5) * 40;

    for (const star of this.stars) {
      // 3D 投影 + 视差（近的移动快）
      const depthFactor = 1 / star.z;
      const sx = w / 2 + (star.x + parallaxX * (1 / star.z) * 8) * depthFactor;
      const sy = h / 2 + (star.y + parallaxY * (1 / star.z) * 8) * depthFactor;

      // 超出屏幕的不画（性能）
      if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;

      // 闪烁
      const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
      const alpha = star.brightness * (0.4 + twinkle * 0.6);

      const size = star.size;

      if (star.hue === 0) {
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      } else {
        // 彩色星
        const c = this.hslToRgb(star.hue, 0.5, 0.7 + twinkle * 0.3);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
      }

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      // 大星星加辉光
      if (size > 1.8 && alpha > 0.6) {
        const glowSize = size * 4;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowSize);
        grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ─── 星云 (彩色渐变云团) ───

  private createNebula() {
    this.nebula = [];
    const positions = [
      { x: 0.15, y: 0.2 },
      { x: 0.85, y: 0.15 },
      { x: 0.5, y: 0.45 },
      { x: 0.2, y: 0.7 },
      { x: 0.75, y: 0.75 },
      { x: 0.4, y: 0.3 },
      { x: 0.6, y: 0.6 },
    ];

    for (let i = 0; i < PALETTE.nebula.length; i++) {
      const p = PALETTE.nebula[i];
      const pos = positions[i];
      this.nebula.push({
        x: pos.x,
        y: pos.y,
        radiusX: 0.2 + Math.random() * 0.25,
        radiusY: 0.15 + Math.random() * 0.2,
        color1: `${p.c1}${0.06 + Math.random() * 0.06})`,
        color2: `${p.c2}${0.03 + Math.random() * 0.04})`,
        speedX: (Math.random() - 0.5) * 0.008,
        speedY: (Math.random() - 0.5) * 0.008,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.5 + Math.random() * 0.5,
      });
    }
  }

  private drawNebula() {
    const ctx = this.ctx;
    const { w, h } = this;

    for (const n of this.nebula) {
      // 缓慢漂移
      const x = (n.x + Math.sin(this.time * n.speedX + n.phase) * 0.03) * w;
      const y = (n.y + Math.cos(this.time * n.speedY + n.phase) * 0.03) * h;
      const rx = n.radiusX * w * (0.8 + Math.sin(this.time * 0.3 + n.phase) * 0.2);
      const ry = n.radiusY * h * (0.8 + Math.cos(this.time * 0.2 + n.phase) * 0.2);

      // 外层大光晕
      const grad1 = ctx.createRadialGradient(x, y, 0, x, y, rx);
      grad1.addColorStop(0, n.color1);
      grad1.addColorStop(0.4, n.color2);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(x, y, rx, 0, Math.PI * 2);
      ctx.fill();

      // 内层小光晕（更亮）
      const grad2 = ctx.createRadialGradient(x, y, 0, x, y, rx * 0.4);
      grad2.addColorStop(0, n.color1.replace('0.06', '0.12'));
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(x, y, rx * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── 极光 ───

  private createAurora() {
    this.aurora = [];
    for (const a of PALETTE.aurora) {
      const pts: { x: number; y: number }[] = [];
      const count = 6;
      for (let i = 0; i <= count; i++) {
        pts.push({
          x: (i / count),
          y: 0.1 + Math.random() * 0.15,
        });
      }
      this.aurora.push({
        points: pts,
        color: a.color,
        opacity: a.opacity,
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        width: 0.03 + Math.random() * 0.04,
      });
    }
  }

  private drawAurora() {
    const ctx = this.ctx;
    const { w, h } = this;

    for (const a of this.aurora) {
      const points = a.points.map((p, i) => {
        const wave = Math.sin(this.time * a.speed + a.phase + i * 1.5) * 0.04;
        return {
          x: (p.x + wave) * w,
          y: p.y * h + Math.sin(this.time * a.speed * 0.7 + a.phase + i) * 15,
        };
      });

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      // 贝塞尔曲线通过所有点
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y + h * a.width);
      ctx.lineTo(points[0].x, points[points.length - 1].y + h * a.width);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, points[0].y, 0, points[0].y + h * a.width);
      grad.addColorStop(0, `${a.color}${a.opacity})`);
      grad.addColorStop(0.5, `${a.color}${a.opacity * 0.6})`);
      grad.addColorStop(1, `${a.color}0)`);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // ─── 光尘 ───

  private createMotes() {
    this.motes = [];
    for (let i = 0; i < 80; i++) {
      this.motes.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: 0.5 + Math.random() * 1.5,
        speedY: -0.1 - Math.random() * 0.3,
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: 0.05 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private drawMotes() {
    const ctx = this.ctx;
    const { w, h } = this;

    for (const m of this.motes) {
      // 浮动
      m.y += m.speedY;
      m.x += m.speedX + Math.sin(this.time * 0.5 + m.phase) * 0.2;
      m.opacity = (0.05 + Math.abs(Math.sin(this.time * 0.3 + m.phase)) * 0.08);

      // 回卷
      if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
      if (m.x < -10) m.x = w + 10;
      if (m.x > w + 10) m.x = -10;

      ctx.fillStyle = `rgba(200, 180, 255, ${m.opacity})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();

      // 微量辉光
      if (m.size > 1) {
        ctx.fillStyle = `rgba(200, 180, 255, ${m.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ─── 流星 ───

  private createShootingStars() {
    this.shootingStars = [];
    for (let i = 0; i < 3; i++) {
      this.shootingStars.push({
        x: 0,
        y: 0,
        speed: 8 + Math.random() * 5,
        angle: 30 + Math.random() * 25,
        length: 80 + Math.random() * 60,
        life: 0,
        maxLife: 60 + Math.random() * 30,
        active: false,
        trail: [],
      });
    }
    this.lastShootingStarTime = -60;
  }

  private drawShootingStars() {
    const ctx = this.ctx;
    const { w, h } = this;

    for (const s of this.shootingStars) {
      if (!s.active) {
        // 随机触发
        if (this.time - this.lastShootingStarTime > 10 + Math.random() * 15) {
          s.active = true;
          s.life = 0;
          s.x = 0.4 + Math.random() * 0.4 * w;
          s.y = 0.05 + Math.random() * 0.15 * h;
          s.speed = 12 + Math.random() * 8;
          s.length = 100 + Math.random() * 80;
          s.angle = 25 + Math.random() * 20;
          s.trail = [];
          this.lastShootingStarTime = this.time;
        }
        continue;
      }

      s.life++;
      const rad = s.angle * Math.PI / 180;
      const dx = Math.cos(rad) * s.speed;
      const dy = Math.sin(rad) * s.speed;
      s.x += dx;
      s.y += dy;

      // 轨迹
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > 15) s.trail.shift();

      // 绘制拖尾
      const progress = s.life / s.maxLife;
      const alpha = 1 - progress;

      if (s.trail.length > 1) {
        for (let i = 1; i < s.trail.length; i++) {
          const t = i / s.trail.length;
          const a = alpha * t * 0.5;
          const width = (i / s.trail.length) * 2;
          ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y);
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
          ctx.stroke();
        }
      }

      // 流星头（发光亮点）
      if (alpha > 0) {
        const headSize = 2.5 * alpha;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, headSize * 6);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        grad.addColorStop(0.2, `rgba(200, 220, 255, ${alpha * 0.4})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, headSize * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, headSize, 0, Math.PI * 2);
        ctx.fill();
      }

      if (s.life > s.maxLife || s.x > w * 1.5 || s.y > h * 1.5) {
        s.active = false;
      }
    }
  }

  // ─── 晕影 / 色调映射 ───

  private drawVignette() {
    const ctx = this.ctx;
    const { w, h } = this;

    // 渐变晕影
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    grad.addColorStop(0.8, 'rgba(5, 2, 20, 0.15)');
    grad.addColorStop(1, 'rgba(5, 2, 20, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  private drawAtmosphericGlow() {
    const ctx = this.ctx;
    const { w, h } = this;

    // 底部暖色辉光（模拟地平线光）
    const grad = ctx.createRadialGradient(w / 2, h * 1.1, 0, w / 2, h * 1.1, h * 0.8);
    grad.addColorStop(0, 'rgba(40, 20, 80, 0.08)');
    grad.addColorStop(0.5, 'rgba(20, 10, 40, 0.04)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // ─── 星系辉光（对应三个科目位置）───

  drawGalaxyGlows() {
    const ctx = this.ctx;
    const { w, h } = this;

    const positions = [
      { x: 0.15, y: 0.38 },  // math - 左
      { x: 0.5, y: 0.32 },   // physics - 中偏上
      { x: 0.85, y: 0.42 },  // chemistry - 右偏下
    ];

    PALETTE.glow.forEach((g, i) => {
      const p = positions[i];
      const px = p.x * w;
      const py = p.y * h;
      const r = Math.min(w, h) * 0.18;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
      grad.addColorStop(0, `${g.color}${g.opacity})`);
      grad.addColorStop(0.4, `${g.color}${g.opacity * 0.4})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ─── 主渲染循环 ───

  render(time: number) {
    const ctx = this.ctx;
    const { w, h } = this;

    // 清空
    ctx.clearRect(0, 0, w, h);

    // 背景色
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, h * 1.2);
    bgGrad.addColorStop(0, '#150838');
    bgGrad.addColorStop(0.3, '#0e0628');
    bgGrad.addColorStop(0.6, '#080418');
    bgGrad.addColorStop(1, '#03020a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    this.time = time;

    // 渲染顺序：后画的在上层
    this.drawNebula();
    this.drawAurora();
    this.drawStars();
    this.drawMotes();
    this.drawShootingStars();
    this.drawGalaxyGlows();
    this.drawAtmosphericGlow();
    this.drawVignette();
  }

  /** 窗口大小变化时重建 */
  resize(width: number, height: number) {
    this.w = width;
    this.h = height;
    this.createStars();
    this.createMotes();
  }

  // ─── 工具 ───

  private hslToRgb(h: number, s: number, l: number) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
}
