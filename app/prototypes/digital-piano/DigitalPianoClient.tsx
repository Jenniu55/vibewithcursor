"use client";

import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import styles from "./styles.module.css";

// Tone.js is loaded only in the browser to prevent HTTP 500 (it uses AudioContext, window, etc.)
type ToneModule = typeof import("tone");

// Draggable window wrapper — drag via [data-drag-handle] elements
function DraggableWindow({
  children,
  className,
  draggingClassName,
  title,
  style,
  initialPosition,
  centerOnMount,
  horizontalLayout,
  centerOffsetX,
  positionType = "fixed",
  centered,
  zIndex,
}: {
  children: React.ReactNode;
  className?: string;
  draggingClassName?: string;
  title?: string;
  style?: React.CSSProperties;
  initialPosition: { x: number; y: number };
  centerOnMount?: boolean;
  horizontalLayout?: "left" | "center" | "right";
  centerOffsetX?: number;
  positionType?: "fixed" | "absolute";
  centered?: boolean;
  zIndex?: number;
}) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const hasUserMovedRef = useRef(false);

  const updateCenterPosition = useCallback(() => {
    const w = window.innerWidth;
    if (centerOffsetX !== undefined) {
      setPosition((prev) => ({ ...prev, x: w / 2 + centerOffsetX }));
    }
  }, [centerOffsetX]);

  useEffect(() => {
    const w = window.innerWidth;
    if (centerOnMount) {
      setPosition((prev) => ({ ...prev, x: w / 2 }));
    } else if (horizontalLayout) {
      const x = horizontalLayout === "left" ? w * 0.25 : horizontalLayout === "center" ? w * 0.5 : w * 0.75;
      setPosition((prev) => ({ ...prev, x, y: prev.y }));
    } else if (centerOffsetX !== undefined) {
      updateCenterPosition();
    }
  }, [centerOnMount, horizontalLayout, centerOffsetX, updateCenterPosition]);

  useEffect(() => {
    if (centerOffsetX === undefined) return;
    const handler = () => updateCenterPosition();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [centerOffsetX, updateCenterPosition]);
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (hasUserMovedRef.current) return;
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest("button, input, select, a[href]")) return;
    startRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    setIsDragging(true);
  }, [position.x, position.y]);

  useEffect(() => {
    if (!isDragging) return;
    hasUserMovedRef.current = true;
    const onMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startRef.current.x,
        y: e.clientY - startRef.current.y,
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest("button, input, select, a[href]")) {
      setIsHovered(false);
    } else {
      setIsHovered(true);
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const positionStyles = centered
    ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
    : { left: position.x, top: position.y, transform: "translate(-50%, 0)" as const };

  const finalZIndex = zIndex ?? style?.zIndex ?? 10;

  return (
    <>
      <div
        className={[className, isDragging && draggingClassName].filter(Boolean).join(" ")}
        style={{
          ...style,
          position: positionType,
          ...positionStyles,
          zIndex: finalZIndex,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {!isDragging && isHovered && title && (
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 12,
            top: mousePos.y + 16,
            backgroundColor: "#24425B",
            color: "#ffffff",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 9999,
            fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          drag me
        </div>
      )}
    </>
  );
}

// 18 white keys: C3 to F5
const WHITE_KEYS = [
  "C3", "D3", "E3", "F3", "G3", "A3", "B3",
  "C4", "D4", "E4", "F4", "G4", "A4", "B4",
  "C5", "D5", "E5", "F5",
];

// White keys (left to right) = q w e r a s d f g h j k l ; u i o p
const KEY_TO_NOTE: Record<string, string> = {
  // White keys — C3 to F5
  q: "C3", w: "D3", e: "E3", r: "F3", a: "G3", s: "A3", d: "B3",
  f: "C4", g: "D4", h: "E4", j: "F4", k: "G4", l: "A4", ";": "B4",
  u: "C5", i: "D5", o: "E5", p: "F5",
  // Black keys
  "1": "C#3", "2": "D#3", "3": "F#3", "4": "G#3", "5": "A#3",
  "6": "C#4", "7": "D#4", "8": "F#4", "9": "G#4", "0": "A#4",
  "-": "C#5", "=": "D#5",
};

const NOTE_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_TO_NOTE).map(([k, v]) => [v, k])
);

// One Summer's Day (Joe Hisaishi, Spirited Away) - melody notes (original octave, fits C3–C6 keyboard)
// Source: piano letter notation (pianoletternotes.blogspot.com)
const ONE_SUMMER_DAY_MELODY: { note: string; duration: string }[] = [
  { note: "E4", duration: "8n" }, { note: "E4", duration: "8n" },
  { note: "E4", duration: "8n" }, { note: "D4", duration: "8n" }, { note: "E4", duration: "8n" },
  { note: "A4", duration: "8n" }, { note: "E4", duration: "8n" }, { note: "D4", duration: "8n" },
  { note: "D#4", duration: "8n" }, { note: "D4", duration: "8n" },
  { note: "D4", duration: "4n" }, { note: "D4", duration: "4n" }, { note: "D4", duration: "4n" }, { note: "D4", duration: "4n" },
  { note: "C4", duration: "8n" }, { note: "D4", duration: "8n" }, { note: "G4", duration: "8n" },
  { note: "D4", duration: "8n" }, { note: "C4", duration: "4n" },
  { note: "C4", duration: "4n" }, { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" },
  { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" },
  { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" },
  { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" }, { note: "C4", duration: "8n" },
  { note: "C4", duration: "8n" }, { note: "G4", duration: "4n" },
  { note: "C4", duration: "8n" }, { note: "D4", duration: "4n" },
  { note: "E4", duration: "4n" }, { note: "E4", duration: "4n" }, { note: "E4", duration: "4n" }, { note: "E4", duration: "8n" },
  { note: "D4", duration: "8n" }, { note: "E4", duration: "8n" }, { note: "A4", duration: "8n" }, { note: "E4", duration: "8n" },
  { note: "D4", duration: "8n" }, { note: "D#4", duration: "8n" }, { note: "D4", duration: "4n" },
  { note: "D4", duration: "8n" }, { note: "D4", duration: "8n" }, { note: "D4", duration: "8n" }, { note: "D4", duration: "8n" },
  { note: "C4", duration: "8n" }, { note: "D4", duration: "8n" }, { note: "G4", duration: "8n" },
  { note: "D4", duration: "8n" }, { note: "C4", duration: "4n" },
  { note: "C4", duration: "4n" }, { note: "C4", duration: "4n" }, { note: "C4", duration: "4n" }, { note: "C4", duration: "4n" },
  { note: "C4", duration: "4n" }, { note: "C4", duration: "4n" }, { note: "C4", duration: "4n" }, { note: "C4", duration: "4n" },
  { note: "C4", duration: "4n" }, { note: "G4", duration: "8n" }, { note: "F4", duration: "8n" }, { note: "D#4", duration: "8n" },
  { note: "E4", duration: "4n" },
  { note: "F4", duration: "4n" }, { note: "G4", duration: "4n" }, { note: "G4", duration: "4n" }, { note: "G4", duration: "4n" },
  { note: "F4", duration: "8n" }, { note: "E4", duration: "8n" }, { note: "D4", duration: "8n" }, { note: "D4", duration: "8n" },
  { note: "E4", duration: "8n" }, { note: "C4", duration: "4n" }, { note: "C4", duration: "4n" },
  { note: "E4", duration: "8n" }, { note: "F4", duration: "8n" }, { note: "D4", duration: "8n" }, { note: "C4", duration: "8n" },
  { note: "D4", duration: "8n" }, { note: "E4", duration: "4n" },
  { note: "C4", duration: "4n" },
  { note: "C5", duration: "8n" }, { note: "C5", duration: "8n" }, { note: "D5", duration: "8n" }, { note: "C5", duration: "4n" },
  { note: "A4", duration: "4n" }, { note: "G4", duration: "4n" }, { note: "F4", duration: "4n" },
  { note: "G4", duration: "8n" }, { note: "A4", duration: "4n" }, { note: "E4", duration: "8n" }, { note: "A4", duration: "8n" },
  { note: "G4", duration: "4n" }, { note: "G#4", duration: "8n" },
  { note: "C5", duration: "8n" }, { note: "C5", duration: "8n" }, { note: "D5", duration: "8n" }, { note: "C5", duration: "4n" },
  { note: "G4", duration: "4n" }, { note: "A4", duration: "8n" }, { note: "A#4", duration: "8n" },
  { note: "E4", duration: "8n" }, { note: "G4", duration: "8n" }, { note: "A4", duration: "8n" }, { note: "A4", duration: "8n" },
  { note: "G4", duration: "8n" }, { note: "F4", duration: "8n" }, { note: "G4", duration: "8n" },
  { note: "A4", duration: "4n" },
  { note: "E4", duration: "8n" }, { note: "E4", duration: "8n" }, { note: "D4", duration: "8n" }, { note: "D4", duration: "8n" },
  { note: "C4", duration: "8n" }, { note: "D4", duration: "8n" },
  { note: "E4", duration: "4n" },
  { note: "G4", duration: "4n" }, { note: "A4", duration: "4n" },
  { note: "G4", duration: "8n" },
  { note: "C5", duration: "4n" }, { note: "D5", duration: "8n" },
  { note: "C5", duration: "2n" },
];

// La Valse d'Amélie / Amelie (Yann Tiersen) - original octave, fits C3–C6 keyboard
const AMELIE_MELODY: { note: string; duration: string }[] = [
  { note: "E4", duration: "8n" }, { note: "B4", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "G4", duration: "8n" },
  { note: "B4", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "G4", duration: "8n" }, { note: "B4", duration: "8n" },
  { note: "E4", duration: "8n" }, { note: "B4", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "G4", duration: "8n" },
  { note: "B4", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "G4", duration: "8n" }, { note: "B4", duration: "4n" },
  { note: "F#4", duration: "8n" }, { note: "C#5", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "A4", duration: "8n" },
  { note: "C#5", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "A4", duration: "8n" }, { note: "C#5", duration: "8n" },
  { note: "E4", duration: "8n" }, { note: "B4", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "G4", duration: "8n" },
  { note: "B4", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "G4", duration: "8n" }, { note: "B4", duration: "2n" },
];

// Für Elise (Beethoven) - famous opening motif, original octave, fits C3–C6 keyboard
const FUR_ELISE_MELODY: { note: string; duration: string }[] = [
  { note: "E5", duration: "8n" }, { note: "D#5", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "D#5", duration: "8n" },
  { note: "E5", duration: "8n" }, { note: "B4", duration: "8n" }, { note: "D5", duration: "8n" }, { note: "C5", duration: "8n" },
  { note: "A4", duration: "4n" },
  { note: "C4", duration: "8n" }, { note: "E4", duration: "8n" }, { note: "A4", duration: "8n" }, { note: "B4", duration: "8n" },
  { note: "E4", duration: "8n" }, { note: "G#4", duration: "8n" }, { note: "B4", duration: "8n" }, { note: "C5", duration: "4n" },
  { note: "E5", duration: "8n" }, { note: "D#5", duration: "8n" }, { note: "E5", duration: "8n" }, { note: "D#5", duration: "8n" },
  { note: "E5", duration: "8n" }, { note: "B4", duration: "8n" }, { note: "D5", duration: "8n" }, { note: "C5", duration: "8n" },
  { note: "A4", duration: "4n" },
  { note: "C4", duration: "8n" }, { note: "E4", duration: "8n" }, { note: "A4", duration: "8n" }, { note: "B4", duration: "8n" },
  { note: "E4", duration: "8n" }, { note: "C5", duration: "8n" }, { note: "B4", duration: "8n" }, { note: "A4", duration: "2n" },
];

type SongId = "one-summers-day" | "amelie" | "fur-elise";

const SONGS: { id: SongId; title: string; composer: string; source: string; melody: { note: string; duration: string }[]; bpm: number }[] = [
  { id: "one-summers-day", title: "One Summer's Day", composer: "Joe Hisaishi", source: "Spirited Away", melody: ONE_SUMMER_DAY_MELODY, bpm: 76 },
  { id: "amelie", title: "Amelie", composer: "Yann Tiersen", source: "Amélie", melody: AMELIE_MELODY, bpm: 100 },
  { id: "fur-elise", title: "Für Elise", composer: "Ludwig van Beethoven", source: "Bagatelle No. 25", melody: FUR_ELISE_MELODY, bpm: 92 },
];

// Note duration in seconds: quarter=1 beat, eighth=0.5 beats, half=2 beats
function getDurationSec(bpm: number): Record<string, number> {
  const beatSec = 60 / bpm;
  return {
    "8n": beatSec * 0.5,
    "4n": beatSec * 1,
    "2n": beatSec * 2,
  };
}

// Black keys for C3–F5 range (12 keys)
const BLACK_KEY_CONFIG: { note: string; left: number }[] = [
  { note: "C#3", left: (100 / 18) * 1 }, { note: "D#3", left: (100 / 18) * 2 }, { note: "F#3", left: (100 / 18) * 4 },
  { note: "G#3", left: (100 / 18) * 5 }, { note: "A#3", left: (100 / 18) * 6 },
  { note: "C#4", left: (100 / 18) * 8 }, { note: "D#4", left: (100 / 18) * 9 }, { note: "F#4", left: (100 / 18) * 11 },
  { note: "G#4", left: (100 / 18) * 12 }, { note: "A#4", left: (100 / 18) * 13 },
  { note: "C#5", left: (100 / 18) * 15 }, { note: "D#5", left: (100 / 18) * 16 },
];

type OscillatorType = "sine" | "triangle" | "square" | "sawtooth";

const WAVE_COLOR = "#7d9bb3";
const BG_COLOR = "#ffffff";
const GRID_COLOR = "rgba(0, 0, 0, 0.06)";

function drawWaveform(
  canvas: HTMLCanvasElement,
  values: ArrayLike<number>,
  width: number,
  height: number,
  dpr: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Render in CSS pixels while backing store uses device pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const padding = 24;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const cy = padding + h / 2;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;

  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding + (h / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  const vertLines = 8;
  for (let i = 0; i <= vertLines; i++) {
    const x = padding + (w / vertLines) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  }

  if (values.length < 2) return;

  ctx.strokeStyle = WAVE_COLOR;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  for (let px = 0; px <= w; px++) {
    const t = w === 0 ? 0 : px / w;
    const idx = t * (values.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(values.length - 1, i0 + 1);
    const frac = idx - i0;
    const v0 = values[i0] ?? 0;
    const v1 = values[i1] ?? v0;
    const v = v0 * (1 - frac) + v1 * frac;

    const x = padding + px;
    const y = cy - v * (h / 2);
    if (px === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
}

function getWaveformValues(type: OscillatorType, sampleCount: number): number[] {
  const values: number[] = [];
  const cycles = 3;

  for (let i = 0; i < sampleCount; i++) {
    const t = i / sampleCount;
    const phase = t * cycles * 2 * Math.PI;

    let v: number;
    switch (type) {
      case "sine":
        v = Math.sin(phase);
        break;
      case "triangle": {
        const tt = (phase / (2 * Math.PI)) % 1;
        v = 1 - 2 * Math.abs(2 * tt - 1);
        break;
      }
      case "square":
        v = Math.sin(phase) >= 0 ? 1 : -1;
        break;
      case "sawtooth":
        v = 2 * ((phase / (2 * Math.PI)) % 1) - 1;
        break;
      default:
        v = 0;
    }
    values.push(v);
  }
  return values;
}

function WaveformVisualization({
  analyserRef,
  oscillatorType,
}: {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  oscillatorType: OscillatorType;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 360;
  const height = 120;
  const dataArrayRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    // Keep layout size stable while rendering at device resolution.
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    let animationId: number;

    const draw = () => {
      const analyser = analyserRef.current;
      let hasLiveData = false;
      let liveValues: Float32Array | null = null;

      if (analyser) {
        if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.fftSize) {
          dataArrayRef.current = new Float32Array(analyser.fftSize);
        }
        analyser.getFloatTimeDomainData(dataArrayRef.current as Float32Array<ArrayBuffer>);
        liveValues = dataArrayRef.current;
        let sumSq = 0;
        for (let i = 0; i < liveValues.length; i++) {
          const v = liveValues[i] ?? 0;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / liveValues.length);
        hasLiveData = rms > 0.0005;
      }

      if (hasLiveData && liveValues && liveValues.length > 0) {
        drawWaveform(canvas, liveValues, width, height, dpr);
      } else {
        const staticValues = getWaveformValues(oscillatorType, 2048);
        drawWaveform(canvas, staticValues, width, height, dpr);
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationId);
  }, [oscillatorType]);

  return (
    <div>
      <h3 className={`${styles.waveformVizTitle} ${styles.dragHandle}`} data-drag-handle>
        Waveform
      </h3>
      <canvas
        ref={canvasRef}
        className={styles.waveformCanvas}
        width={width}
        height={height}
        aria-label="Real-time waveform visualization"
      />
    </div>
  );
}

export default function DigitalPianoClient() {
  const [toneReady, setToneReady] = useState(false);
  const toneRef = useRef<ToneModule | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("triangle");
  const [attack, setAttack] = useState(0.02);
  const [volume, setVolume] = useState(1);
  const [reverbAmount, setReverbAmount] = useState(0);
  const [filterCutoff, setFilterCutoff] = useState(1);
  const [chorusAmount, setChorusAmount] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<SongId | null>(null);
  const [hoveredSongId, setHoveredSongId] = useState<SongId | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const synthRef = useRef<InstanceType<ToneModule["PolySynth"]> | null>(null);
  const gainRef = useRef<InstanceType<ToneModule["Gain"]> | null>(null);
  const filterRef = useRef<InstanceType<ToneModule["Filter"]> | null>(null);
  const chorusRef = useRef<InstanceType<ToneModule["Chorus"]> | null>(null);
  const reverbRef = useRef<InstanceType<ToneModule["Freeverb"]> | null>(null);
  const limiterRef = useRef<InstanceType<ToneModule["Limiter"]> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const autoplayTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pageTitleRef = useRef<HTMLDivElement | null>(null);
  const [pianoTop, setPianoTop] = useState(167);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1024 : window.innerWidth
  );

  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Default layout (matches the browser-tuned layout)
  const pianoWidth = Math.max(640, Math.min(viewportWidth * 0.95, 960)) + 40;
  const PIANO_HEIGHT = 351;
  const BELOW_SPACING = 35;

  const AUTOPLAY_WIDTH = 280;
  const SETTINGS_WIDTH = 242;
  const WAVEFORM_CONTROL_WIDTH = 407;

  const gap =
    (pianoWidth - AUTOPLAY_WIDTH - SETTINGS_WIDTH - WAVEFORM_CONTROL_WIDTH) / 2;
  const stackGap = 35;

  const pianoCenterX = viewportWidth / 2;
  const pianoLeft = pianoCenterX - pianoWidth / 2;
  const autoplayLeft = pianoLeft;
  const settingsLeft = autoplayLeft + AUTOPLAY_WIDTH + gap;
  const waveformControlLeft = settingsLeft + SETTINGS_WIDTH + gap;
  const panelRowTop = pianoTop + PIANO_HEIGHT + BELOW_SPACING;
  const WAVEFORM_CONTROL_HEIGHT = 120;
  const waveformVisualizationTop = panelRowTop + WAVEFORM_CONTROL_HEIGHT + stackGap;

  useLayoutEffect(() => {
    const el = pageTitleRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setPianoTop(rect.bottom + 40);
    };
    update();
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) setToneReady(true);
    }, 8000);
    import("tone")
      .then((Tone) => {
        if (!cancelled) {
          toneRef.current = Tone;
          setToneReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setToneReady(true);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const Tone = toneRef.current;
    if (!Tone || !toneReady) return;
    const context = Tone.getContext().rawContext;
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.98;
    analyserRef.current = analyser;

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: oscillatorType },
      envelope: { attack, decay: 0.2, sustain: 0.5, release: 0.2 },
    });
    synthRef.current.maxPolyphony = 10;

    // Filter: lowpass. Aggressive rolloff to reduce noise (sine/triangle 3800Hz max, square/sawtooth 2200Hz max).
    const maxFreq = oscillatorType === "square" || oscillatorType === "sawtooth" ? 2200 : 3800;
    const filterFreq = 200 + filterCutoff * maxFreq;
    filterRef.current = new Tone.Filter(filterFreq, "lowpass");
    filterRef.current.Q.value = 0.3;
    gainRef.current = new Tone.Gain(volume);
    chorusRef.current = new Tone.Chorus(2, 2.5, 0.5).start();
    chorusRef.current.wet.setValueAtTime(chorusAmount, Tone.now());
    reverbRef.current = new Tone.Freeverb({ roomSize: 0.5, dampening: 12000 });
    reverbRef.current.wet.setValueAtTime(reverbAmount, Tone.now());
    const limiter = new Tone.Limiter(-1);
    limiterRef.current = limiter;

    synthRef.current.connect(filterRef.current);
    filterRef.current.connect(gainRef.current);
    gainRef.current.connect(chorusRef.current);
    chorusRef.current.connect(reverbRef.current);
    reverbRef.current.connect(limiter);
    limiter.connect(analyser);
    analyser.connect(context.destination);

    return () => {
      analyser.disconnect();
      analyserRef.current = null;
      synthRef.current?.dispose();
      synthRef.current = null;
      filterRef.current?.dispose();
      filterRef.current = null;
      gainRef.current?.dispose();
      gainRef.current = null;
      chorusRef.current?.dispose();
      chorusRef.current = null;
      reverbRef.current?.dispose();
      reverbRef.current = null;
      limiterRef.current?.dispose();
      limiterRef.current = null;
    };
  }, [toneReady, oscillatorType, attack]);

  // Update effect params without rebuilding chain (avoids audio glitches)
  useEffect(() => {
    const maxFreq = oscillatorType === "square" || oscillatorType === "sawtooth" ? 2200 : 3800;
    const filterFreq = 200 + filterCutoff * maxFreq;
    filterRef.current?.frequency.setValueAtTime(filterFreq, toneRef.current?.now() ?? 0);
  }, [filterCutoff, oscillatorType]);

  useEffect(() => {
    chorusRef.current?.wet.setValueAtTime(chorusAmount, toneRef.current?.now() ?? 0);
  }, [chorusAmount]);

  useEffect(() => {
    reverbRef.current?.wet.setValueAtTime(reverbAmount, toneRef.current?.now() ?? 0);
  }, [reverbAmount]);

  useEffect(() => {
    const Tone = toneRef.current;
    if (Tone) gainRef.current?.gain.setValueAtTime(volume, Tone.now());
  }, [volume]);

  const unlockAudio = useCallback(async () => {
    if (audioUnlocked) return;
    const Tone = toneRef.current;
    if (!Tone) return;
    try {
      await Tone.start();
      setAudioUnlocked(true);
    } catch (e) {
      console.warn("Could not start audio:", e);
    }
  }, [audioUnlocked]);

  const keyDown = useCallback(
    async (note: string) => {
      await unlockAudio();
      setPressedKeys((prev) => new Set(prev).add(note));
      synthRef.current?.triggerAttack(note, undefined, 0.7);
    },
    [unlockAudio]
  );

  const keyUp = useCallback((note: string) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    synthRef.current?.triggerRelease(note);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const note = KEY_TO_NOTE[key];
      if (note) {
        e.preventDefault();
        keyDown(note);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const note = KEY_TO_NOTE[key];
      if (note) {
        e.preventDefault();
        keyUp(note);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyDown, keyUp]);

  const handleKeyDown = useCallback(
    (note: string, e?: React.MouseEvent | React.TouchEvent) => {
      e?.preventDefault?.();
      keyDown(note);
    },
    [keyDown]
  );

  const handleKeyUp = useCallback((note: string) => keyUp(note), [keyUp]);

  const playAutoplay = useCallback(async (songId?: SongId) => {
    await unlockAudio();
    if (isAutoplaying && songId == null) return;

    // Wait for synth to be ready (useEffect runs after mount)
    let synth = synthRef.current;
    if (!synth) {
      await new Promise((r) => setTimeout(r, 100));
      synth = synthRef.current;
    }
    if (!synth) return;

    const song = SONGS.find((s) => s.id === (songId ?? selectedSongId ?? "one-summers-day")) ?? SONGS[0];
    const durationSec = getDurationSec(song.bpm);

    setIsAutoplaying(true);
    autoplayTimeoutsRef.current = [];

    let delayMs = 0;
    for (const { note, duration } of song.melody) {
      const durSec = durationSec[duration] ?? durationSec["4n"];
      const noteDurSec = durSec * 0.9;
      const t = delayMs;
      const id = setTimeout(() => {
        const Tone = toneRef.current;
        setPressedKeys((prev) => new Set(prev).add(note));
        if (Tone) synthRef.current?.triggerAttackRelease(note, noteDurSec, Tone.now(), 0.65);
        const releaseId = setTimeout(() => {
          setPressedKeys((prev) => {
            const next = new Set(prev);
            next.delete(note);
            return next;
          });
        }, noteDurSec * 1000);
        autoplayTimeoutsRef.current.push(releaseId);
      }, t);
      autoplayTimeoutsRef.current.push(id);
      delayMs += durSec * 1000;
    }
    const endId = setTimeout(() => {
      setPressedKeys(new Set());
      setIsAutoplaying(false);
      autoplayTimeoutsRef.current = [];
    }, delayMs);
    autoplayTimeoutsRef.current.push(endId);
  }, [unlockAudio, isAutoplaying, selectedSongId]);

  const stopAutoplay = useCallback(() => {
    autoplayTimeoutsRef.current.forEach((id) => clearTimeout(id));
    autoplayTimeoutsRef.current = [];
    synthRef.current?.releaseAll();
    setPressedKeys(new Set());
    setIsAutoplaying(false);
  }, []);

  if (!toneReady) {
    return (
      <div className={styles.container} style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
        <p style={{ color: "#666" }}>Loading piano…</p>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ backgroundColor: "rgba(227, 236, 242, 0.9)" }}>
      <button
        type="button"
        className={styles.helpToggle}
        onClick={() => setHelpOpen((o) => !o)}
        aria-label={helpOpen ? "Close help" : "Open help"}
        aria-expanded={helpOpen}
      >
        <span className={styles.helpToggleIcon} aria-hidden>+</span>
      </button>

      {helpOpen && (
        <div className={styles.helpOverlay} onClick={() => setHelpOpen(false)} role="dialog" aria-modal="true" aria-label="How to play">
          <div className={styles.helpPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.helpText}>
              <h2 className={styles.helpTldr}>Inspired by my childhood piano memories</h2>
              <p>
                Some of my earliest childhood memories begin with a piano.
                <br /><br />
                The wonderful feeling of pressing a key and hearing a note bloom into the air, the purest form of joy coming from the tips of my fingers. Music has always felt like a private language to me. While a physical piano has its limits, I made one that can live on a screen, ready whenever my inspiration strikes.
                <br /><br />
                Thank you for being part of this memory with me today. Have fun playing!
                <br /><br />
                Designed and built by{" "}
                <a
                  href="https://www.linkedin.com/in/jencz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.helpSignatureLink}
                >
                  Jen Zhang
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <div ref={pageTitleRef} className={styles.pageTitleBlock}>
        <h2 className={styles.pageTitle}>
          Digital Piano by{" "}
          <a
            href="https://www.linkedin.com/in/jencz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.pageTitleLink}
          >
            Jen
          </a>
        </h2>
        <p className={styles.hint}>
          Play with your mouse or keyboard. Adjust the settings and try the sample songs.
          {" "}
          <span className={styles.hintDrag}>
            <img
              src="/move.png"
              alt=""
              width={14}
              height={14}
              className={styles.hintDragIcon}
              aria-hidden
            />
            Drag to move panels around.
          </span>
        </p>
      </div>

      <DraggableWindow
        className={`${styles.panel} ${styles.waveformControl}`}
        draggingClassName={styles.panelDragging}
        title="Drag me"
        initialPosition={{
          x: waveformControlLeft + WAVEFORM_CONTROL_WIDTH / 2,
          y: panelRowTop,
        }}
        zIndex={15}
      >
        <h3 className={`${styles.waveformTitle} ${styles.dragHandle}`} data-drag-handle>Oscillator Type</h3>
        <div className={styles.waveformOptions}>
          {(["sine", "triangle", "square", "sawtooth"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.waveformButton} ${oscillatorType === type ? styles.waveformButtonActive : ""}`}
              onClick={() => setOscillatorType(type)}
              aria-pressed={oscillatorType === type}
            >
              <span className={styles.waveformButtonLabel}>{type}</span>
              <span className={styles.waveformButtonDesc}>
                {type === "sine" && "soft"}
                {type === "triangle" && "mellow"}
                {type === "square" && "hollow"}
                {type === "sawtooth" && "bright"}
              </span>
            </button>
          ))}
        </div>
      </DraggableWindow>

      <DraggableWindow
        className={`${styles.panel} ${styles.waveformVisualization}`}
        draggingClassName={styles.panelDragging}
        title="Drag me"
        initialPosition={{
          x: waveformControlLeft + WAVEFORM_CONTROL_WIDTH / 2,
          y: waveformVisualizationTop,
        }}
        zIndex={15}
      >
        <WaveformVisualization
          analyserRef={analyserRef}
          oscillatorType={oscillatorType}
        />
      </DraggableWindow>

      <DraggableWindow
        className={`${styles.panel} ${styles.autoplayPanel}`}
        draggingClassName={styles.panelDragging}
        title="Drag me"
        initialPosition={{
          x: autoplayLeft + AUTOPLAY_WIDTH / 2,
          y: panelRowTop,
        }}
        zIndex={15}
      >
        <h3 className={`${styles.settingsTitle} ${styles.dragHandle}`} data-drag-handle>
          Sample Songs
        </h3>
        <div className={styles.songList}>
          {SONGS.map((song) => {
            const isSelected = selectedSongId === song.id;
            const isHovered = hoveredSongId === song.id;
            const isThisPlaying = isSelected && isAutoplaying;
            const showIcon = isSelected || isHovered;
            return (
              <button
                key={song.id}
                type="button"
                className={`${styles.autoplaySongCard} ${isSelected ? styles.songCardSelected : ""}`}
                onMouseEnter={() => setHoveredSongId(song.id)}
                onMouseLeave={() => setHoveredSongId(null)}
                onClick={() => {
                  if (isSelected) {
                    if (isAutoplaying) stopAutoplay();
                    else playAutoplay(song.id);
                  } else {
                    stopAutoplay();
                    setSelectedSongId(song.id);
                    playAutoplay(song.id);
                  }
                }}
                aria-label={isThisPlaying ? `Stop ${song.title}` : `Play ${song.title} by ${song.composer}`}
                aria-pressed={isSelected}
              >
                <span className={styles.autoplaySongLabel}>{song.title}</span>
                <span className={styles.autoplaySongDescWrapper}>
                  <span className={styles.autoplaySongCardIconSlot} aria-hidden>
                    <img
                      src={isThisPlaying ? "/stop.svg" : "/play_arrow.svg"}
                      alt=""
                      width={16}
                      height={16}
                      className={`${styles.autoplaySongCardIcon} ${!showIcon ? styles.autoplaySongCardIconHidden : ""}`}
                    />
                  </span>
                  <span className={styles.autoplaySongDesc}>
                    {isThisPlaying ? (
                      <span className={styles.autoplaySongDescTrack}>
                        <span className={styles.autoplaySongDescInner}>{song.composer} · {song.source}</span>
                        <span className={styles.autoplaySongDescInner} aria-hidden>{song.composer} · {song.source}</span>
                      </span>
                    ) : (
                      <span className={styles.autoplaySongDescInner}>{song.composer} · {song.source}</span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </DraggableWindow>

      <DraggableWindow
        className={`${styles.panel} ${styles.settings}`}
        draggingClassName={styles.panelDragging}
        title="Drag me"
        initialPosition={{
          x: settingsLeft + SETTINGS_WIDTH / 2,
          y: panelRowTop,
        }}
        zIndex={15}
      >
        <h3 className={`${styles.settingsTitle} ${styles.dragHandle}`} data-drag-handle>Sound Control</h3>
        <div className={styles.settingsRow}>
          <label className={styles.settingsLabel}>
            Volume {(volume * 100).toFixed(0)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={styles.settingsRange}
              style={{ '--val': volume } as React.CSSProperties}
            />
          </label>
        </div>
        <div className={styles.settingsRow}>
          <label className={styles.settingsLabel}>
            Attack {(attack * 1000).toFixed(0)}ms
            <input
              type="range"
              min="0.001"
              max="0.5"
              step="0.005"
              value={attack}
              onChange={(e) => setAttack(Number(e.target.value))}
              className={styles.settingsRange}
              style={{ '--val': attack / 0.5 } as React.CSSProperties}
            />
          </label>
        </div>
        <div className={styles.settingsRow}>
          <label className={styles.settingsLabel}>
            Filter (brightness) {(filterCutoff * 100).toFixed(0)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={filterCutoff}
              onChange={(e) => setFilterCutoff(Number(e.target.value))}
              className={styles.settingsRange}
              style={{ '--val': filterCutoff } as React.CSSProperties}
            />
          </label>
        </div>
        <div className={styles.settingsRow}>
          <label className={styles.settingsLabel}>
            Reverb {(reverbAmount * 100).toFixed(0)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={reverbAmount}
              onChange={(e) => setReverbAmount(Number(e.target.value))}
              className={styles.settingsRange}
              style={{ '--val': reverbAmount } as React.CSSProperties}
            />
          </label>
        </div>
        <div className={styles.settingsRow}>
          <label className={styles.settingsLabel}>
            Chorus {(chorusAmount * 100).toFixed(0)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={chorusAmount}
              onChange={(e) => setChorusAmount(Number(e.target.value))}
              className={styles.settingsRange}
              style={{ '--val': chorusAmount } as React.CSSProperties}
            />
          </label>
        </div>
      </DraggableWindow>

      <DraggableWindow
        initialPosition={{ x: pianoCenterX, y: pianoTop }}
        className={styles.pianoWrapper}
        draggingClassName={styles.pianoDragging}
        title="Drag to move piano"
        style={{ zIndex: 10 }}
      >
        <div className={styles.piano} style={{ margin: 0 }}>
          <div className={`${styles.topPanel} ${styles.dragHandle}`} data-drag-handle aria-label="Drag to move piano">
          <div className={styles.speakerGrille} aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={styles.grilleRow}>
                {Array.from({ length: 24 }, (_, j) => (
                  <span key={j} className={styles.grilleHole} />
                ))}
              </div>
            ))}
          </div>

          <div className={styles.controlArea}>
            <div className={styles.controls}>
              <div className={styles.smallButton} aria-hidden="true" />
              <div className={styles.smallButtonWhite} aria-hidden="true" />
              <div className={styles.knob} aria-hidden="true" />
            </div>
          </div>

          <div className={styles.speakerGrille} aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={styles.grilleRow}>
                {Array.from({ length: 24 }, (_, j) => (
                  <span key={j} className={styles.grilleHole} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={styles.keybed}
          onClick={() => !audioUnlocked && unlockAudio()}
        >
          {!audioUnlocked && (
            <div className={styles.soundOverlay} aria-hidden="true">
              Click to enable sound
            </div>
          )}
          <div className={styles.whiteKeys} style={{ zIndex: 0 }}>
            {WHITE_KEYS.map((note) => (
              <button
                key={note}
                type="button"
                className={`${styles.whiteKey} ${pressedKeys.has(note) ? styles.pressed : ""}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKeyDown(note, e);
                }}
                onMouseUp={() => handleKeyUp(note)}
                onMouseLeave={() => handleKeyUp(note)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleKeyDown(note, e);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleKeyUp(note);
                }}
                aria-label={`Play ${note} (${NOTE_TO_KEY[note] ?? ""})`}
              >
                {NOTE_TO_KEY[note] && (
                  <span className={styles.keyLabel}>{NOTE_TO_KEY[note]}</span>
                )}
              </button>
            ))}
          </div>
          <div className={styles.blackKeys} style={{ zIndex: 1 }}>
            {BLACK_KEY_CONFIG.map(({ note, left }) => (
              <button
                key={note}
                type="button"
                className={`${styles.blackKey} ${pressedKeys.has(note) ? styles.pressed : ""}`}
                style={{ left: `${left}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKeyDown(note, e);
                }}
                onMouseUp={() => handleKeyUp(note)}
                onMouseLeave={() => handleKeyUp(note)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleKeyDown(note, e);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleKeyUp(note);
                }}
                aria-label={`Play ${note} (${NOTE_TO_KEY[note] ?? ""})`}
              >
                {NOTE_TO_KEY[note] && (
                  <span className={styles.keyLabelBlack}>{NOTE_TO_KEY[note]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        </div>
      </DraggableWindow>
    </div>
  );
}
