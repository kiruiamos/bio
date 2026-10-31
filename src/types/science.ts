export type WorkbenchScreen = 
  | 'structure' 
  | 'genomics' 
  | 'pharmacology' 
  | 'pathways' 
  | 'literature' 
  | 'comparative';

export interface ProteinFeature {
  type: 'Active site' | 'Binding site' | 'Domain' | 'Transmembrane' | 'Mutagenesis' | 'Natural variant';
  start: number;
  end: number;
  description: string;
  color?: string;
}

export interface AlphaFoldModel {
  entryId: string;
  gene: string;
  uniprotAccession: string;
  uniprotId: string;
  uniprotDescription: string;
  organismScientificName: string;
  taxId: number;
  uniprotStart: number;
  uniprotEnd: number;
  cifUrl: string;
  bcifUrl: string;
  pdbUrl: string;
  paeDocUrl?: string;
  paeImageUrl?: string;
  globalPlddt: number;
  plddtDistribution: {
    veryHigh: number; // > 90
    confident: number; // 70 - 90
    low: number; // 50 - 70
    veryLow: number; // < 50
  };
}

export interface PdbStructure {
  pdbId: string;
  title: string;
  experimentalMethod: string;
  resolution?: number; // in Angstroms
  depositedDate: string;
  molecularWeight: number; // in kDa
  polymerCount: number;
  cifUrl: string;
  pdbUrl: string;
  sourceUrl: string;
}

export interface GenomicVariant {
  id: string;
  rsId?: string;
  hgvsC: string;
  hgvsP: string;
  residuePosition: number;
  refResidue: string;
  altResidue: string;
  clinicalSignificance: 'Pathogenic' | 'Likely Pathogenic' | 'VUS' | 'Likely Benign' | 'Benign';
  reviewStatus: string; // e.g. "reviewed by expert panel", "criteria provided"
  stars: number; // 0 - 4 stars
  condition: string;
  gnomadAf?: number;
  consequence: string;
}

export interface DrugCompound {
  cid: number;
  name: string;
  brandNames: string[];
  chemblId?: string;
  canonicalSmiles: string;
  molecularFormula: string;
  molecularWeight: number;
  xLogP: number;
  tpsa: number; // Polar Surface Area in Å²
  hBondDonorCount: number;
  hBondAcceptorCount: number;
  rotatableBondCount: number;
  complexity: number;
  mechanismOfAction: string;
  targetBindingType: 'Inhibitor' | 'Antagonist' | 'Agonist' | 'Activator' | 'Allosteric Modulator';
  clinicalPhase: 1 | 2 | 3 | 4;
  approvalYear?: number;
  fdaApproved: boolean;
  standardType: 'IC50' | 'Ki' | 'Kd' | 'EC50';
  affinityValue: number; // in nM
  affinityUnit: string;
  description: string;
}

export interface BiologicalPathway {
  id: string;
  name: string;
  database: 'Reactome' | 'KEGG' | 'GO:BP';
  category: string;
  numEntities: number;
  description: string;
  diagramUrl?: string;
  keyMolecules: string[];
}

export interface PpiPartner {
  partnerGene: string;
  partnerName: string;
  uniprotAccession: string;
  interactionScore: number; // 0.0 - 1.0 (STRING score)
  evidenceType: 'Experimentally determined' | 'Database curated' | 'Text mining' | 'Co-expression';
  role: string;
}

export interface LiteratureItem {
  pmid: string;
  doi: string;
  title: string;
  journal: string;
  year: number;
  authors: string[];
  abstract: string;
  citationCount: number;
  meshTerms: string[];
  isClinicalTrial?: boolean;
}

export interface BioscienceTarget {
  id: string; // e.g. "TP53"
  symbol: string;
  name: string;
  uniprotAccession: string;
  uniprotId: string;
  organism: string;
  chromosomeLocus: string;
  functionSummary: string;
  sequence: string;
  sequenceLength: number;
  subcellularLocation: string[];
  features: ProteinFeature[];
  alphaFold: AlphaFoldModel;
  experimentalPdb: PdbStructure;
  variants: GenomicVariant[];
  drugs: DrugCompound[];
  pathways: BiologicalPathway[];
  ppiPartners: PpiPartner[];
  literature: LiteratureItem[];
}
