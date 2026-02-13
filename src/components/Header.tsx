"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
      <nav className="max-w-[980px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="opacity-90 hover:opacity-100 transition-opacity"
        >
          <svg width="40" height="35" viewBox="0 0 64 56" fill="#1d1d1f">
            {/* Mom (left) */}
            <circle cx="14" cy="8" r="5" />
            <path d="M8 16C8 14 10.5 13 14 13S20 14 20 16V32C20 33 19.5 34 18 34H10C8.5 34 8 33 8 32V16Z" />
            <rect x="9" y="33" width="4" height="14" rx="1.5" />
            <rect x="15" y="33" width="4" height="14" rx="1.5" />
            {/* Dad (right-center, tallest) */}
            <circle cx="38" cy="5" r="5.5" />
            <path d="M31 14C31 12 34 11 38 11S45 12 45 14V30C45 31 44.5 32 43 32H33C31.5 32 31 31 31 30V14Z" />
            <rect x="32.5" y="31" width="4.5" height="16" rx="1.5" />
            <rect x="39" y="31" width="4.5" height="16" rx="1.5" />
            {/* Child 1 (between mom and dad) */}
            <circle cx="26" cy="16" r="4" />
            <path d="M21.5 23C21.5 21.5 23.5 20.5 26 20.5S30.5 21.5 30.5 23V36C30.5 37 30 37.5 29 37.5H23C22 37.5 21.5 37 21.5 36V23Z" />
            <rect x="22.5" y="37" width="3" height="10" rx="1" />
            <rect x="26.5" y="37" width="3" height="10" rx="1" />
            {/* Child 2 (right of dad) */}
            <circle cx="50" cy="18" r="3.5" />
            <path d="M46 24.5C46 23 47.5 22 50 22S54 23 54 24.5V38C54 39 53.5 39.5 52.5 39.5H47.5C46.5 39.5 46 39 46 38V24.5Z" />
            <rect x="47" y="39" width="3" height="8" rx="1" />
            <rect x="50.5" y="39" width="3" height="8" rx="1" />
            {/* Child 3 (smallest, far right) */}
            <circle cx="59" cy="24" r="3" />
            <path d="M56 30C56 28.5 57 28 59 28S62 28.5 62 30V40C62 41 61.5 41 61 41H57C56.5 41 56 41 56 40V30Z" />
            <rect x="56.5" y="40.5" width="2.5" height="7" rx="1" />
            <rect x="59.5" y="40.5" width="2.5" height="7" rx="1" />
          </svg>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-7">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#games"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Spiele
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="sm:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span
            className={`block w-[18px] h-[1.5px] bg-gray-600 transition-transform ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block w-[18px] h-[1.5px] bg-gray-600 transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-[18px] h-[1.5px] bg-gray-600 transition-transform ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[rgba(251,251,253,0.97)] backdrop-blur-xl px-6 py-4 flex flex-col gap-4">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/#games"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Spiele
          </Link>
        </div>
      )}
    </header>
  );
}
