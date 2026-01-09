
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SYSTEMS, MOCK_ARTIFACTS, MOCK_EDGES, MOCK_THREAD_EVENTS } from '../mockDigitalThreadData';
import { SystemNode, ArtifactNode, EdgeType, ThreadEvent } from '../digitalThreadModel';

const MotionDiv = motion.div as any;

// --- CONFIGURATION ---
const SYSTEM_POSITIONS: Record<string, { x: number, y: number, color: string }> = {
  'sys-bb':   { x: 50, y: 50, color: 'bg-indigo-600 border-indigo-400' },     // Center
  'sys-jira': { x: 20, y: 50, color: 'bg-blue-600 border-blue-400' },         // Left
  'sys-tc':   { x: 50, y: 20, color: 'bg-orange-600 border-orange-400' },     // Top
  'sys-sap':  { x: 80, y: 50, color: 'bg-cyan-700 border-cyan-400' },         // Right
};

const ARTIFACT_OFFSET = 12; // Radius around system

// --- HELPERS ---
const getCoordinates = (id: string, allArtifacts: ArtifactNode[]) => {
  // 1. Check if it is a System
  if (SYSTEM_POSITIONS[id]) {
    return SYSTEM_POSITIONS[id];
  }

  // 2. Check if it is an Artifact
  const artifact = allArtifacts.find(a => a.id === id);
  if (artifact && SYSTEM_POSITIONS[artifact.systemId]) {
    const sysPos = SYSTEM_POSITIONS[artifact.systemId];
    
    // Simple distribution logic: find index among siblings to fan them out
    const siblings = allArtifacts.filter(a => a.systemId === artifact.systemId);
    const index = siblings.findIndex(a => a.id === id);
    const angleStep = (2 * Math.PI) / (siblings.length || 1);
    const angle = index * angleStep - (Math.PI / 2); // Start top

    return {
      x: sysPos.x + (ARTIFACT_OFFSET * Math.cos(angle)), // Adjust X scaling for aspect ratio if needed
      y: sysPos.y + (ARTIFACT_OFFSET * Math.sin(angle)),
      color: 'bg-slate-700 border-slate-500'
    };
  }

  return { x: 0, y: 0, color: 'bg-gray-500' };
};

