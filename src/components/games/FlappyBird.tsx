"use client";

import { useRef, useEffect, useState, useCallback } from "react";

type GameStatus = "idle" | "playing" | "gameover";

interface Pipe {
  x: number;
  gapY: number;
  scored: boolean;
}

interface GameState {
  birdY: number;
  birdVelocity: number;
  pipes: Pipe[];
  score: number;
  status: GameStatus;
  frameId: number;
  lastPipeSpawn: number;
  time: number;
}

const CANVAS_W = 400;
const CANVAS_H = 600;

const BIRD_X = 80;
const BIRD_RADIUS = 16;

const GRAVITY = 0.45;
const FLAP_STRENGTH = -7.5;
const MAX_VELOCITY = 10;

const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 2.5;
const PIPE_SPAWN_INTERVAL = 1500;

const GROUND_HEIGHT = 60;
const SKY_COLOR = "#E8F4FD";
const GROUND_COLOR = "#FFFFFF";
const PIPE_COLOR = "#34C759";
const BIRD_COLOR = "#FFCC00";
const BIRD_OUTLINE = "#E6A800";

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>({
    birdY: CANVAS_H / 2,
    birdVelocity: 0,
    pipes: [],
    score: 0,
    status: "idle",
    frameId: 0,
    lastPipeSpawn: 0,
    time: 0,
  });

  const [displayScore, setDisplayScore] = useState(0);
  const [displayStatus, setDisplayStatus] = useState<GameStatus>("idle");

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.birdY = CANVAS_H / 2;
    g.birdVelocity = 0;
    g.pipes = [];
    g.score = 0;
    g.status = "idle";
    g.lastPipeSpawn = 0;
    g.time = 0;
    setDisplayScore(0);
    setDisplayStatus("idle");
  }, []);

  const flap = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "idle") {
      g.status = "playing";
      g.birdVelocity = FLAP_STRENGTH;
      g.time = performance.now();
      g.lastPipeSpawn = g.time;
      setDisplayStatus("playing");
    } else if (g.status === "playing") {
      g.birdVelocity = FLAP_STRENGTH;
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "gameover") {
      resetGame();
    } else {
      flap();
    }
  }, [flap, resetGame]);

  // Draw a single frame
  const draw = useCallback((ctx: CanvasRenderingContext2D, g: GameState) => {
    const w = CANVAS_W;
    const h = CANVAS_H;

    // Sky
    ctx.fillStyle = SKY_COLOR;
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = GROUND_COLOR;
    ctx.fillRect(0, h - GROUND_HEIGHT, w, GROUND_HEIGHT);
    // Ground line
    ctx.strokeStyle = "#D1D5DB";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h - GROUND_HEIGHT);
    ctx.lineTo(w, h - GROUND_HEIGHT);
    ctx.stroke();

    // Pipes
    for (const pipe of g.pipes) {
      // Pipe cap dimensions
      const capOverhang = 4;
      const capHeight = 24;

      // Top pipe body
      ctx.fillStyle = PIPE_COLOR;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY - PIPE_GAP / 2);
      // Top pipe cap
      const topPipeBottom = pipe.gapY - PIPE_GAP / 2;
      ctx.fillStyle = "#2DB84D";
      ctx.beginPath();
      roundRect(
        ctx,
        pipe.x - capOverhang,
        topPipeBottom - capHeight,
        PIPE_WIDTH + capOverhang * 2,
        capHeight,
        4
      );
      ctx.fill();

      // Bottom pipe body
      const bottomPipeTop = pipe.gapY + PIPE_GAP / 2;
      ctx.fillStyle = PIPE_COLOR;
      ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, h - GROUND_HEIGHT - bottomPipeTop);
      // Bottom pipe cap
      ctx.fillStyle = "#2DB84D";
      ctx.beginPath();
      roundRect(
        ctx,
        pipe.x - capOverhang,
        bottomPipeTop,
        PIPE_WIDTH + capOverhang * 2,
        capHeight,
        4
      );
      ctx.fill();
    }

    // Bird
    ctx.save();
    ctx.translate(BIRD_X, g.birdY);

    // Rotation based on velocity: nose up when flapping, nose down when falling
    const rotation = Math.min(Math.max(g.birdVelocity * 0.06, -0.5), Math.PI / 4);
    ctx.rotate(rotation);

    // Body
    ctx.fillStyle = BIRD_COLOR;
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_RADIUS, BIRD_RADIUS * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = BIRD_OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye (white)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(7, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "#1A1A1A";
    ctx.beginPath();
    ctx.arc(9, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#FF8C00";
    ctx.beginPath();
    ctx.moveTo(BIRD_RADIUS - 2, -2);
    ctx.lineTo(BIRD_RADIUS + 10, 2);
    ctx.lineTo(BIRD_RADIUS - 2, 5);
    ctx.closePath();
    ctx.fill();

    // Wing
    ctx.fillStyle = BIRD_OUTLINE;
    ctx.beginPath();
    ctx.ellipse(-4, 4, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Score (during playing and gameover)
    if (g.status === "playing" || g.status === "gameover") {
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 3;
      ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.strokeText(String(g.score), w / 2, 40);
      ctx.fillText(String(g.score), w / 2, 40);
    }

    // Idle overlay
    if (g.status === "idle") {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Tippe oder druecke Space", w / 2, h / 2 + 80);
    }

    // Game over overlay
    if (g.status === "gameover") {
      // Semi-transparent overlay
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 3;
      ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText("Game Over", w / 2, h / 2 - 20);
      ctx.fillText("Game Over", w / 2, h / 2 - 20);

      ctx.font = "500 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.strokeText(`Punkte: ${g.score}`, w / 2, h / 2 + 25);
      ctx.fillText(`Punkte: ${g.score}`, w / 2, h / 2 + 25);
    }
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let prevTime = performance.now();

    const loop = (now: number) => {
      if (!running) return;

      const dt = Math.min(now - prevTime, 32); // cap delta to ~30fps min
      prevTime = now;

      const g = gameRef.current;

      if (g.status === "playing") {
        g.time = now;

        // Bird physics
        g.birdVelocity += GRAVITY;
        if (g.birdVelocity > MAX_VELOCITY) g.birdVelocity = MAX_VELOCITY;
        g.birdY += g.birdVelocity;

        // Spawn pipes
        if (now - g.lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
          const minGapY = PIPE_GAP / 2 + 40;
          const maxGapY = CANVAS_H - GROUND_HEIGHT - PIPE_GAP / 2 - 40;
          const gapY = minGapY + Math.random() * (maxGapY - minGapY);
          g.pipes.push({ x: CANVAS_W + 10, gapY, scored: false });
          g.lastPipeSpawn = now;
        }

        // Move pipes
        const speed = PIPE_SPEED * (dt / 16.67); // normalize to ~60fps
        for (let i = g.pipes.length - 1; i >= 0; i--) {
          g.pipes[i].x -= speed;

          // Score check
          if (!g.pipes[i].scored && g.pipes[i].x + PIPE_WIDTH < BIRD_X) {
            g.pipes[i].scored = true;
            g.score++;
            setDisplayScore(g.score);
          }

          // Remove off-screen pipes
          if (g.pipes[i].x + PIPE_WIDTH < -10) {
            g.pipes.splice(i, 1);
          }
        }

        // Collision detection
        const birdTop = g.birdY - BIRD_RADIUS * 0.85;
        const birdBottom = g.birdY + BIRD_RADIUS * 0.85;
        const birdLeft = BIRD_X - BIRD_RADIUS;
        const birdRight = BIRD_X + BIRD_RADIUS;

        // Ground/ceiling
        if (birdBottom >= CANVAS_H - GROUND_HEIGHT || birdTop <= 0) {
          g.status = "gameover";
          g.birdY = Math.max(
            BIRD_RADIUS,
            Math.min(g.birdY, CANVAS_H - GROUND_HEIGHT - BIRD_RADIUS)
          );
          setDisplayStatus("gameover");
        }

        // Pipes
        for (const pipe of g.pipes) {
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;
          const gapTop = pipe.gapY - PIPE_GAP / 2;
          const gapBottom = pipe.gapY + PIPE_GAP / 2;

          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < gapTop || birdBottom > gapBottom) {
              g.status = "gameover";
              setDisplayStatus("gameover");
              break;
            }
          }
        }
      } else if (g.status === "idle") {
        // Gentle floating animation
        g.birdY = CANVAS_H / 2 + Math.sin(now / 400) * 12;
      }

      draw(ctx, g);
      g.frameId = requestAnimationFrame(loop);
    };

    gameRef.current.frameId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(gameRef.current.frameId);
    };
  }, [draw]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        const g = gameRef.current;
        if (g.status === "gameover") {
          resetGame();
        } else {
          flap();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flap, resetGame]);

  // Canvas click handler
  const handleCanvasClick = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "gameover") return;
    flap();
  }, [flap]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-2xl overflow-hidden shadow-lg"
        style={{ width: CANVAS_W, maxWidth: "100%" }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={handleCanvasClick}
          className="block cursor-pointer"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <button
        onClick={handleButtonClick}
        className="px-6 py-2 rounded-full bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
      >
        {displayStatus === "gameover" ? "Nochmal" : "Spielen"}
      </button>
    </div>
  );
}

// Helper: draw a rounded rectangle path
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}
