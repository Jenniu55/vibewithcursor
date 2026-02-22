"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
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
}: {
  children: React.ReactNode;
  className?: string;
  draggingClassName?: string;
  title?: string;
  style?: React.CSSProperties;
  initialPosition: { x: number; y: number };
  centerOnMount?: boolean;
  horizontalLayout?: "left" | "center" | "right";
}) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const w = window.innerWidth;
    if (centerOnMount) {
      setPosition((prev) => ({ ...prev, x: w / 2 }));
    } else if (horizontalLayout) {
      const x = horizontalLayout === "left" ? w * 0.25 : horizontalLayout === "center" ? w * 0.5 : w * 0.75;
      setPosition((prev) => ({ ...prev, x, y: prev.y }));
    }
  }, [centerOnMount, horizontalLayout]);
  const startRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) return;
    if ((e.target as HTMLElement).closest("button, input")) return;
    startRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    setIsDragging(true);
  }, [position.x, position.y]);

  useEffect(() => {
    if (!isDragging) return;
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

  return (
    <div
      className={[className, isDragging && draggingClassName].filter(Boolean).join(" ")}
      title={title}
      style={{
        ...style,
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 10,
        transform: "translate(-50%, 0)",
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
}

// 22 white keys: C2 to C5 — letters a–v
const WHITE_KEYS = [
  "C2", "D2", "E2", "F2", "G2", "A2", "B2",
  "C3", "D3", "E3", "F3", "G3", "A3", "B3",
  "C4", "D4", "E4", "F4", "G4", "A4", "B4",
  "C5",
];

// White keys (left to right) = q w z x c v a s d f g h j k l o p b n m , .
const KEY_TO_NOTE: Record<string, string> = {
  // White keys — C2 to C5
  q: "C2", w: "D2", z: "E2", x: "F2", c: "G2", v: "A2", a: "B2",
  s: "C3", d: "D3", f: "E3", g: "F3", h: "G3", j: "A3", k: "B3",
  l: "C4", o: "D4", p: "E4", b: "F4", n: "G4", m: "A4", ",": "B4", ".": "C5",
  // Black keys — 1 2 3 4 5 6 7 8 9 0 - = [ ] \ (15 keys)
  "1": "C#2", "2": "D#2", "3": "F#2", "4": "G#2", "5": "A#2",
  "6": "C#3", "7": "D#3", "8": "F#3", "9": "G#3", "0": "A#3",
  "-": "C#4", "=": "D#4", "[": "F#4", "]": "G#4", "\\": "A#4",
};

const NOTE_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_TO_NOTE).map(([k, v]) => [v, k])
);

// One Summer's Day (Joe Hisaishi, Spirited Away) - melody notes
// Source: piano letter notation (pianoletternotes.blogspot.com) - transposed to fit piano (C3–E5)
// BPM ~76; durations: "8n"=eighth, "4n"=quarter, "2n"=half
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

// La Valse d'Amélie / Amelie (Yann Tiersen)
// Source: pianoletternotes.blogspot.com, MusicNotes - E minor, 3/4 waltz, transposed to fit piano (C3–E5), BPM ~100
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

// Für Elise (Beethoven) - famous opening motif
// Source: pianoletternotes.blogspot.com - transposed to fit piano (C3–E5)
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

// Black keys for C2–C5 range (15 keys) — centered in gap between white keys, offset right by half-key width (100/22/2 ≈ 2.27%)
const HALF_KEY_WIDTH = 100 / 22 / 2; // half of one white key's width
const BLACK_KEY_CONFIG: { note: string; left: number }[] = [
  { note: "C#2", left: 2.27 + HALF_KEY_WIDTH }, { note: "D#2", left: 6.82 + HALF_KEY_WIDTH }, { note: "F#2", left: 15.91 + HALF_KEY_WIDTH },
  { note: "G#2", left: 20.45 + HALF_KEY_WIDTH }, { note: "A#2", left: 25.00 + HALF_KEY_WIDTH },
  { note: "C#3", left: 34.09 + HALF_KEY_WIDTH }, { note: "D#3", left: 38.64 + HALF_KEY_WIDTH }, { note: "F#3", left: 47.73 + HALF_KEY_WIDTH },
  { note: "G#3", left: 52.27 + HALF_KEY_WIDTH }, { note: "A#3", left: 56.82 + HALF_KEY_WIDTH },
  { note: "C#4", left: 65.91 + HALF_KEY_WIDTH }, { note: "D#4", left: 70.45 + HALF_KEY_WIDTH }, { note: "F#4", left: 79.55 + HALF_KEY_WIDTH },
  { note: "G#4", left: 84.09 + HALF_KEY_WIDTH }, { note: "A#4", left: 88.64 + HALF_KEY_WIDTH },
];

type OscillatorType = "sine" | "triangle" | "square" | "sawtooth";

const WAVE_COLOR = "#7d9bb3";
const BG_COLOR = "#000000";
const GRID_COLOR = "rgba(200, 200, 200, 0.25)";

function drawWaveform(
  canvas: HTMLCanvasElement,
  values: number[],
  width: number,
  height: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

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

  const step = Math.max(1, Math.floor(values.length / w));
  ctx.beginPath();
  ctx.moveTo(padding, cy - (values[0] ?? 0) * (h / 2));

  for (let i = 1; i < values.length; i += step) {
    const x = padding + (i / values.length) * w;
    const v = values[i] ?? 0;
    const y = cy - v * (h / 2);
    ctx.lineTo(x, y);
  }

  const lastIdx = values.length - 1;
  const lastX = padding + (lastIdx / values.length) * w;
  const lastY = cy - (values[lastIdx] ?? 0) * (h / 2);
  ctx.lineTo(lastX, lastY);
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

    canvas.width = width;
    canvas.height = height;

    let animationId: number;

    const draw = () => {
      const analyser = analyserRef.current;
      let hasLiveData = false;
      let liveValues: number[] = [];

      if (analyser) {
        if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.fftSize) {
          dataArrayRef.current = new Float32Array(analyser.fftSize);
        }
        analyser.getFloatTimeDomainData(dataArrayRef.current as Float32Array<ArrayBuffer>);
        liveValues = Array.from(dataArrayRef.current);
        const rms = Math.sqrt(
          liveValues.reduce((s, v) => s + v * v, 0) / liveValues.length
        );
        hasLiveData = rms > 0.0005;
      }

      if (hasLiveData && liveValues.length > 0) {
        drawWaveform(canvas, liveValues, width, height);
      } else {
        const staticValues = getWaveformValues(oscillatorType, 400);
        drawWaveform(canvas, staticValues, width, height);
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
  const [attack, setAttack] = useState(0.01);
  const [volume, setVolume] = useState(1);
  const [delayAmount, setDelayAmount] = useState(0);
  const [filterCutoff, setFilterCutoff] = useState(1);
  const [chorusAmount, setChorusAmount] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<SongId | null>(null);
  const [hoveredSongId, setHoveredSongId] = useState<SongId | null>(null);
  const synthRef = useRef<InstanceType<ToneModule["PolySynth"]> | null>(null);
  const pianoRef = useRef<{
    keyDown: (o: { note: string; time?: number; velocity?: number }) => void;
    keyUp: (o: { note: string; time?: number }) => void;
    loaded: boolean;
    load: () => Promise<void>;
    stopAll: () => void;
    connect: (node: unknown) => void;
    dispose?: () => void;
  } | null>(null);
  const gainRef = useRef<InstanceType<ToneModule["Gain"]> | null>(null);
  const filterRef = useRef<InstanceType<ToneModule["Filter"]> | null>(null);
  const chorusRef = useRef<InstanceType<ToneModule["Chorus"]> | null>(null);
  const delayRef = useRef<InstanceType<ToneModule["FeedbackDelay"]> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const autoplayTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("tone").then((Tone) => {
      toneRef.current = Tone;
      setToneReady(true);
    });
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
      envelope: { attack, decay: 0.2, sustain: 0.5, release: 0.5 },
    });

    // Filter: lowpass. Square/sawtooth get a gentler max (3000Hz) to tame harsh overtones
    const maxFreq = oscillatorType === "square" || oscillatorType === "sawtooth" ? 2800 : 7800;
    const filterFreq = 200 + filterCutoff * maxFreq;
    filterRef.current = new Tone.Filter(filterFreq, "lowpass");
    gainRef.current = new Tone.Gain(volume);
    chorusRef.current = new Tone.Chorus(2, 2.5, 0.5).start();
    chorusRef.current.wet.setValueAtTime(chorusAmount, Tone.now());
    delayRef.current = new Tone.FeedbackDelay("8n", 0.4);
    delayRef.current.wet.setValueAtTime(delayAmount, Tone.now());

    synthRef.current.connect(filterRef.current);
    filterRef.current.connect(gainRef.current);
    gainRef.current.connect(chorusRef.current);
    chorusRef.current.connect(delayRef.current);
    delayRef.current.connect(analyser);
    analyser.connect(context.destination);

    return () => {
      analyser.disconnect();
      analyserRef.current = null;
      synthRef.current?.dispose();
      synthRef.current = null;
      pianoRef.current?.dispose?.();
      pianoRef.current = null;
      filterRef.current?.dispose();
      filterRef.current = null;
      gainRef.current?.dispose();
      gainRef.current = null;
      chorusRef.current?.dispose();
      chorusRef.current = null;
      delayRef.current?.dispose();
      delayRef.current = null;
    };
  }, [toneReady, oscillatorType, attack]);

  // Update effect params without rebuilding chain (avoids audio glitches)
  useEffect(() => {
    const maxFreq = oscillatorType === "square" || oscillatorType === "sawtooth" ? 2800 : 7800;
    const filterFreq = 200 + filterCutoff * maxFreq;
    filterRef.current?.frequency.setValueAtTime(filterFreq, toneRef.current?.now() ?? 0);
  }, [filterCutoff, oscillatorType]);

  useEffect(() => {
    chorusRef.current?.wet.setValueAtTime(chorusAmount, toneRef.current?.now() ?? 0);
  }, [chorusAmount]);

  useEffect(() => {
    delayRef.current?.wet.setValueAtTime(delayAmount, toneRef.current?.now() ?? 0);
  }, [delayAmount]);

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
    if (isAutoplaying) return;

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
        if (Tone) synthRef.current?.triggerAttackRelease(note, noteDurSec, Tone.now(), 0.7);
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
    pianoRef.current?.stopAll();
    synthRef.current?.releaseAll();
    setPressedKeys(new Set());
    setIsAutoplaying(false);
  }, []);

  if (!toneReady) {
    return (
      <div className={styles.container} style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
        <p style={{ color: "#666" }}>Loading piano…</p>
        <Link href="/" style={{ color: "#0066cc", textDecoration: "underline" }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton} aria-label="Back to home">
        ←
      </Link>

      <DraggableWindow
        className={styles.piano}
        initialPosition={{ x: 640, y: 480 }}
        centerOnMount
      >
        <div className={`${styles.topPanel} ${styles.dragHandle}`} data-drag-handle>
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
      </DraggableWindow>

      <div className={styles.pageTitleBlock} style={{ top: "405px" }}>
        <h2 className={styles.pageTitle}>My Digital Piano</h2>
        <p className={styles.hint}>
          Play with your mouse or keyboard. Adjust the settings and try the sample songs.
        </p>
      </div>

      <DraggableWindow
        className={`${styles.panel} ${styles.waveformControl}`}
        draggingClassName={styles.panelDragging}
        title="Drag me"
        initialPosition={{ x: 782, y: 15 }}
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
        initialPosition={{ x: 788, y: 171 }}
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
        initialPosition={{ x: 174, y: 86 }}
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
        initialPosition={{ x: 447, y: 21 }}
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
            />
          </label>
        </div>
        <div className={styles.settingsRow}>
          <label className={styles.settingsLabel}>
            Delay {(delayAmount * 100).toFixed(0)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={delayAmount}
              onChange={(e) => setDelayAmount(Number(e.target.value))}
              className={styles.settingsRange}
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
            />
          </label>
        </div>
      </DraggableWindow>
    </div>
  );
}
