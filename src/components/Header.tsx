import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-saffron-900 via-saffron-800 to-saffron-900" />

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
            <div className="text-4xl sm:text-5xl animate-float">🙏</div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">
                <Link href="/" className="hover:text-saffron-200 transition-colors">श्री राम प्रश्नावली</Link>
              </h1>
              <p className="text-saffron-200 text-sm sm:text-base mt-1 tracking-widest">
                Shri Ram Prashnavali
              </p>
            </div>
          </div>

          {/* Right - Nav + OM + Dark Mode */}
          <div className="flex items-center gap-4">
            <Link
              href="/daily"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-saffron-700/50 text-saffron-200 rounded-sm text-xs font-medium hover:bg-saffron-600/50 transition-colors"
            >
              📅 आज की चौपाई
            </Link>
            <span className="hidden sm:inline text-4xl sm:text-5xl text-saffron-200/60 font-serif">ॐ</span>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Bottom ornamental border */}
      <div className="relative h-2 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
      <div className="h-1 bg-gradient-to-r from-transparent via-saffron-600/50 to-transparent" />
    </header>
  );
}
