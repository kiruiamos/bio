import React, { useState } from 'react';
import { Copy, Check, Info, Filter, Sparkles } from 'lucide-react';
import { BioscienceTarget, ProteinFeature } from '../types/science';

interface SequenceInspectorProps {
  target: BioscienceTarget;
  selectedResidue: number | null;
  onSelectResidue: (pos: number) => void;
}

export const SequenceInspector: React.FC<SequenceInspectorProps> = ({
  target,
  selectedResidue,
  onSelectResidue
}) => {
  const [copied, setCopied] = useState(false);
  const [filterDomain, setFilterDomain] = useState<string | null>(null);

  const handleCopyFasta = () => {
    const fasta = `>${target.uniprotAccession}|${target.uniprotId} ${target.name} [${target.organism}]\n${target.sequence.match(/.{1,60}/g)?.join('\n') || target.sequence}`;
    navigator.clipboard.writeText(fasta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find if a residue belongs to a domain
  const getFeatureForPos = (pos: number): ProteinFeature | undefined => {
    return target.features.find((f) => pos >= f.start && pos <= f.end);
  };

  // Check if position has a known variant
  const getVariantForPos = (pos: number) => {
    return target.variants.find((v) => v.residuePosition === pos);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">Linear Sequence & Domain Architecture</h3>
          <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
            {target.sequenceLength} aa
          </span>
        </div>

        <button
          onClick={handleCopyFasta}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          title="Copy FASTA Sequence to Clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied FASTA' : 'Copy FASTA'}
        </button>
      </div>

      {/* Domain filter tags */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
        <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Domains:
        </span>
        <button
          onClick={() => setFilterDomain(null)}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
            filterDomain === null ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({target.features.length})
        </button>
        {target.features.map((feat) => (
          <button
            key={`${feat.start}-${feat.end}-${feat.description}`}
            onClick={() => setFilterDomain(filterDomain === feat.description ? null : feat.description)}
            style={{
              borderColor: feat.color,
              backgroundColor: filterDomain === feat.description ? feat.color : undefined,
              color: filterDomain === feat.description ? '#ffffff' : undefined,
            }}
            className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-all ${
              filterDomain !== feat.description ? 'bg-slate-50 text-slate-700 hover:bg-slate-100' : ''
            }`}
          >
            {feat.description.split('(')[0].trim()} ({feat.start}–{feat.end})
          </button>
        ))}
      </div>

      {/* Sequence Interactive Grid */}
      <div className="p-3 bg-slate-900 rounded-lg max-h-52 overflow-y-auto font-mono text-xs select-none">
        <div className="flex flex-wrap gap-x-1 gap-y-1.5">
          {Array.from(target.sequence).map((char, idx) => {
            const pos = idx + 1;
            const feat = getFeatureForPos(pos);
            const variant = getVariantForPos(pos);
            const isSelected = selectedResidue === pos;
            const isDimmed = filterDomain && feat?.description !== filterDomain;

            let bgColor = 'bg-slate-800';
            let textColor = 'text-slate-200';
            let borderColor = 'border-transparent';

            if (feat?.color) {
              textColor = 'text-white';
            }
            if (variant) {
              borderColor = variant.clinicalSignificance === 'Pathogenic' ? 'border-red-500' : 'border-emerald-400';
            }
            if (isSelected) {
              bgColor = 'bg-rose-500';
              textColor = 'text-white';
              borderColor = 'border-white';
            }

            return (
              <button
                key={pos}
                onClick={() => onSelectResidue(pos)}
                title={`Residue ${char}${pos} ${feat ? `• ${feat.description}` : ''} ${variant ? `• Variant: ${variant.hgvsP} (${variant.clinicalSignificance})` : ''}`}
                style={{
                  backgroundColor: isSelected ? '#f43f5e' : feat?.color ? `${feat.color}40` : undefined
                }}
                className={`relative px-1 py-0.5 rounded text-[11px] border font-bold transition-transform hover:scale-125 hover:z-20 cursor-pointer ${bgColor} ${textColor} ${borderColor} ${
                  isDimmed ? 'opacity-20' : 'opacity-100'
                }`}
              >
                {char}
                {variant && (
                  <span className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${
                    variant.clinicalSignificance === 'Pathogenic' ? 'bg-red-500 ring-1 ring-white' : 'bg-emerald-400 ring-1 ring-white'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Residue Inspector Bar */}
      {selectedResidue ? (
        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold px-2 py-0.5 bg-blue-600 text-white rounded">
              {target.sequence[selectedResidue - 1]}{selectedResidue}
            </span>
            <span>
              {getFeatureForPos(selectedResidue)?.description || 'Unannotated structural region'}
            </span>
          </div>
          {getVariantForPos(selectedResidue) && (
            <span className="font-semibold text-rose-600">
              Variant: {getVariantForPos(selectedResidue)?.hgvsP} ({getVariantForPos(selectedResidue)?.clinicalSignificance})
            </span>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 italic">
          Click any amino acid residue above or atom in the 3D viewer to inspect its functional domain annotation and clinical variants.
        </p>
      )}
    </div>
  );
};
