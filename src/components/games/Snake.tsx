"use client";

import { useRef, useEffect, useState, useCallback } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type GameState = "idle" | "playing" | "gameover";
type Position = { x: number; y: number };

const GRID_SIZE = 15;
const INITIAL_TICK_MS = 200;
const MIN_TICK_MS = 80;
const SPEED_STEP = 8; // ms faster per food eaten

function randomFood(snake: Position[]): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------- game state stored in refs so the tick fn never goes stale ----------
  const snakeRef = useRef<Position[]>([{ x: 7, y: 7 }]);
  const dirRef = useRef<Direction>("RIGHT");
  const nextDirRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Position>({ x: 11, y: 7 });
  const scoreRef = useRef(0);
  const gameStateRef = useRef<GameState>("idle");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);

  // ---------- React state (only for UI re-renders) ----------
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");

  // Sync React state helper
  const syncUI = useCallback(() => {
    setScore(scoreRef.current);
    setGameState(gameStateRef.current);
  }, []);

  // ---------- drawing ----------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellW = canvas.width / GRID_SIZE;
    const cellH = canvas.height / GRID_SIZE;

    // background
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const x = Math.round(i * cellW) + 0.5;
      const y = Math.round(i * cellH) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // food
    const food = foodRef.current;
    const fx = food.x * cellW + cellW / 2;
    const fy = food.y * cellH + cellH / 2;
    const fr = Math.min(cellW, cellH) * 0.4;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();

    // snake
    const snake = snakeRef.current;
    const pad = 1;
    const radius = Math.min(cellW, cellH) * 0.25;

    snake.forEach((seg, i) => {
      const x = seg.x * cellW + pad;
      const y = seg.y * cellH + pad;
      const w = cellW - pad * 2;
      const h = cellH - pad * 2;

      // Head is slightly brighter
      ctx.fillStyle = i === 0 ? "#22c55e" : "#16a34a";
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    });
  }, []);

  // ---------- single game tick ----------
  const tick = useCallback(() => {
    if (gameStateRef.current !== "playing") return;

    const dir = nextDirRef.current;
    dirRef.current = dir;

    const snake = snakeRef.current;
    const head = { ...snake[0] };

    switch (dir) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    // wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameStateRef.current = "gameover";
      syncUI();
      draw();
      return;
    }

    // self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameStateRef.current = "gameover";
      syncUI();
      draw();
      return;
    }

    const newSnake = [head, ...snake];

    // food collision
    const food = foodRef.current;
    if (head.x === food.x && head.y === food.y) {
      scoreRef.current += 1;
      foodRef.current = randomFood(newSnake);
      // speed up
      if (tickRef.current) {
        clearInterval(tickRef.current);
        const newSpeed = Math.max(MIN_TICK_MS, INITIAL_TICK_MS - scoreRef.current * SPEED_STEP);
        tickRef.current = setInterval(tick, newSpeed);
      }
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    syncUI();
    draw();
  }, [draw, syncUI]);

  // ---------- start / restart ----------
  const startGame = useCallback(() => {
    // reset state
    snakeRef.current = [{ x: 7, y: 7 }];
    dirRef.current = "RIGHT";
    nextDirRef.current = "RIGHT";
    scoreRef.current = 0;
    foodRef.current = randomFood([{ x: 7, y: 7 }]);
    gameStateRef.current = "playing";
    syncUI();

    // clear any existing interval
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(tick, INITIAL_TICK_MS);

    draw();
  }, [tick, draw, syncUI]);

  // ---------- keyboard input ----------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (gameStateRef.current !== "playing") return;

      const cur = dirRef.current;

      switch (e.key) {
        case "ArrowUp":
          if (cur !== "DOWN") nextDirRef.current = "UP";
          break;
        case "ArrowDown":
          if (cur !== "UP") nextDirRef.current = "DOWN";
          break;
        case "ArrowLeft":
          if (cur !== "RIGHT") nextDirRef.current = "LEFT";
          break;
        case "ArrowRight":
          if (cur !== "LEFT") nextDirRef.current = "RIGHT";
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ---------- resize canvas to container ----------
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const isMobile = window.innerWidth < 640;
      const maxSize = isMobile ? 280 : 400;
      const size = Math.min(container.clientWidth, maxSize);
      canvas.width = size;
      canvas.height = size;
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  // ---------- cleanup interval on unmount ----------
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ---------- stop interval when game ends ----------
  useEffect(() => {
    if (gameState !== "playing" && tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, [gameState]);

  // ---------- initial draw for idle state ----------
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[280px] sm:max-w-[400px]">
        <p className="text-sm font-medium text-gray-500">
          Punkte: <span className="text-gray-700 font-semibold">{score}</span>
        </p>
        {gameState === "gameover" && (
          <p className="text-sm font-medium text-red-400">Game Over</p>
        )}
      </div>

      <div ref={containerRef} className="w-full max-w-[280px] sm:max-w-[400px]">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-gray-100"
          width={400}
          height={400}
        />
      </div>

      {gameState !== "playing" && (
        <button
          onClick={startGame}
          className="px-6 py-2 rounded-full bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
        >
          {gameState === "idle" ? "Spielen" : "Nochmal"}
        </button>
      )}

      {/* Mobile D-Pad */}
      {gameState === "playing" && (
        <div className="sm:hidden flex flex-col items-center gap-1 mt-2 select-none">
          <button
            onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== "DOWN") nextDirRef.current = "UP"; }}
            className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4L16 13H4L10 4Z" fill="#1d1d1f"/></svg>
          </button>
          <div className="flex gap-1">
            <button
              onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== "RIGHT") nextDirRef.current = "LEFT"; }}
              className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10L13 4V16L4 10Z" fill="#1d1d1f"/></svg>
            </button>
            <div className="w-14 h-14" />
            <button
              onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== "LEFT") nextDirRef.current = "RIGHT"; }}
              className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16 10L7 4V16L16 10Z" fill="#1d1d1f"/></svg>
            </button>
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== "UP") nextDirRef.current = "DOWN"; }}
            className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 16L4 7H16L10 16Z" fill="#1d1d1f"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
