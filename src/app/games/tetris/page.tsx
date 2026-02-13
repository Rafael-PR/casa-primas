import Link from "next/link";
import TetrisGame from "@/components/games/Tetris";

export const metadata = {
  title: "Tetris - Family & Fun",
};

export default function TetrisPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
      >
        <span>&larr;</span> Zurueck
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-gray-700 mb-8">
        Tetris
      </h1>
      <TetrisGame />
    </div>
  );
}
