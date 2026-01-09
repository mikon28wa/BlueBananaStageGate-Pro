import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntegrationStatus, InfrastructureConfig } from '../types';
import { MOCK_THREAD_EVENTS, MOCK_SYSTEMS } from '../mockDigitalThreadData';
import { ThreadEvent } from '../digitalThreadModel';

interface IntegrationMatrixProps {
  integrations: IntegrationStatus[];
  infra: InfrastructureConfig;
  onSync: (id: string) => void;
  onInfraSwitch: (type: string) => void;
  onAnalyze: () => void;
  story?: string | null;
  isAnalyzing?: boolean;
}

const MotionDiv = motion.div as any;

const SystemNode = ({ status, type, label, x, y, delay }: any) => (
  <MotionDiv
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay }}
    className={`absolute w-32 h-32 rounded-full flex flex-col items-center justify-center z-20 shadow-2xl backdrop-blur-sm border-4 ${
      status === 'CONNECTED' ? 'bg-slate-900/90 border-emerald-500' :
      status === 'SYNCING' ? 'bg-slate-900/90 border-indigo-500' :
      'bg-slate-800/90 border-rose-500'
    }`}
    style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
  >
    <div className={`w-3 h-3 rounded-full absolute top-2 right-4 ${status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{type}</span>
    <span className="text-xs font-bold text-white text-center px-2">{label}</span>
  </MotionDiv>
);

const DataLine = ({ start, end, status }: any) => {
   if (status === 'DISCONNECTED') return null;
   return (
     <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
       <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={status === 'SYNCING' ? '#6366f1' : '#10b981'} strokeWidth="2" strokeOpacity="0.3" />
       <motion.circle r="3" fill={status === 'SYNCING' ? '#6366f1' : '#10b981'}>
         <animateMotion 
           dur={status === 'SYNCING' ? '1s' : '3s'}
           repeatCount="indefinite"
           path={`M${start.x},${start.y} L${end.x},${end.y}`}
         />
       </motion.circle>
     </svg>
   );
};

const IntegrationMatrix: React.FC<IntegrationMatrixProps> = ({ integrations, infra, onSync, onInfraSwitch, onAnalyze, story, isAnalyzing }) => {
  const [activeEvents, setActiveEvents] = useState<ThreadEvent[]>([]);

  // Simulation: Feed the MOCK_THREAD_EVENTS one by one to create a "live" feel
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < MOCK_THREAD_EVENTS.length) {
        // Add next event
        setActiveEvents(prev => [MOCK_THREAD_EVENTS[index], ...prev].slice(0, 7));
        index++;
      } else {
        // Loop or stop - let's loop with a pause
        index = 0;
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Positions for radial layout
  const center = { x: '50%', y: '50%' };
  const positions = [
    { x: '20%', y: '20%' }, // Top Left
    { x: '80%', y: '20%' }, // Top Right
    { x: '20%', y: '80%' }, // Bottom Left
    { x: '80%', y: '80%' }, // Bottom Right
  ];

  // Helper to resolve System Name from ID
  const getSystemName = (id: string) => MOCK_SYSTEMS.find(s => s.id === id)?.name || id;

  return (
    <div className="h-full flex flex-col gap-8">
      
      {/* Visual Topology */}
      <div className="relative h-[500px] bg-[#0b1120] rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)' }} />

         {/* Center Hub */}
         <MotionDiv className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-600 rounded-full flex items-center justify-center z-30 shadow-[0_0_60px_rgba(79,70,229,0.5)] border-4 border-indigo-400">
            <div className="text-center">
               <span className="block text-[10px] font-black uppercase text-indigo-200 tracking-widest mb-1">Hub</span>
               <span className="block text-xl font-black text-white">BlueBanana</span>
               <span className="block text-[9px] font-mono text-indigo-200 mt-2">v3.0 Core</span>
            </div>
         </MotionDiv>

         {/* Satellites & Lines */}
         {integrations.map((int, idx) => (
            <React.Fragment key={int.id}>
               <DataLine start={{ x: '50%', y: '50%' }} end={positions[idx]} status={int.status} />
               <SystemNode 
                  x={positions[idx].x} 
                  y={positions[idx].y} 
                  status={int.status} 
                  type={int.type} 
                  label={int.systemName} 
                  delay={idx * 0.2} 
               />
            </React.Fragment>
         ))}

         {/* Live Traffic Badge */}
         <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur rounded-full px-4 py-2 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400">DIGITAL THREAD ACTIVE • {MOCK_THREAD_EVENTS.length} EVENTS LOADED</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Live Protocol */}
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[300px]">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Digital Thread Event Stream</h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
               <AnimatePresence>
                  {activeEvents.map(evt => (
                     <MotionDiv 
                        key={`${evt.id}-${Math.random()}`} // Ensure uniqueness for re-renders
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-1 text-[10px] p-3 bg-slate-50 rounded-xl border border-slate-100"
                     >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-indigo-700 text-xs">{evt.activity}</span>
                            <span className="font-mono text-slate-400">{evt.timestamp}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                           <div className="flex items-center gap-2">
                               <span className="font-bold text-slate-600 bg-slate-200 px-1.5 rounded">{getSystemName(evt.sourceSystemId)}</span>
                               {evt.targetSystemId && <span className="text-slate-400">&rarr;</span>}
                               {evt.targetSystemId && <span className="font-bold text-slate-600 bg-slate-200 px-1.5 rounded">{getSystemName(evt.targetSystemId)}</span>}
                           </div>
                           <span className="text-[9px] text-slate-400">by {evt.actor}</span>
                        </div>
                        {evt.dataQualityFlags && evt.dataQualityFlags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                                {evt.dataQualityFlags.map(flag => (
                                    <span key={flag} className="text-[8px] font-black text-rose-500 border border-rose-200 bg-rose-50 px-1 rounded">{flag}</span>
                                ))}
                            </div>
                        )}
                     </MotionDiv>
                  ))}
               </AnimatePresence>
            </div>
         </div>

         {/* AI Story */}
         <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col h-[300px]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
             
             <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xs font-black uppercase text-indigo-300 tracking-widest mb-2">Ecosystem Intelligence</h4>
                  <h3 className="text-2xl font-black">The Integration Story</h3>
                </div>
                <button 
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                   {isAnalyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                </button>
             </div>

             <div className="relative z-10 flex-1 flex flex-col justify-center">
                {story ? (
                   <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-medium leading-relaxed text-indigo-100">
                      "{story}"
                   </motion.p>
                ) : (
                   <div className="text-center opacity-50">
                      <p className="text-sm">Click the flash icon to generate a live ecosystem report.</p>
                   </div>
                )}
             </div>
             
             <div className="relative z-10 mt-auto flex items-center gap-4 pt-6 border-t border-white/10">
                <div className="flex -space-x-2">
                   {integrations.slice(0,3).map(i => (
                      <div key={i.id} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold">
                         {i.systemName[0]}
                      </div>
                   ))}
                </div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Analysis Sources Connected</span>
             </div>
         </div>
      </div>
    </div>
  );
};

export default IntegrationMatrix;