import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import { AlphaFoldModel } from '../types/science';

interface ConfidenceLegendProps {
  alphaFold: AlphaFoldModel;
}

export const ConfidenceLegend: React.FC<ConfidenceLegendProps> = ({ alphaFold }) => {
  const { plddtDistribution, globalPlddt } = alphaFold;

  const tiers = [
    {
      label: 'Very High',
      range: '> 90',
      percent: plddtDistribution.veryHigh,
      color: '#0053D6',
      bgClass: 'bg-[#0053D6]',
      textClass: 'text-[#0053D6]',
      description: 'High accuracy for backbone and side chains; reliable for binding pocket exploration.'
    },
    {
      label: 'Confident',
      range: '70 - 90',
      percent: plddtDistribution.confident,
      color: '#65CBF3',
      bgClass: 'bg-[#65CBF3]',
      textClass: 'text-sky-600',
      description: 'Reliable backbone topology and secondary structure; side chains may vary.'
    },
    {
      label: 'Low',
      range: '50 - 70',
      percent: plddtDistribution.low,
      color: '#FFDB13',
      bgClass: 'bg-[#FFDB13]',
      textClass: 'text-amber-600',
      description: 'Caution warranted; often indicates flexible loops or inter-domain linkers.'
    },
    {
      label: 'Very Low',
      range: '< 50',
      percent: plddtDistribution.veryLow,
      color: '#FF7D45',
      bgClass: 'bg-[#FF7D45]',
      textClass: 'text-orange-600',
      description: 'Strongly correlates with intrinsically disordered protein regions (IDPRs).'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">AlphaFold pLDDT Confidence Profile</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium">Mean pLDDT:</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
            {globalPlddt.toFixed(1)} / 100
          </span>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden mb-4 shadow-inner">
        <div style={{ width: `${plddtDistribution.veryHigh}%`, backgroundColor: '#0053D6' }} title={`Very High (>90): ${plddtDistribution.veryHigh}%`} />
        <div style={{ width: `${plddtDistribution.confident}%`, backgroundColor: '#65CBF3' }} title={`Confident (70-90): ${plddtDistribution.confident}%`} />
        <div style={{ width: `${plddtDistribution.low}%`, backgroundColor: '#FFDB13' }} title={`Low (50-70): ${plddtDistribution.low}%`} />
        <div style={{ width: `${plddtDistribution.veryLow}%`, backgroundColor: '#FF7D45' }} title={`Very Low (<50): ${plddtDistribution.veryLow}%`} />
      </div>

      {/* 4-Tier Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiers.map((t) => (
          <div key={t.label} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-xs font-bold text-slate-800">{t.label}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">{t.range}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono text-slate-900">{t.percent}%</span>
              <span className="text-[10px] text-slate-400">residues</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2" title={t.description}>
              {t.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
