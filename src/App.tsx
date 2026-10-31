import React, { useState } from 'react';
import { CURATED_TARGETS } from './data/curatedTargets';
import { WorkbenchScreen, BioscienceTarget } from './types/science';
import { Navbar } from './components/Navbar';
import { StructureViewer3D } from './components/StructureViewer3D';
import { ConfidenceLegend } from './components/ConfidenceLegend';
import { SequenceInspector } from './components/SequenceInspector';
import { GenomicsVariantsView } from './components/GenomicsVariantsView';
import { PharmacologyView } from './components/PharmacologyView';
import { PathwaysView } from './components/PathwaysView';
import { LiteratureView } from './components/LiteratureView';
import { ComparativeView } from './components/ComparativeView';
import { 
  buildAlphaFoldDbUrl, 
  buildRcsbStructureUrl, 
  buildUniProtUrl, 
  buildAlphaGenomeAtlasUrl 
} from './services/scienceApi';
import { ExternalLink, Database, Activity, MapPin, Tag } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<WorkbenchScreen>('structure');
  const [currentTargetId, setCurrentTargetId] = useState<string>('TP53');
  const [selectedResidue, setSelectedResidue] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentTarget: BioscienceTarget = CURATED_TARGETS[currentTargetId] || CURATED_TARGETS.TP53;

  const handleSelectTarget = (targetId: string) => {
    if (CURATED_TARGETS[targetId]) {
      setCurrentTargetId(targetId);
      setSelectedResidue(null);
    }
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    // Search by symbol, ID, or UniProt
    const match = Object.values(CURATED_TARGETS).find(
      (t) =>
        t.symbol.toUpperCase() === q ||
        t.id.toUpperCase() === q ||
        t.uniprotAccession.toUpperCase() === q ||
        t.experimentalPdb.pdbId.toUpperCase() === q
    );

    if (match) {
      setCurrentTargetId(match.id);
      setSelectedResidue(null);
    } else {
      // Check partial match
      const partial = Object.values(CURATED_TARGETS).find(
        (t) =>
          t.name.toUpperCase().includes(q) ||
          t.symbol.toUpperCase().includes(q)
      );
      if (partial) {
        setCurrentTargetId(partial.id);
        setSelectedResidue(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Global Navigation Bar */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        currentTarget={currentTarget}
        allTargets={CURATED_TARGETS}
        onSelectTarget={handleSelectTarget}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentScreen === 'structure' && (
          <div className="space-y-6">
            {/* Target Summary Banner */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h2 className="text-xl font-bold font-mono text-slate-900">
                    {currentTarget.symbol}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    UniProt: {currentTarget.uniprotAccession}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    PDB: {currentTarget.experimentalPdb.pdbId}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                    Locus: {currentTarget.chromosomeLocus}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {currentTarget.name} — <span className="text-slate-500 font-normal italic">{currentTarget.organism}</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  {currentTarget.functionSummary}
                </p>
              </div>

              {/* Authoritative Database Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={buildAlphaFoldDbUrl(currentTarget.uniprotAccession)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  AlphaFold DB <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={buildRcsbStructureUrl(currentTarget.experimentalPdb.pdbId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  RCSB PDB <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={buildUniProtUrl(currentTarget.uniprotAccession)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                >
                  UniProtKB <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={buildAlphaGenomeAtlasUrl(currentTarget.symbol, 'variant')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  AlphaGenome <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Dual Pane Layout (Mandated by Science Skill: 50-60% 3D Viewport, 40-50% Inspector) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Pane (7 cols / ~58% width): 3D Macromolecular Viewer + pLDDT Legend */}
              <div className="lg:col-span-7 space-y-4">
                <StructureViewer3D
                  alphaFold={currentTarget.alphaFold}
                  experimentalPdb={currentTarget.experimentalPdb}
                  selectedResidue={selectedResidue}
                  onSelectResidue={setSelectedResidue}
                />

                <ConfidenceLegend alphaFold={currentTarget.alphaFold} />
              </div>

              {/* Right Pane (5 cols / ~42% width): Sequence Inspector + Functional Sites */}
              <div className="lg:col-span-5 space-y-4">
                <SequenceInspector
                  target={currentTarget}
                  selectedResidue={selectedResidue}
                  onSelectResidue={setSelectedResidue}
                />

                {/* Key Functional & Catalytic Residues Table */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      Active Sites & Functional Motifs
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentTarget.features.length} annotations
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentTarget.features.map((feat, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedResidue(feat.start)}
                        className="p-2 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: feat.color || '#3b82f6' }}
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block text-[11px]">
                              {feat.description}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {feat.type} • Residues {feat.start}–{feat.end}
                            </span>
                          </div>
                        </div>

                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white border border-slate-200 text-blue-700">
                          Focus 3D
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'genomics' && (
          <GenomicsVariantsView
            target={currentTarget}
            onSelectResidue={(pos) => {
              setSelectedResidue(pos);
              setCurrentScreen('structure');
            }}
          />
        )}

        {currentScreen === 'pharmacology' && (
          <PharmacologyView target={currentTarget} />
        )}

        {currentScreen === 'pathways' && (
          <PathwaysView target={currentTarget} />
        )}

        {currentScreen === 'literature' && (
          <LiteratureView target={currentTarget} />
        )}

        {currentScreen === 'comparative' && (
          <ComparativeView
            targets={CURATED_TARGETS}
            currentTargetId={currentTarget.id}
            onSelectTarget={(id) => {
              setCurrentTargetId(id);
              setCurrentScreen('structure');
            }}
          />
        )}
      </main>

      {/* Scientific Workbench Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">BioNexus Workbench</span>
            <span>•</span>
            <span>DeepMind Science Skills Suite</span>
            <span>•</span>
            <span>AlphaFold DB v6 • RCSB PDB • PubChem • ClinVar • Reactome • STRING</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">Homo sapiens reference GRCh38 / MANE Select</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
