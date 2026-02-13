"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// --- Constants ---
const COLS = 10;
const ROWS = 20;
const CELL = 28;
const BOARD_W = COLS * CELL;
const BOARD_H = ROWS * CELL;
const PREVIEW_CELLS = 4;
const PREVIEW_CELL = 18;
const PREVIEW_SIZE = PREVIEW_CELLS * PREVIEW_CELL;

// --- Tetromino Definitions ---
type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

const COLORS: Record<PieceType, string> = {
  I: "#5AC8FA",
  O: "#FFCC00",
  T: "#AF52DE",
  S: "#34C759",
  Z: "#FF3B30",
  J: "#007AFF",
  L: "#FF9500",
};

// Each piece has 4 rotation states, each an array of [row, col] offsets
const SHAPES: Record<PieceType, number[][][]> = {
  I: [
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 1], [1, 1], [2, 1], [3, 1]],
  ],
  O: [
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
  ],
  T: [
    [[0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 1]],
  ],
  S: [
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[1, 1], [1, 2], [2, 0], [2, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
  ],
  Z: [
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 2], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
  ],
  J: [
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 0], [2, 1]],
  ],
  L: [
    [[0, 2], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [1, 2], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
  ],
};

// Wall kick offsets: tested in order when a rotation fails
// Standard SRS wall kicks for J, L, S, T, Z
const WALL_KICKS_JLSTZ: Record<string, number[][]> = {
  "0>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "1>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "2>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "3>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
};

// Wall kicks for I piece
const WALL_KICKS_I: Record<string, number[][]> = {
  "0>1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "1>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  "2>3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "3>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
};

const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

// --- Helpers ---
interface Piece {
  type: PieceType;
  rotation: number;
  row: number;
  col: number;
}

type Board = (PieceType | null)[][];

function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function getShape(type: PieceType, rotation: number): number[][] {
  return SHAPES[type][rotation];
}

function randomPiece(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

function isValid(board: Board, type: PieceType, rotation: number, row: number, col: number): boolean {
  const shape = getShape(type, rotation);
  for (const [dr, dc] of shape) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    if (board[r][c] !== null) return false;
  }
  return true;
}

function tryRotate(
  board: Board,
  piece: Piece,
  newRotation: number
): { row: number; col: number; rotation: number } | null {
  const kickTable = piece.type === "I" ? WALL_KICKS_I : WALL_KICKS_JLSTZ;
  const key = `${piece.rotation}>${newRotation}`;
  const kicks = kickTable[key];
  if (!kicks) {
    // Fallback: just try the rotation in place
    if (isValid(board, piece.type, newRotation, piece.row, piece.col)) {
      return { row: piece.row, col: piece.col, rotation: newRotation };
    }
    return null;
  }
  for (const [dx, dy] of kicks) {
    const newCol = piece.col + dx;
    const newRow = piece.row - dy; // SRS convention: positive y = up, but our rows go down
    if (isValid(board, piece.type, newRotation, newRow, newCol)) {
      return { row: newRow, col: newCol, rotation: newRotation };
    }
  }
  return null;
}

function lockPiece(board: Board, piece: Piece): Board {
  const newBoard = board.map((row) => [...row]);
  const shape = getShape(piece.type, piece.rotation);
  for (const [dr, dc] of shape) {
    const r = piece.row + dr;
    const c = piece.col + dc;
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      newBoard[r][c] = piece.type;
    }
  }
  return newBoard;
}

function clearLines(board: Board): { board: Board; linesCleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = ROWS - remaining.length;
  const emptyRows: Board = Array.from({ length: linesCleared }, () =>
    Array(COLS).fill(null)
  );
  return { board: [...emptyRows, ...remaining], linesCleared };
}

function getGhostRow(board: Board, piece: Piece): number {
  let ghostRow = piece.row;
  while (isValid(board, piece.type, piece.rotation, ghostRow + 1, piece.col)) {
    ghostRow++;
  }
  return ghostRow;
}

function spawnPiece(type: PieceType): Piece {
  return { type, rotation: 0, row: 0, col: 3 };
}

function scoreForLines(lines: number): number {
  switch (lines) {
    case 1: return 100;
    case 2: return 200;
    case 3: return 400;
    case 4: return 800;
    default: return 0;
  }
}

function levelSpeed(level: number): number {
  // Milliseconds per drop, decreasing with level
  return Math.max(100, 800 - (level - 1) * 70);
}

// --- Drawing helpers ---
function drawCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  color: string,
  cellSize: number,
  alpha: number = 1
) {
  ctx.globalAlpha = alpha;
  const x = col * cellSize;
  const y = row * cellSize;
  const inset = 1;

  // Fill
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2, 3);
  ctx.fill();

  // Subtle highlight on top-left
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(x + inset + 1, y + inset + 1, cellSize - inset * 2 - 2, 2);

  // Subtle shadow on bottom
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x + inset + 1, y + cellSize - inset - 3, cellSize - inset * 2 - 2, 2);

  ctx.globalAlpha = 1;
}

