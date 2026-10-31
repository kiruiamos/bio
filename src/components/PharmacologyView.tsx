import React, { useState } from 'react';
import { 
  Pill, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  Activity, 
  Atom, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { BioscienceTarget, DrugCompound } from '../types/science';
import { buildPubChemUrl } from '../services/scienceApi';

interface PharmacologyProps {
  target: BioscienceTarget;
}

export const PharmacologyView: React.FC<PharmacologyProps> = ({ target }) => {
  const [selectedDrug, setSelectedDrug] = useState<DrugCompound>(target.drugs[0]);

  // Lipinski Rule of 5 check
  const evaluateLipinski = (drug: DrugCompound) => {
    const rules = [
      { name: 'Molecular Weight ≤ 500 Da', pass: drug.molecularWeight <= 500, val: `${drug.molecularWeight} Da` },
      { name: 'LogP (XLogP3) ≤ 5.0', pass: drug.xLogP <= 5.0, val: drug.xLogP.toString() },
      { name: 'H-Bond Donors ≤ 5', pass: drug.hBondDonorCount <= 5, val: drug.hBondDonorCount.toString() },
      { name: 'H-Bond Acceptors ≤ 10', pass: drug.hBondAcceptorCount <= 10, val: drug.hBondAcceptorCount.toString() },
      { name: 'Rotatable Bonds ≤ 10 (Veber rule)', pass: drug.rotatableBondCount <= 10, val: drug.rotatableBondCount.toString() }
    ];
    const violations = rules.filter((r) => !r.pass).length;
    return { rules, violations, passesLipinski: violations <= 1 };
  };

  const lipinskiResult = evaluateLipinski(selectedDrug);

  const getPhaseBadge = (phase: DrugCompound['clinicalPhase'], fdaApproved: boolean) => {
    if (fdaApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          FDA Approved (Phase 4)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <Activity className="w-3.5 h-3.5 text-blue-600" />
        Clinical Phase {phase}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">Pharmacology & Targeted Therapeutics</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono font-medium">
              ChEMBL + PubChem PUG REST
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Investigational and approved small-molecule modulators targeting <strong className="text-slate-900">{target.symbol}</strong>, detailing binding affinities (IC50 / Kd), 2D chemical structure depictions, and Lipinski drug-likeness.
          </p>
        </div>

        {/* Drug Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {target.drugs.map((drug) => (
            <button
              key={drug.cid}
              onClick={() => setSelectedDrug(drug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDrug.cid === drug.cid
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {drug.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Drug Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2D Chemical Structure & Lipinski Scorecard */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">2D Chemical Structure</span>
            <span className="text-xs font-mono text-slate-500 font-bold">CID {selectedDrug.cid}</span>
          </div>

          {/* Hotlinked 2D Image from PubChem */}
          <div className="relative w-64 h-64 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-3 overflow-hidden shadow-inner">
            <img
              src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${selectedDrug.cid}/PNG?image_size=300x300`}
              alt={selectedDrug.name}
              className="max-w-full max-h-full object-contain filter drop-shadow-sm hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>

          {/* SMILES Monospace Box */}
          <div className="w-full mt-4 p-2.5 bg-slate-900 rounded-lg">
            <span className="text-[10px] text-slate-400 font-mono block mb-1">CANONICAL SMILES</span>
            <p className="text-[11px] font-mono text-sky-300 break-all select-all leading-snug">
              {selectedDrug.canonicalSmiles}
            </p>
          </div>

          {/* Lipinski Rule of 5 Evaluation */}
          <div className="w-full mt-4 p-3 rounded-lg border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5 text-teal-600" />
                Lipinski Rule of 5 & Oral Drug-Likeness
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                lipinskiResult.passesLipinski ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {lipinskiResult.violations === 0 ? 'Compliant (0 violations)' : `${lipinskiResult.violations} violation(s)`}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {lipinskiResult.rules.map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-200/50 last:border-none">
                  <span className="text-slate-600">{rule.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-slate-800">{rule.val}</span>
                    {rule.pass ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pharmacology Metadata, Binding Affinities & Mechanism */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedDrug.name}</h3>
                {selectedDrug.brandNames.length > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Trade Names: {selectedDrug.brandNames.join(', ')}
                  </p>
                )}
              </div>
              <div>{getPhaseBadge(selectedDrug.clinicalPhase, selectedDrug.fdaApproved)}</div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/70 mb-4">
              {selectedDrug.description}
            </p>

            {/* Assay Binding Affinity Metric Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <span className="text-[10px] text-teal-700 font-semibold uppercase block">Potency ({selectedDrug.standardType})</span>
                <span className="text-base font-bold font-mono text-teal-950">
                  {selectedDrug.affinityValue} {selectedDrug.affinityUnit}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Modality</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedDrug.targetBindingType}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Polar Surface Area</span>
                <span className="text-xs font-bold font-mono text-slate-800">
                  {selectedDrug.tpsa} Å²
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Formula</span>
                <span className="text-xs font-bold font-mono text-slate-800">
                  {selectedDrug.molecularFormula}
                </span>
              </div>
            </div>

            {/* Mechanism of Action */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Mechanism of Action (MoA)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedDrug.mechanismOfAction}
              </p>
            </div>

            {/* Outbound Authoritative Links */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              <a
                href={buildPubChemUrl(selectedDrug.cid)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors border border-slate-200"
              >
                PubChem Compound #{selectedDrug.cid}
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              {selectedDrug.chemblId && (
                <a
                  href={`https://www.ebi.ac.uk/chembl/compound_report_card/${selectedDrug.chemblId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors border border-slate-200"
                >
                  ChEMBL Card ({selectedDrug.chemblId})
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
