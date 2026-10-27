import { Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-slate-700 p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Sparkles className="h-4 w-4 text-violet-300" />
                Algorithm Engine active
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">Demo / Synthetic Data</span>
            </div>
          </header>

          {mobileOpen && (
            <div className="border-b border-slate-800 bg-slate-900 p-2 md:hidden">
              <div className="space-y-1">{['Dashboard','Projects','Analyze Project','Dependency Graph','Bug Prediction','Risk Analysis'].map(item => (
                <div key={item} className="rounded-lg px-3 py-2 text-sm text-slate-300">{item}</div>
              ))}</div>
            </div>
          )}

          <main className="p-5 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