function drawBoard(ctx: CanvasRenderingContext2D, board: Board) {
  // Background
  ctx.fillStyle = "#FAFAFA";
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);

  // Grid lines (very subtle)
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 1;
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL + 0.5);
    ctx.lineTo(BOARD_W, r * CELL + 0.5);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL + 0.5, 0);
    ctx.lineTo(c * CELL + 0.5, BOARD_H);
    ctx.stroke();
  }

  // Locked cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell) {
        drawCell(ctx, c, r, COLORS[cell], CELL);
      }
    }
  }
}

function drawPiece(
  ctx: CanvasRenderingContext2D,
  piece: Piece,
  cellSize: number,
  offsetRow: number = 0,
  offsetCol: number = 0,
  alpha: number = 1
) {
  const shape = getShape(piece.type, piece.rotation);
  for (const [dr, dc] of shape) {
    drawCell(ctx, offsetCol + piece.col + dc, offsetRow + piece.row + dr, COLORS[piece.type], cellSize, alpha);
  }
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  piece: Piece,
  ghostRow: number
) {
  const shape = getShape(piece.type, piece.rotation);
  for (const [dr, dc] of shape) {
    drawCell(ctx, piece.col + dc, ghostRow + dr, COLORS[piece.type], CELL, 0.18);
  }
}

function drawPreview(ctx: CanvasRenderingContext2D, type: PieceType) {
  ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

  // Background
  ctx.fillStyle = "#FAFAFA";
  ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

  const shape = getShape(type, 0);
  // Compute bounding box for centering
  let minR = 4, maxR = 0, minC = 4, maxC = 0;
  for (const [dr, dc] of shape) {
    minR = Math.min(minR, dr);
    maxR = Math.max(maxR, dr);
    minC = Math.min(minC, dc);
    maxC = Math.max(maxC, dc);
  }
  const pieceW = maxC - minC + 1;
  const pieceH = maxR - minR + 1;
  const offsetC = (PREVIEW_CELLS - pieceW) / 2 - minC;
  const offsetR = (PREVIEW_CELLS - pieceH) / 2 - minR;

  for (const [dr, dc] of shape) {
    drawCell(ctx, dc + offsetC, dr + offsetR, COLORS[type], PREVIEW_CELL);
  }
}

// --- Game State Interface ---
interface GameState {
  board: Board;
  current: Piece;
  next: PieceType;
  score: number;
  level: number;
  lines: number;
  status: "idle" | "playing" | "gameover";
  lastDrop: number;
}

