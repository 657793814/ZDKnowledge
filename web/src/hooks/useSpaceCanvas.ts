/**
 * useSpaceCanvas — 管理 Canvas 动画生命周期
 */
import { useRef, useEffect, useCallback } from 'react';
import { SpaceScene } from '@/utils/spaceScene';

export function useSpaceCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onReady?: () => void
) {
  const sceneRef = useRef<SpaceScene | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const setMouse = useCallback((x: number, y: number) => {
    mouseRef.current = { x, y };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      if (!sceneRef.current) {
        sceneRef.current = new SpaceScene(ctx);
        sceneRef.current.init(w, h, dpr);
        onReady?.();
      } else {
        sceneRef.current.resize(w, h);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let startTime = performance.now();
    const animate = (now: number) => {
      const time = (now - startTime) / 1000;
      const scene = sceneRef.current;
      if (scene) {
        scene.setMouse(mouseRef.current.x, mouseRef.current.y);
        scene.render(time);
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, onReady]);

  return { setMouse };
}
