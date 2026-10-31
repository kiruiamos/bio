import React from 'react';
import { GitFork, Network, Share2, ExternalLink, ArrowRight, Layers } from 'lucide-react';
import { BioscienceTarget } from '../types/science';

interface PathwaysProps {
  target: BioscienceTarget;
}

export const PathwaysView: React.FC<PathwaysProps> = ({ target }) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Pathways & Interactome Networks</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono font-medium">
              Reactome Content Service + STRING v12
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Curated human biological pathways and high-confidence functional protein-protein interaction (PPI) networks involving <strong className="text-slate-900">{target.symbol}</strong>.
          </p>
        </div>

        <a
          href={`https://string-db.org/network/${target.uniprotAccession}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Interactive STRING Network
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Curated Pathways List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-indigo-600" />
              Curated Reactome Pathways ({target.pathways.length})
            </h3>
          </div>

          <div className="space-y-3">
            {target.pathways.map((pw) => (
              <div key={pw.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{pw.name}</h4>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">{pw.id} • {pw.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                    {pw.numEntities} entities
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {pw.description}
                </p>

                <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Participating Genes:</span>
                  {pw.keyMolecules.map((mol) => (
                    <span
                      key={mol}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        mol === target.symbol
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {mol}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STRING Protein-Protein Interaction Partners */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Top STRING Interaction Partners ({target.ppiPartners.length})
            </h3>
          </div>

          <div className="space-y-3">
            {target.ppiPartners.map((partner) => (
              <div key={partner.partnerGene} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{partner.partnerGene}</span>
                    <span className="text-xs text-slate-500 font-mono">({partner.uniprotAccession})</span>
                  </div>

                  <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs font-mono font-bold text-indigo-800">
                    <span>Score:</span>
                    <span>{partner.interactionScore.toFixed(3)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-800 font-medium mb-1">
                  {partner.partnerName}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {partner.role}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Evidence: {partner.evidenceType}
                  </span>

                  <a
                    href={`https://www.uniprot.org/uniprotkb/${partner.uniprotAccession}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    UniProt <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
