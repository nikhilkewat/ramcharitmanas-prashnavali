import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-[#3a1606] via-[#6b2a0c] to-[#3a1606]" />

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between">
          {/* Left - Title */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-serif text-saffron-900 shadow-lg ring-2 ring-amber-200/40"
              style={{ background: 'radial-gradient(circle at 35% 30%, #fde68a, #e0a43a 60%, #b7791f)' }}
              aria-hidden
            >
              ॐ
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">
                <Link href="/" className="hover:text-saffron-200 transition-colors">श्री राम प्रश्नावली</Link>
              </h1>
              <p className="text-amber-200/80 text-sm sm:text-base mt-1 tracking-widest">
                Shri Ram Prashnavali
              </p>
            </div>
          </div>

          {/* Right - Nav + OM + Dark Mode */}
          <div className="flex items-center gap-4">
            <Link
              href="/daily"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-amber-100 ring-1 ring-white/15 rounded-full text-xs font-medium hover:bg-white/20 transition-colors"
            >
              <CalendarDays size={14} /> आज की चौपाई
            </Link>
                        <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Bottom ornamental border */}
      <div className="relative h-[3px] bg-linear-to-r from-transparent via-amber-400/80 to-transparent" />
    </header>
  );
}
