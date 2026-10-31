import React, { useState } from 'react';
import { 
  Dna, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  ExternalLink, 
  Star, 
  Search,
  Filter,
  Globe2
} from 'lucide-react';
import { BioscienceTarget, GenomicVariant } from '../types/science';
import { buildAlphaGenomeAtlasUrl, buildClinVarUrl } from '../services/scienceApi';

interface GenomicsVariantsViewProps {
  target: BioscienceTarget;
  onSelectResidue: (pos: number) => void;
}

export const GenomicsVariantsView: React.FC<GenomicsVariantsViewProps> = ({
  target,
  onSelectResidue
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSig, setFilterSig] = useState<string>('all');

  const filteredVariants = target.variants.filter((v) => {
    const matchesSearch = 
      v.hgvsP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.hgvsC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.rsId && v.rsId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterSig === 'all') return matchesSearch;
    return matchesSearch && v.clinicalSignificance === filterSig;
  });

  const getSigBadge = (sig: GenomicVariant['clinicalSignificance']) => {
    switch (sig) {
      case 'Pathogenic':
      case 'Likely Pathogenic':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            {sig}
          </span>
        );
      case 'VUS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            VUS
          </span>
        );
      case 'Benign':
      case 'Likely Benign':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            {sig}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with DeepMind AlphaGenome Atlas & NCBI ClinVar Integration */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dna className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold">Genomic Variants & Clinical Significance</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-800 text-sky-200 border border-blue-700 font-mono">
              NCBI ClinVar + gnomAD v4
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Curated germline and somatic variants in <strong className="text-white">{target.symbol}</strong> ({target.name}) linked to hereditary syndromes, clinical drug response, and population allele frequencies.
          </p>
        </div>

        {/* DeepMind AlphaGenome Atlas Outbound Links */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={buildAlphaGenomeAtlasUrl(target.symbol, 'locus')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors shadow-xs"
          >
            <Globe2 className="w-3.5 h-3.5 text-slate-950" />
            AlphaGenome Locus
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={buildAlphaGenomeAtlasUrl(target.symbol, 'table')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-sky-200 border border-blue-700 font-semibold text-xs transition-colors"
          >
            AlphaGenome Table
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search variant by protein change (p.Arg248Trp), cDNA (c.742C>T), rsID, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter Significance:</span>
          {['all', 'Pathogenic', 'Benign', 'VUS'].map((sig) => (
            <button
              key={sig}
              onClick={() => setFilterSig(sig)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterSig === sig
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sig === 'all' ? 'All' : sig}
            </button>
          ))}
        </div>
      </div>

      {/* Variants Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Protein & cDNA Change</th>
                <th className="px-3 py-3">Residue</th>
                <th className="px-3 py-3">Clinical Significance</th>
                <th className="px-3 py-3">Review Status</th>
                <th className="px-3 py-3">Associated Condition</th>
                <th className="px-3 py-3">gnomAD AF</th>
                <th className="px-3 py-3">Molecular Consequence</th>
                <th className="px-3 py-3 text-right">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVariants.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      {v.hgvsP}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {v.hgvsC} {v.rsId && `• ${v.rsId}`}
                    </div>
                  </td>

                  <td className="px-3 py-3.5">
                    <button
                      onClick={() => onSelectResidue(v.residuePosition)}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono font-semibold rounded border border-blue-200 text-xs transition-colors"
                      title="Focus on this residue in 3D Structure Viewer"
                    >
                      {v.refResidue}{v.residuePosition}{v.altResidue}
                    </button>
                  </td>

                  <td className="px-3 py-3.5">
                    {getSigBadge(v.clinicalSignificance)}
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-0.5 text-amber-500" title={`${v.stars} stars: ${v.reviewStatus}`}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < v.stars ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 capitalize">
                      {v.reviewStatus}
                    </span>
                  </td>

                  <td className="px-3 py-3.5 max-w-xs font-medium text-slate-800">
                    {v.condition}
                  </td>

                  <td className="px-3 py-3.5 font-mono text-[11px]">
                    {v.gnomadAf !== undefined ? (
                      <span className={v.gnomadAf < 0.0001 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                        {v.gnomadAf < 0.00001 ? v.gnomadAf.toExponential(1) : v.gnomadAf.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-3 py-3.5 max-w-sm text-slate-600 text-[11px] leading-relaxed">
                    {v.consequence}
                  </td>

                  <td className="px-3 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={buildAlphaGenomeAtlasUrl(`${target.symbol} ${v.hgvsP}`, 'variant')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-slate-100 hover:bg-sky-50 text-sky-700 rounded text-[11px] font-medium border border-slate-200 hover:border-sky-300 transition-colors inline-flex items-center gap-1"
                        title="Analyze in DeepMind AlphaGenome Atlas"
                      >
                        AlphaGenome <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <a
                        href={buildClinVarUrl(v.rsId || v.hgvsP)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium border border-slate-200 transition-colors inline-flex items-center gap-1"
                        title="View record on NCBI ClinVar"
                      >
                        ClinVar <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
