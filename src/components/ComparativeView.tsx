import React from 'react';
import { Columns3, CheckCircle2, ExternalLink, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { BioscienceTarget } from '../types/science';

interface ComparativeProps {
  targets: Record<string, BioscienceTarget>;
  currentTargetId: string;
  onSelectTarget: (id: string) => void;
}

export const ComparativeView: React.FC<ComparativeProps> = ({
  targets,
  currentTargetId,
  onSelectTarget
}) => {
  const targetList = Object.values(targets);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Columns3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Multi-Target Structural & Therapeutic Matrix</h2>
        </div>
        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
          Side-by-side comparative assessment of biological targets across predicted structural confidence (AlphaFold pLDDT), experimental resolution (RCSB PDB), druggability, and disease mechanisms.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {targetList.map((t) => {
          const isCurrent = t.id === currentTargetId;
          return (
            <div
              key={t.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-bold font-mono text-slate-900">{t.symbol}</h3>
                    <span className="text-[11px] text-slate-500 font-medium line-clamp-1">{t.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 my-4 text-xs">
                  {/* AlphaFold Confidence */}
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                    <div className="flex items-center justify-between text-[11px] text-blue-900 mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> AlphaFold pLDDT
                      </span>
                      <span className="font-mono font-bold">{t.alphaFold.globalPlddt}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-blue-200 overflow-hidden flex">
                      <div style={{ width: `${t.alphaFold.plddtDistribution.veryHigh}%`, backgroundColor: '#0053D6' }} />
                      <div style={{ width: `${t.alphaFold.plddtDistribution.confident}%`, backgroundColor: '#65CBF3' }} />
                      <div style={{ width: `${t.alphaFold.plddtDistribution.low}%`, backgroundColor: '#FFDB13' }} />
                      <div style={{ width: `${t.alphaFold.plddtDistribution.veryLow}%`, backgroundColor: '#FF7D45' }} />
                    </div>
                  </div>

                  {/* PDB Structure */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">PDB Reference</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {t.experimentalPdb.pdbId} ({t.experimentalPdb.resolution} Å)
                    </span>
                  </div>

                  {/* Locus */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Chromosome Locus</span>
                    <span className="font-mono text-slate-800">{t.chromosomeLocus}</span>
                  </div>

                  {/* Sequence Length */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Length</span>
                    <span className="font-mono text-slate-800">{t.sequenceLength} residues</span>
                  </div>

                  {/* Targeted Therapeutics */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Targeted Drugs</span>
                    <span className="font-semibold text-teal-700">
                      {t.drugs.length} compound(s)
                    </span>
                  </div>

                  {/* Curated Pathways */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Reactome Pathways</span>
                    <span className="text-slate-800">{t.pathways.length} cascades</span>
                  </div>

                  {/* Location */}
                  <div className="py-1">
                    <span className="text-slate-500 block mb-1">Subcellular</span>
                    <div className="flex flex-wrap gap-1">
                      {t.subcellularLocation.map((loc) => (
                        <span key={loc} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectTarget(t.id)}
                disabled={isCurrent}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                {isCurrent ? 'Current Selection' : 'Inspect Target in 3D'}
                {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