// --- Component ---
export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "gameover">("idle");

  // Initialize a new game
  const initGame = useCallback((): GameState => {
    const firstPiece = randomPiece();
    const nextPiece = randomPiece();
    return {
      board: createBoard(),
      current: spawnPiece(firstPiece),
      next: nextPiece,
      score: 0,
      level: 1,
      lines: 0,
      status: "playing",
      lastDrop: performance.now(),
    };
  }, []);

  // Render one frame
  const render = useCallback(() => {
    const gs = gameRef.current;
    if (!gs) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Draw board with locked pieces
    drawBoard(ctx, gs.board);

    // Draw ghost
    if (gs.status === "playing") {
      const ghostRow = getGhostRow(gs.board, gs.current);
      if (ghostRow !== gs.current.row) {
        drawGhost(ctx, gs.current, ghostRow);
      }
      // Draw current piece
      drawPiece(ctx, gs.current, CELL);
    }

    // Draw preview
    const prevCtx = previewRef.current?.getContext("2d");
    if (prevCtx) {
      drawPreview(prevCtx, gs.next);
    }

    // Update React state for display
    setDisplayScore(gs.score);
    setDisplayLevel(gs.level);
  }, []);

  // Game loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      const gs = gameRef.current;
      if (!gs || gs.status !== "playing") {
        render();
        return;
      }

      const speed = levelSpeed(gs.level);

      if (timestamp - gs.lastDrop >= speed) {
        // Try to move piece down
        if (isValid(gs.board, gs.current.type, gs.current.rotation, gs.current.row + 1, gs.current.col)) {
          gs.current.row++;
        } else {
          // Lock piece
          gs.board = lockPiece(gs.board, gs.current);

          // Points for placing a piece
          gs.score += 10;

          // Clear lines
          const { board: newBoard, linesCleared } = clearLines(gs.board);
          gs.board = newBoard;
          gs.lines += linesCleared;
          gs.score += scoreForLines(linesCleared);
          gs.level = Math.floor(gs.lines / 10) + 1;

          // Spawn next piece
          const nextType = gs.next;
          gs.next = randomPiece();
          const newPiece = spawnPiece(nextType);

          if (!isValid(gs.board, newPiece.type, newPiece.rotation, newPiece.row, newPiece.col)) {
            // Game over
            gs.status = "gameover";
            setGameStatus("gameover");
            render();
            return;
          }

          gs.current = newPiece;
        }
        gs.lastDrop = timestamp;
      }

      render();
      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [render]
  );

  // Input handler (shared by keyboard and touch)
  const handleInput = useCallback((action: "left" | "right" | "down" | "rotate" | "drop") => {
    const gs = gameRef.current;
    if (!gs || gs.status !== "playing") return;

    switch (action) {
      case "left":
        if (isValid(gs.board, gs.current.type, gs.current.rotation, gs.current.row, gs.current.col - 1)) {
          gs.current.col--;
        }
        break;
      case "right":
        if (isValid(gs.board, gs.current.type, gs.current.rotation, gs.current.row, gs.current.col + 1)) {
          gs.current.col++;
        }
        break;
      case "down":
        if (isValid(gs.board, gs.current.type, gs.current.rotation, gs.current.row + 1, gs.current.col)) {
          gs.current.row++;
          gs.score += 1;
          gs.lastDrop = performance.now();
        }
        break;
      case "rotate": {
        const newRotation = (gs.current.rotation + 1) % 4;
        const result = tryRotate(gs.board, gs.current, newRotation);
        if (result) {
          gs.current.row = result.row;
          gs.current.col = result.col;
          gs.current.rotation = result.rotation;
        }
        break;
      }
      case "drop": {
        const ghostRow = getGhostRow(gs.board, gs.current);
        gs.score += (ghostRow - gs.current.row) * 2;
        gs.current.row = ghostRow;
        gs.lastDrop = 0;
        break;
      }
    }

    render();
  }, [render]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowLeft": handleInput("left"); break;
        case "ArrowRight": handleInput("right"); break;
        case "ArrowDown": handleInput("down"); break;
        case "ArrowUp": handleInput("rotate"); break;
        case " ": handleInput("drop"); break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [render]);

  // Initial render of empty board
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      drawBoard(ctx, createBoard());
    }
    const prevCtx = previewRef.current?.getContext("2d");
    if (prevCtx) {
      prevCtx.fillStyle = "#FAFAFA";
      prevCtx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    }
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleStart = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    const gs = initGame();
    gameRef.current = gs;
    setGameStatus("playing");
    setDisplayScore(0);
    setDisplayLevel(1);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [initGame, gameLoop]);

  const buttonLabel = gameStatus === "idle" ? "Spielen" : "Nochmal";
  const showButton = gameStatus === "idle" || gameStatus === "gameover";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score & Level */}
      <div className="flex items-center gap-8 text-sm text-gray-500">
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-gray-400">Punkte</span>
          <span className="text-lg font-semibold text-gray-800 tabular-nums">
            {displayScore}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-gray-400">Level</span>
          <span className="text-lg font-semibold text-gray-800 tabular-nums">
            {displayLevel}
          </span>
        </div>
      </div>

      {/* Game area */}
      <div className="flex items-start gap-4">
        {/* Main canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={BOARD_W}
            height={BOARD_H}
            className="rounded-xl border border-gray-100 bg-white"
            style={{ width: BOARD_W, height: BOARD_H }}
          />

          {/* Game over overlay */}
          {gameStatus === "gameover" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
              <span className="text-lg font-semibold text-gray-700">Game Over</span>
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            {gameStatus !== "idle" ? "Vorschau" : ""}
          </span>
          <canvas
            ref={previewRef}
            width={PREVIEW_SIZE}
            height={PREVIEW_SIZE}
            className="rounded-lg border border-gray-100 bg-white"
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
          />
        </div>
      </div>

      {/* Start / Restart Button */}
      {showButton && (
        <button
          onClick={handleStart}
          className="px-6 py-2 rounded-full bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
        >
          {buttonLabel}
        </button>
      )}

      {/* Mobile Touch Controls */}
      {gameStatus === "playing" && (
        <div className="sm:hidden flex flex-col items-center gap-1 mt-2 select-none">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleInput("rotate"); }}
            className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" fill="#1d1d1f"/></svg>
          </button>
          <div className="flex gap-1">
            <button
              onTouchStart={(e) => { e.preventDefault(); handleInput("left"); }}
              className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10L13 4V16L4 10Z" fill="#1d1d1f"/></svg>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); handleInput("down"); }}
              className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 16L4 7H16L10 16Z" fill="#1d1d1f"/></svg>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); handleInput("right"); }}
              className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16 10L7 4V16L16 10Z" fill="#1d1d1f"/></svg>
            </button>
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleInput("drop"); }}
            className="w-14 h-14 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 14L4 5H16L10 14Z" fill="#1d1d1f"/><rect x="4" y="16" width="12" height="2" rx="1" fill="#1d1d1f"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
