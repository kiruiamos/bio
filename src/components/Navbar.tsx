import React from 'react';
import { 
  Dna, 
  Box, 
  Pill, 
  Network, 
  BookOpen, 
  Columns3, 
  Search, 
  Activity,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { WorkbenchScreen, BioscienceTarget } from '../types/science';

interface NavbarProps {
  currentScreen: WorkbenchScreen;
  onSelectScreen: (screen: WorkbenchScreen) => void;
  currentTarget: BioscienceTarget;
  allTargets: Record<string, BioscienceTarget>;
  onSelectTarget: (targetId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  currentTarget,
  allTargets,
  onSelectTarget,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) => {
  const screens: { id: WorkbenchScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'structure', label: '3D Macromolecules & AlphaFold', icon: <Box className="w-4 h-4" /> },
    { id: 'genomics', label: 'Genomics & ClinVar Variants', icon: <Dna className="w-4 h-4" /> },
    { id: 'pharmacology', label: 'Pharmacology & Drug Discovery', icon: <Pill className="w-4 h-4" /> },
    { id: 'pathways', label: 'Pathways & PPI Networks', icon: <Network className="w-4 h-4" /> },
    { id: 'literature', label: 'Literature & Clinical Trials', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'comparative', label: 'Multi-Target Matrix', icon: <Columns3 className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Level Brand & Universal Quick Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                BioNexus <span className="font-mono text-xs font-semibold px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded">Science Skills</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Macromolecular 3D Workbench • DeepMind AlphaFold • RCSB PDB • PubChem
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <form 
            onSubmit={(e) => { e.preventDefault(); onSearchSubmit(); }}
            className="relative w-full"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Query gene, UniProt ID, PDB code (e.g. TP53, P04637, 1TUP)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>

        {/* DeepMind AlphaFold & UniProt status badges */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            AlphaFold DB v6 Live
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            RCSB PDB REST v2
          </span>
        </div>
      </div>

      {/* Quick-Try Example Bar (Mandated by Science Skill) */}
      <div className="bg-slate-50 border-t border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick-Try Targets:
          </span>
          {Object.values(allTargets).map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTarget(t.id)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTarget.id === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{t.symbol}</span>
              <span className={`text-[10px] font-normal ${currentTarget.id === t.id ? 'text-blue-100' : 'text-slate-400'}`}>
                {t.uniprotAccession}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Screen Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 no-scrollbar">
        {screens.map((screen) => {
          const isActive = currentScreen === screen.id;
          return (
            <button
              key={screen.id}
              onClick={() => onSelectScreen(screen.id)}
              className={`py-2.5 px-3.5 border-b-2 font-medium text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-bold bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{screen.icon}</span>
              {screen.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
