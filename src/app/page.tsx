import GameCard from "@/components/GameCard";

function SnakeIllustration() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
      {/* Grid hint */}
      <rect x="10" y="10" width="160" height="100" rx="12" fill="rgba(255,255,255,0.5)" />
      {/* Snake body */}
      <rect x="30" y="50" width="20" height="20" rx="5" fill="#22c55e" />
      <rect x="50" y="50" width="20" height="20" rx="5" fill="#16a34a" />
      <rect x="70" y="50" width="20" height="20" rx="5" fill="#16a34a" />
      <rect x="70" y="70" width="20" height="20" rx="5" fill="#16a34a" />
      <rect x="90" y="70" width="20" height="20" rx="5" fill="#16a34a" />
      <rect x="110" y="70" width="20" height="20" rx="5" fill="#16a34a" />
      <rect x="110" y="50" width="20" height="20" rx="5" fill="#16a34a" />
      {/* Apple */}
      <circle cx="145" cy="40" r="8" fill="#ef4444" />
      <path d="M145 32 C145 28, 150 28, 150 32" stroke="#16a34a" strokeWidth="2" fill="none" />
    </svg>
  );
}

function TetrisIllustration() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
      {/* Stacked pieces */}
      <rect x="10" y="110" width="28" height="28" rx="4" fill="#FF3B30" opacity="0.9" />
      <rect x="38" y="110" width="28" height="28" rx="4" fill="#FF3B30" opacity="0.9" />
      <rect x="38" y="82" width="28" height="28" rx="4" fill="#FF9500" opacity="0.9" />
      <rect x="66" y="110" width="28" height="28" rx="4" fill="#34C759" opacity="0.9" />
      <rect x="66" y="82" width="28" height="28" rx="4" fill="#FFCC00" opacity="0.9" />
      <rect x="94" y="110" width="28" height="28" rx="4" fill="#34C759" opacity="0.9" />
      {/* Falling T-piece */}
      <rect x="38" y="20" width="28" height="28" rx="4" fill="#AF52DE" />
      <rect x="10" y="48" width="28" height="28" rx="4" fill="#AF52DE" />
      <rect x="38" y="48" width="28" height="28" rx="4" fill="#AF52DE" />
      <rect x="66" y="48" width="28" height="28" rx="4" fill="#AF52DE" />
    </svg>
  );
}

function FlappyIllustration() {
  return (
    <svg width="200" height="120" viewBox="0 0 200 120" fill="none">
      {/* Sky background */}
      <rect x="0" y="0" width="200" height="100" rx="12" fill="rgba(255,255,255,0.35)" />
      {/* Pipe left */}
      <rect x="40" y="0" width="24" height="35" rx="4" fill="#34C759" />
      <rect x="36" y="31" width="32" height="10" rx="3" fill="#2DB84D" />
      <rect x="40" y="70" width="24" height="50" rx="4" fill="#34C759" />
      <rect x="36" y="70" width="32" height="10" rx="3" fill="#2DB84D" />
      {/* Pipe right */}
      <rect x="130" y="0" width="24" height="50" rx="4" fill="#34C759" />
      <rect x="126" y="46" width="32" height="10" rx="3" fill="#2DB84D" />
      <rect x="130" y="85" width="24" height="35" rx="4" fill="#34C759" />
      <rect x="126" y="85" width="32" height="10" rx="3" fill="#2DB84D" />
      {/* Bird */}
      <ellipse cx="90" cy="52" rx="14" ry="11" fill="#FFCC00" />
      <circle cx="96" cy="48" r="4" fill="white" />
      <circle cx="97.5" cy="48" r="2" fill="#1d1d1f" />
      <polygon points="104,51 116,54 104,57" fill="#FF8C00" />
      {/* Wing */}
      <ellipse cx="85" cy="56" rx="7" ry="4" fill="#E6A800" />
      {/* Ground */}
      <rect x="0" y="100" width="200" height="20" rx="0" fill="rgba(255,255,255,0.5)" />
      <line x1="0" y1="100" x2="200" y2="100" stroke="#d2d2d7" strokeWidth="1" />
    </svg>
  );
}