const DigitalThreadMap: React.FC = () => {
  const [activeEvent, setActiveEvent] = useState<ThreadEvent | null>(null);

  // --- SIMULATION LOOP ---
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setActiveEvent(MOCK_THREAD_EVENTS[index]);
      index = (index + 1) % MOCK_THREAD_EVENTS.length;
    }, 2000); // New event every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // --- VISUAL NODES ---
  const renderSystemNode = (sys: SystemNode) => {
    const pos = SYSTEM_POSITIONS[sys.id];
    if (!pos) return null;

    const isActive = activeEvent?.sourceSystemId === sys.id || activeEvent?.targetSystemId === sys.id;

    return (
      <MotionDiv
        key={sys.id}
        initial={{ scale: 0 }}
        animate={{ scale: isActive ? 1.1 : 1 }}
        className={`absolute w-24 h-24 rounded-full flex flex-col items-center justify-center z-20 shadow-xl border-4 backdrop-blur-md transition-colors duration-500 ${pos.color} ${isActive ? 'shadow-[0_0_30px_rgba(255,255,255,0.3)] ring-2 ring-white' : ''}`}
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">{sys.systemType}</div>
        <div className="text-xs font-bold text-white text-center leading-tight px-2">{sys.name}</div>
      </MotionDiv>
    );
  };

  const renderArtifactNode = (art: ArtifactNode) => {
    const pos = getCoordinates(art.id, MOCK_ARTIFACTS);
    const isActive = activeEvent?.artifactId === art.id;

    return (
      <MotionDiv
        key={art.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: isActive ? 1.2 : 1 }}
        className={`absolute w-12 h-12 rounded-xl flex items-center justify-center z-20 shadow-lg border-2 bg-slate-800 ${isActive ? 'border-indigo-400 bg-indigo-900' : 'border-slate-600'}`}
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="text-[8px] font-mono font-bold text-white text-center leading-none">
          {art.artifactType.substring(0, 3)}<br/>
          <span className="opacity-60">{art.version}</span>
        </div>
      </MotionDiv>
    );
  };

  // --- EDGES ---
  const renderEdge = (edge: any) => {
    const start = getCoordinates(edge.sourceId, MOCK_ARTIFACTS);
    const end = getCoordinates(edge.targetId, MOCK_ARTIFACTS);

    // Determine if this edge is relevant to the active event
    // Simplified logic: If event involves the source system/artifact of this edge
    const isHighlighted = activeEvent && (
        (activeEvent.sourceSystemId === edge.sourceId || activeEvent.artifactId === edge.sourceId) 
    );

    let strokeColor = "#475569"; // Slate-600
    let strokeWidth = "1";
    let strokeDash = "0";
    let animation = null;

    switch (edge.edgeType as EdgeType) {
      case 'TRACE':
        strokeColor = "#94a3b8"; // Slate-400
        strokeDash = "5 5";
        break;
      case 'LIFECYCLE':
        strokeColor = "#e2e8f0"; // Slate-200
        strokeWidth = "2";
        break;
      case 'SYSTEM_FLOW':
        strokeColor = "#6366f1"; // Indigo-500
        strokeWidth = "2";
        animation = (
          <circle r="3" fill="#818cf8">
            <animateMotion dur="1.5s" repeatCount="indefinite" path={`M${start.x},${start.y} L${end.x},${end.y}`} />
          </circle>
        );
        break;
    }

    if (isHighlighted) {
        strokeColor = "#ffffff";
        strokeWidth = "3";
    }

    // Convert % coordinates to approximate SVG viewbox coordinates (assuming 100x100 viewBox for simplicity in math, scaling in CSS)
    // Actually, lines need to use same unit. Let's assume viewbox 0 0 100 100
    return (
      <React.Fragment key={edge.id}>
        {/* The Line */}
        <line 
          x1={start.x} y1={start.y} 
          x2={end.x} y2={end.y} 
          stroke={strokeColor} 
          strokeWidth={strokeWidth} 
          strokeDasharray={strokeDash}
          markerEnd={edge.edgeType === 'LIFECYCLE' ? 'url(#arrow)' : undefined}
          className="transition-all duration-300"
        />
        {/* Animated Dot for System Flow */}
        {animation}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full h-full bg-[#0f172a] rounded-[3rem] shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col">
       
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
       
       {/* Header / Legend */}
       <div className="absolute top-8 left-8 z-30 pointer-events-none">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Digital Thread Map</h2>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
             <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-slate-400 border-dashed border-t border-slate-400" /> Trace</div>
             <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-white" /> Lifecycle</div>
             <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-indigo-500" /> System Flow</div>
          </div>
       </div>

       {/* Active Event Banner */}
       <AnimatePresence mode="wait">
          {activeEvent && (
             <MotionDiv 
                key={activeEvent.id}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-8 right-8 z-30 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl max-w-sm"
             >
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[9px] font-black uppercase opacity-70 tracking-widest">Live Event</span>
                   <span className="text-[9px] font-mono opacity-70">{activeEvent.timestamp}</span>
                </div>
                <p className="text-sm font-bold">{activeEvent.activity}</p>
                <p className="text-[10px] mt-1 opacity-80">
                   {activeEvent.actor} • {activeEvent.sourceSystemId} 
                   {activeEvent.targetSystemId ? ` → ${activeEvent.targetSystemId}` : ''}
                </p>
             </MotionDiv>
          )}
       </AnimatePresence>

       {/* Map Area */}
       <div className="relative w-full h-[600px] mt-12">
          {/* Layer 0: SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
             <defs>
               <marker id="arrow" markerWidth="6" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                 <path d="M0,0 L0,6 L9,3 z" fill="#e2e8f0" />
               </marker>
             </defs>
             {MOCK_EDGES.map(renderEdge)}
          </svg>

          {/* Layer 1: Nodes */}
          {MOCK_SYSTEMS.map(renderSystemNode)}
          {MOCK_ARTIFACTS.map(renderArtifactNode)}
       </div>
    </div>
  );
};

export default DigitalThreadMap;
