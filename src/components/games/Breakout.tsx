"use client";

import { useRef, useEffect, useState, useCallback } from "react";

type GameState = "idle" | "playing" | "gameover" | "won";

// ---------- constants ----------
const CANVAS_W = 480;
const CANVAS_H = 600;

const PADDLE_W = 80;
const PADDLE_H = 12;
const PADDLE_Y = CANVAS_H - 36;
const PADDLE_RADIUS = PADDLE_H / 2;

const BALL_R = 10;
const BALL_INITIAL_SPEED = 5;
const BALL_SPEED_INCREMENT = 0.4;

const BRICK_COLS = 8;
const BRICK_ROWS = 5;
const BRICK_GAP = 4;
const BRICK_TOP_OFFSET = 60;
const BRICK_W = (CANVAS_W - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;
const BRICK_H = 22;

const ROW_COLORS = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#5AC8FA"];

const LIVES_TOTAL = 3;

// ---------- types ----------
interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  alive: boolean;
}

function createBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_GAP + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP_OFFSET + r * (BRICK_H + BRICK_GAP),
        w: BRICK_W,
        h: BRICK_H,
        color: ROW_COLORS[r],
        alive: true,
      });
    }
  }
  return bricks;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------- game state stored in refs (for animation loop) ----------
  const ballRef = useRef({ x: CANVAS_W / 2, y: PADDLE_Y - BALL_R - 2 });
  const ballVelRef = useRef({ dx: 0, dy: 0 });
  const paddleXRef = useRef(CANVAS_W / 2 - PADDLE_W / 2);
  const bricksRef = useRef<Brick[]>(createBricks());
  const scoreRef = useRef(0);
  const livesRef = useRef(LIVES_TOTAL);
  const levelRef = useRef(1);
  const gameStateRef = useRef<GameState>("idle");
  const rafRef = useRef<number | null>(null);

  // ---------- React state (only for UI re-renders) ----------
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES_TOTAL);
  const [gameState, setGameState] = useState<GameState>("idle");

  const syncUI = useCallback(() => {
    setScore(scoreRef.current);
    setLives(livesRef.current);
    setGameState(gameStateRef.current);
  }, []);

  // ---------- reset helpers ----------
  const resetBall = useCallback(() => {
    const speed =
      BALL_INITIAL_SPEED + (levelRef.current - 1) * BALL_SPEED_INCREMENT;
    ballRef.current = { x: CANVAS_W / 2, y: PADDLE_Y - BALL_R - 2 };
    // Launch at a slight random angle
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 3);
    ballVelRef.current = {
      dx: speed * Math.cos(angle),
      dy: speed * Math.sin(angle),
    };
  }, []);

  const resetGame = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = LIVES_TOTAL;
    levelRef.current = 1;
    bricksRef.current = createBricks();
    paddleXRef.current = CANVAS_W / 2 - PADDLE_W / 2;
    resetBall();
    syncUI();
  }, [resetBall, syncUI]);

  // ---------- drawing ----------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1d1d1f";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Bricks
    for (const brick of bricksRef.current) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.color;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
      ctx.fill();
    }

    // Paddle
    const px = paddleXRef.current;
    ctx.fillStyle = "#f5f5f7";
    ctx.beginPath();
    ctx.roundRect(px, PADDLE_Y, PADDLE_W, PADDLE_H, PADDLE_RADIUS);
    ctx.fill();

    // Ball
    const ball = ballRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    // Idle / game-over / won overlay
    const state = gameStateRef.current;
    if (state === "idle" || state === "gameover" || state === "won") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = "#f5f5f7";
      ctx.font = "600 28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";

      if (state === "idle") {
        ctx.fillText("Breakout", CANVAS_W / 2, CANVAS_H / 2 - 20);
        ctx.font = "400 16px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "#a1a1a6";
        ctx.fillText(
          "Klicke auf Spielen um zu starten",
          CANVAS_W / 2,
          CANVAS_H / 2 + 16
        );
      } else if (state === "gameover") {
        ctx.fillText("Game Over", CANVAS_W / 2, CANVAS_H / 2 - 20);
        ctx.font = "400 16px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "#a1a1a6";
        ctx.fillText(
          `Punkte: ${scoreRef.current}`,
          CANVAS_W / 2,
          CANVAS_H / 2 + 16
        );
      } else if (state === "won") {
        ctx.fillText("Gewonnen!", CANVAS_W / 2, CANVAS_H / 2 - 20);
        ctx.font = "400 16px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "#a1a1a6";
        ctx.fillText(
          `Punkte: ${scoreRef.current}`,
          CANVAS_W / 2,
          CANVAS_H / 2 + 16
        );
      }
    }
  }, []);

  // ---------- physics / game loop ----------
  const update = useCallback(() => {
    if (gameStateRef.current !== "playing") return;

    const ball = ballRef.current;
    const vel = ballVelRef.current;

    // Move ball
    ball.x += vel.dx;
    ball.y += vel.dy;

    // Wall bounces (left / right)
    if (ball.x - BALL_R <= 0) {
      ball.x = BALL_R;
      vel.dx = Math.abs(vel.dx);
    } else if (ball.x + BALL_R >= CANVAS_W) {
      ball.x = CANVAS_W - BALL_R;
      vel.dx = -Math.abs(vel.dx);
    }

    // Ceiling bounce
    if (ball.y - BALL_R <= 0) {
      ball.y = BALL_R;
      vel.dy = Math.abs(vel.dy);
    }

    // Paddle collision
    const px = paddleXRef.current;
    if (
      vel.dy > 0 &&
      ball.y + BALL_R >= PADDLE_Y &&
      ball.y + BALL_R <= PADDLE_Y + PADDLE_H + vel.dy &&
      ball.x >= px - BALL_R &&
      ball.x <= px + PADDLE_W + BALL_R
    ) {
      ball.y = PADDLE_Y - BALL_R;

      // Angle based on hit position: center = straight up, edges = angled
      const hitPos = (ball.x - px) / PADDLE_W; // 0..1
      const angle = -Math.PI / 2 + (hitPos - 0.5) * (Math.PI * 0.7);
      const speed = Math.sqrt(vel.dx * vel.dx + vel.dy * vel.dy);
      vel.dx = speed * Math.cos(angle);
      vel.dy = speed * Math.sin(angle);

      // Safety: ensure ball always moves upward after paddle hit
      if (vel.dy > 0) vel.dy = -vel.dy;
    }

    // Ball falls below paddle
    if (ball.y - BALL_R > CANVAS_H) {
      livesRef.current -= 1;
      if (livesRef.current <= 0) {
        gameStateRef.current = "gameover";
        syncUI();
        return;
      }
      resetBall();
      syncUI();
      return;
    }

    // Brick collision
    let allDestroyed = true;
    for (const brick of bricksRef.current) {
      if (!brick.alive) continue;
      allDestroyed = false;

      // AABB collision between ball circle and brick rect
      const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
      const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
      const distX = ball.x - closestX;
      const distY = ball.y - closestY;

      if (distX * distX + distY * distY <= BALL_R * BALL_R) {
        brick.alive = false;
        scoreRef.current += 10;

        // Determine bounce direction
        const overlapLeft = ball.x + BALL_R - brick.x;
        const overlapRight = brick.x + brick.w - (ball.x - BALL_R);
        const overlapTop = ball.y + BALL_R - brick.y;
        const overlapBottom = brick.y + brick.h - (ball.y - BALL_R);

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX < minOverlapY) {
          vel.dx = -vel.dx;
        } else {
          vel.dy = -vel.dy;
        }

        syncUI();
        break; // Only one brick per frame
      }
    }

    // Check if all bricks are destroyed (level complete)
    if (allDestroyed || bricksRef.current.every((b) => !b.alive)) {
      levelRef.current += 1;
      bricksRef.current = createBricks();
      resetBall();
      syncUI();
    }
  }, [resetBall, syncUI]);

  // ---------- animation loop ----------
  const loop = useCallback(() => {
    update();
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    // Initial draw
    draw();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [loop, draw]);

  // ---------- mouse / touch tracking ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasX = (clientX: number): number => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      return (clientX - rect.left) * scaleX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (gameStateRef.current !== "playing") return;
      const x = getCanvasX(e.clientX);
      paddleXRef.current = Math.max(
        0,
        Math.min(CANVAS_W - PADDLE_W, x - PADDLE_W / 2)
      );
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameStateRef.current !== "playing") return;
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const x = getCanvasX(touch.clientX);
      paddleXRef.current = Math.max(
        0,
        Math.min(CANVAS_W - PADDLE_W, x - PADDLE_W / 2)
      );
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // ---------- start / restart ----------
  const handleStart = useCallback(() => {
    resetGame();
    gameStateRef.current = "playing";
    syncUI();
  }, [resetGame, syncUI]);

  const buttonLabel =
    gameState === "idle" ? "Spielen" : "Nochmal";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score and lives */}
      <div className="flex items-center justify-between w-full max-w-[480px] px-1">
        <span className="text-sm text-gray-400 font-medium">
          Punkte: {score}
        </span>
        <span className="text-sm text-gray-400 font-medium">
          Leben: {"●".repeat(lives)}
          {"○".repeat(Math.max(0, LIVES_TOTAL - lives))}
        </span>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="w-full max-w-[480px] relative"
        style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-full rounded-xl"
          style={{ display: "block" }}
        />
      </div>

      {/* Start / restart button */}
      {gameState !== "playing" && (
        <button
          onClick={handleStart}
          className="px-6 py-2 rounded-full bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
