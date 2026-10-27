import { BarChart3, BookOpenText, Bug, Cpu, FileCode2, GitBranch, History, LayoutDashboard, Settings, ShieldAlert, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: BookOpenText, label: 'Projects' },
  { to: '/analyze', icon: Sparkles, label: 'Analyze Project' },
  { to: '/graph', icon: GitBranch, label: 'Dependency Graph' },
  { to: '/prediction', icon: Bug, label: 'Bug Prediction' },
  { to: '/risk', icon: ShieldAlert, label: 'Risk Analysis' },
  { to: '/explorer', icon: FileCode2, label: 'Code Explorer' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-slate-800 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-900/40">
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-white">BUGSCOPE AI</div>
          <div className="text-xs text-slate-400">Intelligent Dependency Analysis</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/40' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span>System Status</span>
        </div>
        <div className="mt-2 text-sm text-emerald-300">All systems operational</div>
      </div>
    </aside>
  );
}
