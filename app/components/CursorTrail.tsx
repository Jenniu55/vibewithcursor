'use client';

import { useEffect, useRef, useCallback } from 'react';

const SPAWN_INTERVAL_MS = 80;
const FADE_DURATION_MS = 800;
const SPARKLE_SIZE = 48;

export default function CursorTrail() {
  const lastSpawnRef = useRef(0);

  const addSparkle = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastSpawnRef.current < SPAWN_INTERVAL_MS) return;

    lastSpawnRef.current = now;

    const el = document.createElement('div');
    el.className = 'cursor-trail-sparkle';
    const posX = x - SPARKLE_SIZE / 2;
    const posY = y - SPARKLE_SIZE / 2;

    el.style.cssText = `
      position: fixed;
      left: ${posX}px;
      top: ${posY}px;
      width: ${SPARKLE_SIZE}px;
      height: ${SPARKLE_SIZE}px;
      pointer-events: none;
      z-index: 9999;
      background: url(/playground/sparkles.gif) center/contain no-repeat;
      mix-blend-mode: screen;
      animation: cursorTrailFade 0.8s ease-out forwards;
    `;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), FADE_DURATION_MS);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      addSparkle(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [addSparkle]);

  return null;
}
