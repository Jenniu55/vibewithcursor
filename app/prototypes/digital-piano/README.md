# Digital Piano Prototype

An interactive digital piano prototype with a light pastel blue design, inspired by The ONE keyboard. Each key plays a note using Tone.js synthesizers.

## Features

- **Multiple waveforms**: Sine, triangle, square, and sawtooth oscillator types
- **Unique sound per key**: Each of the 37 keys maps to its own note (C3–C6)
- **Visual feedback**: Keys glow red/pink when pressed
- **22 white keys + 15 black keys**: 3 octaves (C3–C6)

## Setup

Uses [Tone.js](https://tonejs.github.io/) for audio. Run `npm install` to install dependencies.

1. **Dev server**: `npm run dev` — then open the URL shown (e.g. `http://127.0.0.1:3000/prototypes/digital-piano`). Use the **exact port** reported—if 3000 is in use it may be 3001, 3002, etc.
2. **Production (if dev has issues)**: `npm run prod` — builds and runs in production mode, which avoids file watcher errors and is more reliable if you see HTTP 500 or 404.

### Troubleshooting

- **HTTP 500 or 404 on dev**: If you see "EMFILE: too many open files" in the terminal, the file watcher may be failing. Try:
  1. Stop all running dev servers (Ctrl+C)
  2. Run `rm -rf .next` to clear the cache
  3. Run `npm run prod` for a stable production server, or `npm run dev` again

## Usage

- Click or tap any key (black or white) to play its note
- Sound auto-enables on first key press (browser requirement)
- Works on both desktop (mouse) and touch devices
