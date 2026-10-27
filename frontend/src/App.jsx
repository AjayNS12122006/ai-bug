import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Bug,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Download,
  Files,
  GitBranch,
  Globe,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Layout from './components/Layout';
import * as api from './services/api';

const riskColor = (value) => {
  if (value >= 85) return '#ef4444';
  if (value >= 70) return '#f97316';
  if (value >= 45) return '#facc15';
  return '#22c55e';
};

const statCards = [
  { label: 'Total Projects', value: '24', icon: Files },
  { label: 'Modules Analyzed', value: '1,284', icon: Cpu },
  { label: 'Bugs Predicted', value: '76', icon: Bug },
  { label: 'High Risk Modules', value: '31', icon: AlertTriangle },
];

function AppShell({ children }) {
  return <Layout>{children}</Layout>;
}

function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-glow ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">{label}</div>
          <div className="mt-2 text-3xl font-bold text-white">{value}</div>
        </div>
        <div className="rounded-xl bg-violet-500/15 p-3 text-violet-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDemo = async () => {
    setLoadingDemo(true);
    try {
      await api.createDemoProject();
      navigate('/dashboard');
    } catch (error) {
      alert('Demo project could not be loaded.');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold">BUGSCOPE AI</div>
              <div className="text-xs text-slate-400">Intelligent Software Dependency & Bug Risk Analysis</div>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#stack">Technology</a>
          </nav>
        </header>

        <main className="pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                <BrainCircuit className="mr-2 h-3.5 w-3.5" /> Graph Algorithms + Machine Learning
              </div>
              <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-white">
                Predict Bug Propagation Before It Spreads.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-300">
                Analyze software dependencies using graph traversal, risk scoring, and a synthetic ML model designed for dependency impact forecasting.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/analyze" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-violet-900/50 transition hover:bg-violet-500">
                  Start Analysis <ArrowRight className="h-4 w-4" />
                </Link>
                <button onClick={handleDemo} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-medium text-slate-100">
                  {loadingDemo ? 'Loading...' : 'Try Demo'}
                </button>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-glow">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div>
                    <div className="text-xs text-slate-400">Propagation risk</div>
                    <div className="mt-1 text-3xl font-bold text-red-400">94%</div>
                  </div>
                  <ShieldAlert className="h-10 w-10 text-red-400" />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-300"><GitBranch className="h-4 w-4 text-violet-300" /> Dependency graph</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm"><span>AuthService</span><span className="text-red-300">Critical</span></div>
                    <div className="flex items-center justify-between text-sm"><span>UserService</span><span className="text-orange-300">High</span></div>
                    <div className="flex items-center justify-between text-sm"><span>ProfileService</span><span className="text-yellow-300">Medium</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div id="how-it-works" className="mt-24 grid gap-6 md:grid-cols-3">
            {[
              { title: 'DSA Engine', text: 'BFS, DFS, graph traversal, adjacency lists, and priority queues model propagation hotspots.', icon: GitBranch },
              { title: 'Machine Learning', text: 'Random Forest models predict file-level risk using dependency and complexity features.', icon: BrainCircuit },
              { title: 'Risk Prediction', text: 'Rank files by propagation score and explain the dominant factors behind each decision.', icon: Sparkles },
            ].map(({ title, text, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200"><Icon className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>

          <div id="features" className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {['Graph Visualization', 'ML Risk Scoring', 'Historical Analysis', 'Professional Reporting'].map((feature) => (
              <div key={feature} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center text-sm text-slate-200">
                <CheckCircle2 className="mx-auto mb-3 h-6 w-6 text-emerald-400" />
                {feature}
              </div>
            ))}
          </div>

          <div id="stack" className="mt-20 rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <div className="mb-4 text-sm uppercase tracking-[0.24em] text-violet-300">Technology Stack</div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              {['React', 'Vite', 'Tailwind CSS', 'FastAPI', 'MongoDB', 'NetworkX', 'Scikit-learn', 'React Flow', 'Recharts'].map((tech) => (
                <span key={tech} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5">{tech}</span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsRes, historyRes] = await Promise.all([api.getProjects(), api.getHistory()]);
        const nextProjects = projectsRes.data || [];
        setProjects(nextProjects);
        setHistory(historyRes.data || []);
        if (nextProjects[0]) {
          setSelectedProjectId(nextProjects[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeProject = projects.find((project) => project.id === selectedProjectId) || projects[0] || null;
  const analysis = activeProject?.analysis || {};
  const modules = activeProject?.modules || [];

  const statCards = [
    { label: 'Total Projects', value: String(projects.length || 0), icon: Files },
    { label: 'Modules Analyzed', value: String(modules.length || 0), icon: Cpu },
    { label: 'High Risk Modules', value: String(analysis.high_risk || 0), icon: AlertTriangle },
    { label: 'Bugs Predicted', value: String((analysis.high_risk || 0) + (analysis.medium_risk || 0) + (analysis.low_risk || 0)), icon: Bug },
  ];

  const riskDistribution = [
    { name: 'High', value: Number(analysis.high_risk || 0), color: '#ef4444' },
    { name: 'Medium', value: Number(analysis.medium_risk || 0), color: '#facc15' },
    { name: 'Low', value: Number(analysis.low_risk || 0), color: '#22c55e' },
  ];

  const trendData = history.length
    ? history.slice(-7).map((entry) => ({ name: entry.date || 'Scan', risk: Number(entry.high_risk || 0) }))
    : [{ name: 'No data', risk: 0 }];

  const vulnerableModules = modules
    .map((module) => ({
      module: module.name || module.path,
      risk: Math.round(Number(module.risk_score || 0)),
      dependencies: Array.isArray(module.dependencies) ? module.dependencies.length : 0,
    }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">Project overview</p>
          <h1 className="mt-1 text-3xl font-bold text-white">AI Bug Propagation Overview</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <Link to="/analyze" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white">Analyze Project</Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-slate-300">Loading project metrics...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="Risk Distribution" subtitle={activeProject ? activeProject.name : 'Propagation risk by severity'}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {riskDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Bug Propagation Trend" subtitle="Recent scans">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="risk" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Most Vulnerable Modules" subtitle="Current risk ranking">
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  {vulnerableModules.length ? vulnerableModules.map((row) => (
                    <tr key={row.module} className="border-t border-slate-800 bg-slate-900/30">
                      <td className="px-4 py-3 font-medium text-white">{row.module}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-300">{row.risk}%</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{row.dependencies}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-slate-400">No analyzed modules yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
            {history.length > 0 ? `Recent scans: ${history.length}` : 'No scans yet. Add a project to begin analysis.'}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((res) => setProjects(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <Link to="/analyze" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white">Analyze Project</Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-slate-300">Loading project list...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-xs text-violet-200">{project.type}</span>
                <span className="text-xs text-slate-400">{project.id.slice(0, 8)}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{project.name}</h3>
              <p className="mt-2 text-sm text-slate-300">{project.analysis?.source_bug || 'No analysis run yet'}</p>
              <div className="mt-5 flex gap-2">
                <Link to="/graph" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200">Graph</Link>
                <Link to="/prediction" className="rounded-lg bg-violet-600 px-3 py-2 text-xs text-white">Predict</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyzePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a ZIP project archive.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.uploadProject(file);
      await api.analyzeProject(res.data.id);
      setStatus('Project uploaded and analyzed successfully.');
      navigate('/dashboard');
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Project upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubImport = async () => {
    if (!repoUrl.trim()) {
      setStatus('Please enter a GitHub repository URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.importGitHubProject(repoUrl.trim());
      await api.analyzeProject(res.data.id);
      setStatus('GitHub repository cloned and analyzed successfully.');
      navigate('/dashboard');
    } catch (error) {
      setStatus(error.response?.data?.detail || 'GitHub import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Analyze Project</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-dashed border-violet-500/40 bg-slate-900/80 p-10 text-center">
          <Upload className="mx-auto mb-4 h-12 w-12 text-violet-300" />
          <p className="text-lg font-semibold text-white">Upload a ZIP project archive</p>
          <p className="mt-2 text-sm text-slate-400">or</p>
          <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-100">
            <input type="file" accept=".zip" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            Browse Files
          </label>
          {file && <div className="mt-4 text-sm text-emerald-300">{file.name}</div>}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <label className="mb-2 block text-sm font-medium text-slate-200">GitHub Repository URL</label>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/project"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none ring-0 focus:border-violet-400"
          />
          <button onClick={handleGitHubImport} className="mt-4 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100">Use Repository URL</button>
          <button onClick={handleUpload} className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 font-medium text-white" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Uploaded ZIP'}
          </button>
          {status && <p className="mt-4 text-sm text-slate-300">{status}</p>}
        </div>
      </div>
    </div>
  );
}

function DependencyGraphPage() {
  const [projectId, setProjectId] = useState('');
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.getProjects().then((res) => {
      const list = res.data || [];
      setProjects(list);
      if (list[0]) {
        setProjectId(list[0].id);
        api.getGraph(list[0].id).then((graphRes) => setGraph(graphRes.data)).catch(console.error);
      }
    });
  }, []);

  const nodes = useMemo(() => graph.nodes.map((node) => ({
    id: node.id,
    position: { x: (Math.random() * 260), y: (Math.random() * 200) },
    data: { label: node.label },
    style: { background: riskColor(node.risk || 0), color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }
  })), [graph]);

  const edges = useMemo(() => graph.edges.map((edge) => ({ ...edge, animated: true })), [graph]);

  const loadGraph = async (nextProjectId) => {
    setProjectId(nextProjectId);
    try {
      const res = await api.getGraph(nextProjectId);
      setGraph(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Dependency Graph</h1>
        <select value={projectId} onChange={(e) => loadGraph(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      <div className="h-[540px] rounded-3xl border border-slate-800 bg-slate-900/80">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#334155" gap={18} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

function BugPredictionPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [sourceBug, setSourceBug] = useState('');
  const [modules, setModules] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getProjects().then((res) => {
      const list = res.data || [];
      setProjects(list);
      if (list[0]) {
        setSelectedProject(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    api.getModules(selectedProject).then((res) => setModules(res.data.modules || []));
  }, [selectedProject]);

  const handlePredict = async () => {
    if (!selectedProject || !sourceBug) return;
    setLoading(true);
    try {
      const res = await api.predictPropagation(selectedProject, sourceBug);
      setResult(res.data.analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Bug Prediction</h1>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <label className="mb-2 block text-sm text-slate-300">Select project</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <label className="mt-5 mb-2 block text-sm text-slate-300">Select suspected buggy module</label>
          <select value={sourceBug} onChange={(e) => setSourceBug(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
            <option value="">Choose a module</option>
            {modules.map((module) => (
              <option key={module.path} value={module.path}>{module.name}</option>
            ))}
          </select>

          <button onClick={handlePredict} disabled={!sourceBug || loading} className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50">
            {loading ? 'Running Analysis...' : 'Start Bug Propagation Analysis'}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          {result ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Source Bug</p>
                  <h3 className="text-2xl font-bold text-white">{result.source_bug}</h3>
                </div>
                <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-300">{result.high_risk} high risk</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400">Potentially Affected Modules</div>
                  <div className="mt-2 text-2xl font-bold text-white">{result.affected_modules}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400">High Risk</div>
                  <div className="mt-2 text-2xl font-bold text-red-300">{result.high_risk}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400">Medium Risk</div>
                  <div className="mt-2 text-2xl font-bold text-yellow-300">{result.medium_risk}</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {result.predictions?.slice(0, 5).map((item) => (
                  <div key={item.module} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <div>
                      <div className="font-medium text-white">{item.module}</div>
                      <div className="text-xs text-slate-400">{item.risk_label}</div>
                    </div>
                    <div className="text-lg font-bold" style={{ color: riskColor(item.risk_probability) }}>{item.risk_probability.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No prediction selected yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskAnalysisPage() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    api.getProjects().then((res) => {
      const list = res.data || [];
      setProjects(list);
      if (list[0]) {
        setProjectId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!projectId) return;
    api.getRisk(projectId).then((riskRes) => setAnalysis(riskRes.data)).catch(console.error);
  }, [projectId]);

  const highestModuleRisk = analysis?.predictions?.length
    ? Math.max(...analysis.predictions.map((item) => Number(item.risk_probability || 0)))
    : 0;
  const riskLabel = highestModuleRisk >= 80 ? 'Critical' : highestModuleRisk >= 60 ? 'High' : highestModuleRisk >= 35 ? 'Medium' : 'Low';
  const categories = analysis?.predictions?.slice(0, 5).map((item) => ({
    name: item.module.split('/').pop() || item.module,
    value: Math.round(Number(item.risk_probability || 0)),
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Risk Analysis</h1>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Risk Score" subtitle="Current project confidence">
          <div className="flex items-center gap-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-red-500/40 bg-slate-950 text-3xl font-bold text-red-300">{highestModuleRisk.toFixed(0)}%</div>
            <div>
              <div className="text-lg font-semibold text-white">{riskLabel}</div>
              <p className="mt-2 text-sm text-slate-300">{analysis ? `Current project risk is driven by ${analysis.high_risk || 0} high-risk modules and ${analysis.medium_risk || 0} medium-risk modules.` : 'Project analysis is loading.'}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Risk Categories" subtitle="Factor breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories.length ? categories : [{ name: 'No data', value: 0 }] }>
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Analysis Summary" subtitle={analysis?.source_bug || 'Project summary'}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-400">Affected Modules</div>
            <div className="mt-2 text-2xl font-bold text-white">{analysis?.affected_modules || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-400">High Risk</div>
            <div className="mt-2 text-2xl font-bold text-red-300">{analysis?.high_risk || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-400">Propagation Path</div>
            <div className="mt-2 text-sm font-medium text-slate-200">{analysis?.source_bug || 'No source module selected'}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function CodeExplorerPage() {
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    api.getProjects().then((res) => {
      const list = res.data || [];
      setProjects(list);
      if (list[0]) {
        setProjectId(list[0].id);
        api.getModules(list[0].id).then((moduleRes) => {
          const data = moduleRes.data.modules || [];
          setModules(data);
          if (data[0]) setSelectedModule(data[0]);
        });
      }
    });
  }, []);

  const loadProjectModules = async (nextProjectId) => {
    setProjectId(nextProjectId);
    try {
      const moduleRes = await api.getModules(nextProjectId);
      const data = moduleRes.data.modules || [];
      setModules(data);
      setSelectedModule(data[0] || null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Code Explorer</h1>
        <select value={projectId} onChange={(e) => loadProjectModules(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr_0.7fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 text-sm font-medium text-slate-300">Project Files</div>
          <div className="space-y-2">
            {modules.map((module) => (
              <button key={module.path} onClick={() => setSelectedModule(module)} className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${selectedModule?.path === module.path ? 'border-violet-500/40 bg-violet-500/10 text-white' : 'border-slate-800 bg-slate-950/50 text-slate-200'}`}>
                {module.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-slate-400">Source Code</div>
            <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-xs text-violet-200">{selectedModule?.language || 'javascript'}</div>
          </div>
          <pre className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
{selectedModule ? (selectedModule.source_code || selectedModule.content || 'Select a file to inspect.') : 'Select a file to inspect.'}
          </pre>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 text-sm font-medium text-slate-300">Module Information</div>
          {selectedModule ? (
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex justify-between"><span>Risk</span><span className="font-semibold text-red-300">{Math.round(Number(selectedModule.risk_score || 0))}%</span></div>
              <div className="flex justify-between"><span>Dependencies</span><span>{selectedModule.dependencies?.length || 0}</span></div>
              <div className="flex justify-between"><span>Dependents</span><span>{selectedModule.dependents?.length || 0}</span></div>
              <div className="flex justify-between"><span>Complexity</span><span>{selectedModule.complexity || 0}</span></div>
              <div className="flex justify-between"><span>Previous Bugs</span><span>{selectedModule.previous_bug_count || 0}</span></div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">No module loaded.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.getHistory().then((res) => setHistory(res.data || [])).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">History</h1>
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-300">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">High Risk</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={`${row.project_id}-${row.date}`} className="border-t border-slate-800">
                <td className="px-4 py-3 font-medium text-white">{row.project_name}</td>
                <td className="px-4 py-3 text-slate-300">{row.date}</td>
                <td className="px-4 py-3 text-red-300">{row.high_risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsPage() {
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.getProjects().then((res) => {
      const list = res.data || [];
      setProjects(list);
      if (list[0]) {
        setProjectId(list[0].id);
        api.getReport(list[0].id).then((reportRes) => setReport(reportRes.data)).catch(console.error);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"><Download className="h-4 w-4" />Generate Report</button>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        {report ? (
          <div className="space-y-4 text-slate-200">
            <div className="text-lg font-semibold text-white">{report.project}</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">ML Model Information: {report.ml_model}</div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">DSA Algorithms: {report.dsa_algorithms.join(', ')}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              {report.recommendations.map((item) => (
                <div key={item} className="flex gap-2 py-1"><ChevronRight className="h-4 w-4 text-violet-300" />{item}</div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-slate-400">No report available yet.</div>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-4 text-lg font-semibold text-white">System Settings</div>
          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between"><span>Theme</span><span className="rounded-full border border-slate-700 px-2 py-1">Dark / Light</span></div>
            <div className="flex items-center justify-between"><span>Default Risk Threshold</span><span>75%</span></div>
            <div className="flex items-center justify-between"><span>ML Model</span><span>Random Forest</span></div>
            <div className="flex items-center justify-between"><span>Database Status</span><span className="text-emerald-300">Connected</span></div>
            <div className="flex items-center justify-between"><span>API Status</span><span className="text-emerald-300">Operational</span></div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-4 text-lg font-semibold text-white">Analyzer Settings</div>
          <div className="space-y-3 text-sm text-slate-300">
            <label className="flex items-center justify-between"><span>Ignore generated files</span><input type="checkbox" defaultChecked className="h-4 w-4" /></label>
            <label className="flex items-center justify-between"><span>Perform static parsing</span><input type="checkbox" defaultChecked className="h-4 w-4" /></label>
            <label className="flex items-center justify-between"><span>Use synthetic data mode</span><input type="checkbox" defaultChecked className="h-4 w-4" /></label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
      <Route path="/projects" element={<AppShell><ProjectsPage /></AppShell>} />
      <Route path="/analyze" element={<AppShell><AnalyzePage /></AppShell>} />
      <Route path="/graph" element={<AppShell><DependencyGraphPage /></AppShell>} />
      <Route path="/prediction" element={<AppShell><BugPredictionPage /></AppShell>} />
      <Route path="/risk" element={<AppShell><RiskAnalysisPage /></AppShell>} />
      <Route path="/explorer" element={<AppShell><CodeExplorerPage /></AppShell>} />
      <Route path="/history" element={<AppShell><HistoryPage /></AppShell>} />
      <Route path="/reports" element={<AppShell><ReportsPage /></AppShell>} />
      <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />
    </Routes>
  );
}
