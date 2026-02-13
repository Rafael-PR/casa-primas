import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  bg: string;
  textColor?: string;
  children: React.ReactNode;
}

export default function GameCard({
  title,
  description,
  href,
  bg,
  textColor = "text-gray-700",
  children,
}: GameCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className={`${bg} rounded-[20px] overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.02] flex flex-col items-center justify-between`}
        style={{ minHeight: 380 }}
      >
        {/* Text */}
        <div className="pt-10 pb-4 px-8 text-center w-full">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
            Arcade
          </p>
          <h3 className={`text-[28px] font-semibold ${textColor} tracking-tight leading-tight`}>
            {title}
          </h3>
          <p className="text-sm text-gray-400 mt-2">{description}</p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-500">
            Spielen
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mt-px">
              <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex-1 flex items-end justify-center w-full pb-8 px-8">
          {children}
        </div>
      </div>
    </Link>
  );
}