function BreakoutIllustration() {
  return (
    <svg width="180" height="130" viewBox="0 0 180 130" fill="none">
      {/* Dark board bg */}
      <rect x="5" y="5" width="170" height="120" rx="12" fill="#1d1d1f" />
      {/* Brick rows */}
      <rect x="14" y="14" width="36" height="12" rx="3" fill="#FF3B30" />
      <rect x="54" y="14" width="36" height="12" rx="3" fill="#FF3B30" />
      <rect x="94" y="14" width="36" height="12" rx="3" fill="#FF3B30" />
      <rect x="134" y="14" width="36" height="12" rx="3" fill="#FF3B30" />
      <rect x="14" y="30" width="36" height="12" rx="3" fill="#FF9500" />
      <rect x="54" y="30" width="36" height="12" rx="3" fill="#FF9500" />
      <rect x="94" y="30" width="36" height="12" rx="3" fill="#FF9500" />
      <rect x="134" y="30" width="36" height="12" rx="3" fill="#FF9500" />
      <rect x="14" y="46" width="36" height="12" rx="3" fill="#FFCC00" />
      <rect x="54" y="46" width="36" height="12" rx="3" fill="#FFCC00" />
      <rect x="94" y="46" width="36" height="12" rx="3" fill="#FFCC00" />
      <rect x="134" y="46" width="36" height="12" rx="3" fill="#FFCC00" />
      <rect x="14" y="62" width="36" height="12" rx="3" fill="#34C759" />
      <rect x="54" y="62" width="36" height="12" rx="3" fill="#34C759" />
      <rect x="94" y="62" width="36" height="12" rx="3" fill="#34C759" />
      <rect x="134" y="62" width="36" height="12" rx="3" fill="#34C759" />
      {/* Ball */}
      <circle cx="100" cy="92" r="6" fill="white" />
      {/* Paddle */}
      <rect x="60" y="108" width="60" height="8" rx="4" fill="#f5f5f7" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[#f5f5f7]">
      {/* Decorative scattered elements — full page */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 1200 1600" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* ---- Top / Hero area ---- */}
          <circle cx="80" cy="70" r="6" fill="#FF3B30" opacity="0.5" />
          <circle cx="1130" cy="120" r="4" fill="#AF52DE" opacity="0.45" />
          <circle cx="950" cy="60" r="8" fill="#FF9500" opacity="0.3" />
          <circle cx="400" cy="55" r="5" fill="#FF3B30" opacity="0.25" />
          <circle cx="750" cy="50" r="4" fill="#FFCC00" opacity="0.3" />
          <circle cx="300" cy="40" r="3" fill="#FF9500" opacity="0.4" />

          <path d="M1100 80 Q1110 65, 1120 80 Q1130 95, 1140 80" stroke="#FF3B30" strokeWidth="2.5" fill="none" opacity="0.3" strokeLinecap="round" />
          <path d="M40 110 Q50 95, 60 110 Q70 125, 80 110" stroke="#FF9500" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round" />

          <rect x="250" y="100" width="10" height="10" rx="2" fill="#FFCC00" opacity="0.35" transform="rotate(30, 255, 105)" />
          <rect x="180" y="160" width="8" height="8" rx="2" fill="#FF9500" opacity="0.3" transform="rotate(45, 184, 164)" />

          {/* Tetris L-piece top-left */}
          <g transform="translate(100, 150) rotate(-15)" opacity="0.25">
            <rect width="16" height="16" rx="3" fill="#5AC8FA" />
            <rect y="16" width="16" height="16" rx="3" fill="#5AC8FA" />
            <rect x="16" y="16" width="16" height="16" rx="3" fill="#5AC8FA" />
          </g>

          <circle cx="50" cy="200" r="3.5" fill="#FF9500" opacity="0.35" />
          <path d="M1000 140 Q1010 125, 1020 140" stroke="#34C759" strokeWidth="2.5" fill="none" opacity="0.25" strokeLinecap="round" />

          {/* ---- Middle / Cards area ---- */}
          <circle cx="30" cy="420" r="5" fill="#5AC8FA" opacity="0.4" />
          <circle cx="1160" cy="380" r="6" fill="#FF3B30" opacity="0.35" />
          <circle cx="1150" cy="520" r="5" fill="#FFCC00" opacity="0.3" />
          <circle cx="60" cy="560" r="4" fill="#AF52DE" opacity="0.35" />

          {/* Snake segment mid-left */}
          <g transform="translate(40, 500)" opacity="0.22">
            <rect width="14" height="14" rx="4" fill="#34C759" />
            <rect x="14" width="14" height="14" rx="4" fill="#34C759" />
            <rect x="28" width="14" height="14" rx="4" fill="#34C759" />
          </g>

          {/* Tetris T-piece mid-right */}
          <g transform="translate(1080, 480) rotate(20)" opacity="0.2">
            <rect width="14" height="14" rx="3" fill="#AF52DE" />
            <rect x="14" width="14" height="14" rx="3" fill="#AF52DE" />
            <rect x="28" width="14" height="14" rx="3" fill="#AF52DE" />
            <rect x="14" y="14" width="14" height="14" rx="3" fill="#AF52DE" />
          </g>

          <path d="M1120 650 Q1130 635, 1140 650" stroke="#5AC8FA" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
          <path d="M30 700 Q40 688, 50 700" stroke="#AF52DE" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />

          <rect x="1100" y="740" width="12" height="12" rx="3" fill="#34C759" opacity="0.25" transform="rotate(-20, 1106, 746)" />
          <rect x="70" y="780" width="10" height="10" rx="2" fill="#FFCC00" opacity="0.3" transform="rotate(15, 75, 785)" />

          <circle cx="1140" cy="820" r="4" fill="#FF9500" opacity="0.3" />
          <circle cx="45" cy="870" r="5" fill="#FF3B30" opacity="0.3" />

          {/* ---- Bottom area ---- */}
          <circle cx="1100" cy="1000" r="6" fill="#AF52DE" opacity="0.3" />
          <circle cx="80" cy="1050" r="4" fill="#5AC8FA" opacity="0.35" />
          <circle cx="1150" cy="1120" r="3" fill="#FFCC00" opacity="0.4" />
          <circle cx="50" cy="1180" r="5" fill="#34C759" opacity="0.25" />

          {/* Paddle shape bottom-right */}
          <rect x="1060" y="1060" width="40" height="8" rx="4" fill="#86868b" opacity="0.15" />

          {/* Snake segment bottom */}
          <g transform="translate(60, 1150) rotate(10)" opacity="0.18">
            <rect width="12" height="12" rx="3" fill="#34C759" />
            <rect x="12" width="12" height="12" rx="3" fill="#34C759" />
          </g>

          <path d="M1080 1200 Q1090 1185, 1100 1200 Q1110 1215, 1120 1200" stroke="#FF3B30" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round" />
          <path d="M40 1300 Q50 1288, 60 1300" stroke="#FF9500" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round" />

          <circle cx="1130" cy="1350" r="4" fill="#5AC8FA" opacity="0.3" />
          <circle cx="70" cy="1400" r="3" fill="#AF52DE" opacity="0.35" />

          {/* Tetris S-piece bottom-right */}
          <g transform="translate(1090, 1400) rotate(-10)" opacity="0.18">
            <rect x="14" width="14" height="14" rx="3" fill="#FF9500" />
            <rect x="28" width="14" height="14" rx="3" fill="#FF9500" />
            <rect width="14" height="14" rx="3" fill="#FF9500" y="14" />
            <rect x="14" y="14" width="14" height="14" rx="3" fill="#FF9500" />
          </g>

          <rect x="50" y="1480" width="8" height="8" rx="2" fill="#FFCC00" opacity="0.3" transform="rotate(30, 54, 1484)" />
          <circle cx="1160" cy="1520" r="5" fill="#34C759" opacity="0.25" />
        </svg>
      </div>

      {/* Hero */}
      <section className="relative max-w-[980px] mx-auto px-6 pt-20 pb-14 text-center">
        <h1 className="text-[56px] sm:text-[64px] font-semibold tracking-tight text-gray-700 leading-[1.05]">
          Casa Primas
        </h1>
        <p className="text-xl text-gray-400 mt-4">
          Lust auf ein Spiel ?
        </p>
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {["Carina", "Rafael", "Leni", "Ariana", "Matteo"].map((name) => (
            <span
              key={name}
              className="text-xs font-medium text-gray-400 bg-white/60 px-3 py-1 rounded-full"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Games Bento Grid */}
      <section id="games" className="relative max-w-[980px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GameCard
            title="Snake"
            description="Sammle Aepfel und werde laenger."
            href="/games/snake"
            bg="bg-[#f2f9f2]"
          >
            <SnakeIllustration />
          </GameCard>

          <GameCard
            title="Tetris"
            description="Stapel die Bloecke und raeume Reihen ab."
            href="/games/tetris"
            bg="bg-[#f0f3ff]"
          >
            <TetrisIllustration />
          </GameCard>

          <GameCard
            title="Flappy Bird"
            description="Fliege durch die Rohre. Wie weit schaffst du es?"
            href="/games/flappy"
            bg="bg-[#fef9ee]"
          >
            <FlappyIllustration />
          </GameCard>

          <GameCard
            title="Breakout"
            description="Zerstoere alle Bloecke mit Ball und Paddle."
            href="/games/breakout"
            bg="bg-[#f5f5f7]"
          >
            <BreakoutIllustration />
          </GameCard>
        </div>
      </section>
    </div>
  );
}
