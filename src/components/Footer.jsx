export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-800 px-12 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Trading Platform</h3>
            <p className="text-slate-400 text-sm mt-1">Trade smarter with real-time insights.</p>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <a className="hover:text-white transition-colors" href="/">Home</a>
            <a className="hover:text-white transition-colors" href="/trading">Trading</a>
            <a className="hover:text-white transition-colors" href="/profile">Profile</a>
          </nav>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-6 text-xs text-slate-500 flex items-center justify-between">
          <span>© {year} Trading Platform. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-300">Privacy</a>
            <a href="#" className="hover:text-slate-300">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


