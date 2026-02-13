import Link from "next/link";
import SnakeGame from "@/components/games/Snake";

export const metadata = {
  title: "Snake - Family & Fun",
};

export default function SnakePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
      >
        <span>&larr;</span> Zurueck
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-gray-700 mb-8">
        Snake
      </h1>
      <SnakeGame />
    </div>
  );
}
