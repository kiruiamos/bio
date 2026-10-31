import React, { useState } from 'react';
import { BookOpen, ExternalLink, Tag, Search, CheckCircle2, Award } from 'lucide-react';
import { BioscienceTarget, LiteratureItem } from '../types/science';

interface LiteratureProps {
  target: BioscienceTarget;
}

export const LiteratureView: React.FC<LiteratureProps> = ({ target }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = target.literature.filter((item) => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.journal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.authors.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Biomedical Literature & Clinical Evidence</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono font-medium">
              NCBI PubMed + Europe PMC
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            High-impact peer-reviewed publications, landmark clinical trials, and molecular mechanisms referencing <strong className="text-slate-900">{target.symbol}</strong>.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search titles, authors, journals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.pmid} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    PMID: {item.pmid}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {item.journal} ({item.year})
                  </span>
                  {item.isClinicalTrial && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Clinical Trial
                    </span>
                  )}
                </div>

                <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-slate-800">{item.citationCount.toLocaleString()}</span> citations
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3 italic">
              {item.authors.join(', ')}
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed mb-3">
              {item.abstract}
            </div>

            {/* MeSH Terms and Links */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium">MeSH:</span>
                {item.meshTerms.map((term) => (
                  <span key={term} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                    {term}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 transition-colors inline-flex items-center gap-1"
                >
                  PubMed <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={`https://doi.org/${item.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium border border-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  DOI <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
