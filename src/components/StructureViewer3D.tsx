import React, { useEffect, useRef, useState } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Sun, 
  Moon, 
  Layers, 
  Eye, 
  Activity,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { AlphaFoldModel, PdbStructure } from '../types/science';
import { buildAlphaFoldDbUrl, buildRcsbStructureUrl } from '../services/scienceApi';

interface StructureViewerProps {
  alphaFold: AlphaFoldModel;
  experimentalPdb: PdbStructure;
  selectedResidue?: number | null;
  onSelectResidue?: (residueNum: number) => void;
}

export const StructureViewer3D: React.FC<StructureViewerProps> = ({
  alphaFold,
  experimentalPdb,
  selectedResidue,
  onSelectResidue
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  
  const [modelType, setModelType] = useState<'alphafold' | 'pdb'>('alphafold');
  const [renderStyle, setRenderStyle] = useState<'cartoon' | 'stick' | 'sphere' | 'surface'>('cartoon');
  const [colorScheme, setColorScheme] = useState<'plddt' | 'spectrum' | 'chain' | 'secondary'>('plddt');
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [isDarkBg, setIsDarkBg] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredAtom, setHoveredAtom] = useState<{ resn: string; resi: number; chain: string; b?: number } | null>(null);

  // Initialize or re-render 3Dmol viewer
  useEffect(() => {
    let active = true;
    const container = containerRef.current;
    if (!container) return;

    const initViewer = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        // Access 3Dmol from window (CDN) or import
        const $3Dmol = (window as any).$3Dmol;
        if (!$3Dmol) {
          throw new Error('3Dmol.js library initializing...');
        }

        // Clean container
        container.innerHTML = '';
        const viewer = $3Dmol.createViewer(container, {
          defaultcolors: $3Dmol.rasmolElementColors,
          backgroundColor: isDarkBg ? '#0f172a' : '#f8fafc',
        });
        viewerRef.current = viewer;

        // Fetch structure file based on modelType
        const fileUrl = modelType === 'alphafold' 
          ? alphaFold.cifUrl 
          : experimentalPdb.cifUrl;

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load ${modelType.toUpperCase()} file (${response.statusText})`);
        }
        const data = await response.text();

        if (!active) return;

        viewer.clear();
        viewer.addModel(data, 'cif');

        applyStyling(viewer);

        // Residue click picking
        viewer.setClickable({}, true, (atom: any) => {
          if (atom && onSelectResidue) {
            onSelectResidue(atom.resi);
            setHoveredAtom({
              resn: atom.resn,
              resi: atom.resi,
              chain: atom.chain || 'A',
              b: atom.b
            });
          }
        });

        // Set spinning state
        if (isSpinning) {
          viewer.spin('y', 1);
        } else {
          viewer.spin(false);
        }

        viewer.zoomTo();
        viewer.render();
      } catch (err: any) {
        console.warn('3Dmol viewer note:', err);
        setLoadError(err.message || 'Failed to initialize WebGL viewport');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      active = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.spin(false);
        } catch (_) {}
      }
    };
  }, [modelType, alphaFold.cifUrl, experimentalPdb.cifUrl, isDarkBg]);

  // Apply styling when style or color scheme changes
  const applyStyling = (viewer: any) => {
    if (!viewer) return;

    viewer.setStyle({}, {}); // Clear style

    const plddtColorFunc = (atom: any) => {
      const b = atom.b ?? 50;
      if (b > 90) return '#0053D6'; // Very high: Deep Blue
      if (b > 70) return '#65CBF3'; // Confident: Light Blue
      if (b > 50) return '#FFDB13'; // Low: Yellow
      return '#FF7D45';             // Very low: Orange
    };

    const styleObj: any = {};

    if (renderStyle === 'cartoon') {
      if (colorScheme === 'plddt' && modelType === 'alphafold') {
        styleObj.cartoon = { colorfunc: plddtColorFunc };
      } else if (colorScheme === 'spectrum') {
        styleObj.cartoon = { color: 'spectrum' };
      } else if (colorScheme === 'secondary') {
        styleObj.cartoon = { color: 'ss' };
      } else {
        styleObj.cartoon = { color: '#38bdf8' };
      }
    } else if (renderStyle === 'stick') {
      styleObj.stick = { radius: 0.2, colorscheme: 'Jmol' };
    } else if (renderStyle === 'sphere') {
      styleObj.sphere = { scale: 0.8, colorscheme: 'Jmol' };
    } else if (renderStyle === 'surface') {
      styleObj.cartoon = { color: '#94a3b8', opacity: 0.4 };
      try {
        const SurfaceType = (window as any).$3Dmol?.SurfaceType?.VDW ?? 1;
        viewer.addSurface(SurfaceType, { opacity: 0.7, color: 'spectrum' });
      } catch (_) {}
    }

    viewer.setStyle({}, styleObj);

    // If a residue is selected, highlight it prominently
    if (selectedResidue) {
      viewer.setStyle({ resi: selectedResidue }, {
        stick: { radius: 0.45, color: '#f43f5e' },
        sphere: { scale: 0.6, color: '#f43f5e' }
      });
    }

    viewer.render();
  };

  useEffect(() => {
    if (viewerRef.current) {
      applyStyling(viewerRef.current);
    }
  }, [renderStyle, colorScheme, selectedResidue]);

  const handleToggleSpin = () => {
    const next = !isSpinning;
    setIsSpinning(next);
    if (viewerRef.current) {
      if (next) {
        viewerRef.current.spin('y', 1);
      } else {
        viewerRef.current.spin(false);
      }
    }
  };

  const handleResetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
      viewerRef.current.render();
    }
  };

  const handleZoom = (factor: number) => {
    if (viewerRef.current) {
      viewerRef.current.zoom(factor);
      viewerRef.current.render();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Viewport Header Controls */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Model Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg">
          <button
            onClick={() => setModelType('alphafold')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              modelType === 'alphafold'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            AlphaFold Prediction (v6)
            <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono font-bold">
              {alphaFold.globalPlddt} pLDDT
            </span>
          </button>
          
          <button
            onClick={() => setModelType('pdb')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              modelType === 'pdb'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            RCSB PDB ({experimentalPdb.pdbId})
            <span className="text-[10px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-mono font-bold">
              {experimentalPdb.resolution} Å
            </span>
          </button>
        </div>

        {/* Viewport Representation and Color Options */}
        <div className="flex items-center gap-2">
          {/* Style selector */}
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={renderStyle}
              onChange={(e) => setRenderStyle(e.target.value as any)}
              className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-slate-800"
            >
              <option value="cartoon">Cartoon (Ribbon)</option>
              <option value="stick">Sticks (Bonds)</option>
              <option value="sphere">Spheres (CPK VDW)</option>
              <option value="surface">Surface Overlay</option>
            </select>
          </div>

          {/* Color scheme selector */}
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as any)}
              className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-slate-800"
            >
              <option value="plddt">AlphaFold pLDDT</option>
              <option value="spectrum">Spectrum (N-to-C)</option>
              <option value="secondary">Secondary Structure</option>
            </select>
          </div>

          {/* Background Toggle */}
          <button
            onClick={() => setIsDarkBg(!isDarkBg)}
            title="Toggle Light/Dark WebGL Background"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            {isDarkBg ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[460px] bg-slate-900 overflow-hidden">
        <div 
          ref={containerRef} 
          className="w-full h-full relative cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: isDarkBg ? '#0f172a' : '#f8fafc' }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10">
            <RotateCw className="w-8 h-8 text-blue-400 animate-spin mb-2" />
            <p className="text-xs font-mono text-slate-300">
              Retrieving macromolecular coordinates for {modelType === 'alphafold' ? alphaFold.uniprotAccession : experimentalPdb.pdbId}...
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-slate-200 z-10">
            <Info className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">3D WebGL Coordinate Viewer</p>
            <p className="text-xs text-slate-400 max-w-md mb-4">{loadError}</p>
            <a
              href={modelType === 'alphafold' ? buildAlphaFoldDbUrl(alphaFold.uniprotAccession) : buildRcsbStructureUrl(experimentalPdb.pdbId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
            >
              Open in {modelType === 'alphafold' ? 'AlphaFold DB' : 'RCSB PDB'} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Floating Quick Action Overlay Buttons */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 shadow-lg z-20">
          <button
            onClick={handleToggleSpin}
            title={isSpinning ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              isSpinning ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset Camera & Center"
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
          <button
            onClick={() => handleZoom(1.2)}
            title="Zoom In"
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            title="Zoom Out"
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Residue Inspector Badge */}
        {hoveredAtom && (
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 text-white text-xs shadow-xl z-20 font-mono">
            <span className="text-blue-400 font-bold">{hoveredAtom.resn}</span> #{hoveredAtom.resi} (Chain {hoveredAtom.chain})
            {hoveredAtom.b !== undefined && (
              <span className="ml-2 text-slate-300 text-[11px]">
                pLDDT: <span className="font-bold text-amber-300">{hoveredAtom.b.toFixed(1)}</span>
              </span>
            )}
          </div>
        )}

        {/* Source Link & Download Button */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
          <a
            href={modelType === 'alphafold' ? alphaFold.pdbUrl : experimentalPdb.pdbUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            title="Download Coordinate File (.pdb / .cif)"
            className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium rounded-md backdrop-blur-md flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download {modelType === 'alphafold' ? 'AlphaFold PDB' : `${experimentalPdb.pdbId}.pdb`}
          </a>
        </div>
      </div>

      {/* Model Provenance Banner */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          {modelType === 'alphafold' ? (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                [Predicted by model]
              </span>
              <span>AlphaFold DB v6 prediction • {alphaFold.gene} ({alphaFold.organismScientificName})</span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800">
                [Experimentally determined]
              </span>
              <span>RCSB PDB {experimentalPdb.pdbId} • {experimentalPdb.experimentalMethod} ({experimentalPdb.resolution} Å)</span>
            </>
          )}
        </div>

        <a
          href={modelType === 'alphafold' ? buildAlphaFoldDbUrl(alphaFold.uniprotAccession) : buildRcsbStructureUrl(experimentalPdb.pdbId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
        >
          View on {modelType === 'alphafold' ? 'AlphaFold DB' : 'RCSB.org'}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
