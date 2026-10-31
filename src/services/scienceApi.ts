export async function fetchAlphaFoldMetadata(uniprotAccession: string) {
  try {
    const clean = uniprotAccession.trim().toUpperCase();
    const res = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${clean}`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (e) {
    console.warn('AlphaFold API fetch failed:', e);
    return null;
  }
}

export async function fetchPdbMetadata(pdbId: string) {
  try {
    const clean = pdbId.trim().toLowerCase();
    const res = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${clean}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('RCSB PDB API fetch failed:', e);
    return null;
  }
}

export async function fetchPubChemCompound(nameOrCid: string | number) {
  try {
    let cid = typeof nameOrCid === 'number' ? nameOrCid : null;
    if (!cid && typeof nameOrCid === 'string') {
      const cidRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(nameOrCid)}/cids/JSON`);
      if (cidRes.ok) {
        const json = await cidRes.json();
        cid = json?.IdentifierList?.CID?.[0];
      }
    }
    if (!cid) return null;

    const propRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,Complexity/JSON`);
    if (!propRes.ok) return null;
    const propJson = await propRes.json();
    const props = propJson?.PropertyTable?.Properties?.[0];
    return {
      cid,
      ...props
    };
  } catch (e) {
    console.warn('PubChem fetch failed:', e);
    return null;
  }
}

export function buildAlphaGenomeAtlasUrl(query: string, mode: 'variant' | 'locus' | 'table' = 'variant'): string {
  const base = 'https://deepmind.google.com/science/alphagenome/atlas';
  const params = new URLSearchParams({
    q: query,
    mode: mode
  });
  return `${base}?${params.toString()}`;
}

export function buildRcsbStructureUrl(pdbId: string): string {
  return `https://www.rcsb.org/structure/${pdbId.toUpperCase()}`;
}

export function buildAlphaFoldDbUrl(uniprotAccession: string): string {
  return `https://alphafold.ebi.ac.uk/entry/${uniprotAccession.toUpperCase()}`;
}

export function buildUniProtUrl(uniprotAccession: string): string {
  return `https://www.uniprot.org/uniprotkb/${uniprotAccession.toUpperCase()}`;
}

export function buildPubChemUrl(cid: number): string {
  return `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
}

export function buildClinVarUrl(rsIdOrHgvs: string): string {
  return `https://www.ncbi.nlm.nih.gov/clinvar/?term=${encodeURIComponent(rsIdOrHgvs)}`;
}
