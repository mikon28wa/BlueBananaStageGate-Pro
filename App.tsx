
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadModel, CommandType } from './types';
import { INITIAL_STAGES, SYSTEM_ARCHITECTURE } from './constants';
import { CQRSManager } from './services/cqrsManager';
import VerticalStepper from './components/VerticalStepper';
import StageCard from './components/StageCard';

// INFRASTRUCTURE INITIALIZATION
const manager = new CQRSManager({
  projectName: "BlueBanana Intelligence Pro",
  currentStageIndex: 0,
  stages: INITIAL_STAGES,
  architecture: SYSTEM_ARCHITECTURE,
  events: [],
  isChainVerified: false
});

const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [readModel, setReadModel] = useState<ReadModel>(manager.getReadModel());
  const [activeTab, setActiveTab] = useState<'governance' | 'roadmap' | 'finance' | 'marketing' | 'system'>('governance');
  const [notification, setNotification] = useState<string | null>(null);

  const dispatch = useCallback(async (type: CommandType, payload: any = {}) => {
    try {
      const result = await manager.dispatch({ type, payload, timestamp: Date.now() });
      setReadModel(result.readModel);
      
      if (type !== 'RECEIVE_AI_RESULT') {
        setNotification(`${type} Record Sealed`);
        setTimeout(() => setNotification(null), 3000);
      }

      // Handle file download for export
      if (type === 'EXPORT_AUDIT') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.readModel.systemTrace, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "ISO_AUDIT_DOSSIER.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    } catch (e: any) {
      setNotification(`Audit Block: ${e.message}`);
      setTimeout(() => setNotification(null), 4000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-slate-900 selection:bg-indigo-100">
      <AnimatePresence>
        {notification && (
          <MotionDiv initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-12 py-6 rounded-full shadow-3xl flex items-center gap-6 border border-slate-700">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_#6366f1]" />
            <span className="text-xs font-black uppercase tracking-[0.35em] font-mono">{notification}</span>
          </MotionDiv>
        )}
      </AnimatePresence>

      <header className="bg-white/95 border-b border-slate-100 sticky top-0 z-[100] backdrop-blur-3xl">
        <div className="max-w-[1750px] mx-auto px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-transparent opacity-20" />
               <span className="relative z-10 font-mono tracking-tighter">BB</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{readModel.projectOverview.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] px-4 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100">Deterministic Audit Layer 3.5</span>
                <span className={`text-[10px] font-bold font-mono ${readModel.projectOverview.isChainValid ? 'text-emerald-500' : 'text-slate-400'}`}>
                   {readModel.projectOverview.isChainValid ? 'CHAIN VERIFIED' : 'SYNCED'}
                </span>
              </div>
            </div>
          </div>
          
          <nav className="flex bg-slate-100 p-2 rounded-[2rem]">
            {(['governance', 'roadmap', 'finance', 'marketing', 'system'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all ${activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>
                {activeTab === tab && <MotionDiv layoutId="nav-pill-enterprise" className="absolute inset-0 bg-white shadow-xl rounded-2xl" />}
                <span className="relative z-10">{tab === 'system' ? 'Audit Proofs' : tab}</span>
              </button>
            ))}
          </nav>
          
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-300 uppercase mb-1">Audit Status</span>
               <span className={`text-[11px] font-black uppercase ${readModel.projectOverview.auditStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {readModel.projectOverview.auditStatus}
               </span>
            </div>
            <button onClick={() => dispatch('EXPORT_AUDIT')} className="bg-slate-900 text-white px-10 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl active:scale-95">Download Evidence</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1750px] mx-auto w-full p-10 lg:p-20 flex flex-col lg:flex-row gap-24 flex-1">
        <aside className="w-full lg:w-[380px] shrink-0">
          <div className="mb-16 space-y-10">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-3xl relative overflow-hidden">
               <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.35em] mb-12 text-center">Immutable Progress Chain</h4>
               
               <div className="flex flex-col items-center mb-12">
                  <div className="relative">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="414.69" strokeDashoffset={414.69 - (414.69 * readModel.projectOverview.integrityScore) / 100} className="text-indigo-600 transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black tracking-tighter">{readModel.projectOverview.integrityScore}%</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Hash Confirmed</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest font-mono">
                    <span>Block ID</span>
                    <span className="text-indigo-600">v3.5.0-OK</span>
                  </div>
                  <div className="w-full bg-slate-50 h-4 rounded-full overflow-hidden border border-slate-100 p-1">
                    <MotionDiv 
                      animate={{ width: `${readModel.projectOverview.verifiedProgressPercent}%` }} 
                      className="h-full bg-indigo-600 rounded-full" 
                    />
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-30" />
              <h4 className="text-[11px] font-black uppercase opacity-40 tracking-[0.35em] mb-10 text-center">Single Source of Truth</h4>
              <p className="text-[10px] text-center font-medium text-slate-400 leading-relaxed uppercase tracking-widest">Alle Zustandsänderungen werden deterministisch im Event-Store mit Zeitstempel protokolliert.</p>
            </div>
          </div>

          <VerticalStepper stages={manager.getWriteModel().stages} currentIndex={manager.getWriteModel().currentStageIndex} />
        </aside>

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'governance' && (
              readModel.activeStageDetails ? (
                <StageCard 
                  stage={readModel.activeStageDetails} 
                  onUpload={(files) => dispatch('UPLOAD_DOCUMENTS', { files })}
                  onRunAudit={() => dispatch('TRIGGER_AI_AUDIT')}
                  onOverride={(justification) => dispatch('GOVERNANCE_OVERRIDE', { justification })}
                  onApprove={() => dispatch('APPROVE_STAGE')}
                  onToggleChecklist={(itemId) => dispatch('TOGGLE_CHECKLIST', { itemId })}
                  isLastStage={manager.getWriteModel().currentStageIndex === manager.getWriteModel().stages.length - 1}
                  isLoading={readModel.unlockingStatus.isProcessing}
                  aiInsights={readModel.activeStageDetails.aiInsights || null}
                  canUnlock={readModel.unlockingStatus.isGateReady}
                  isOverrideAvailable={readModel.unlockingStatus.isOverrideAvailable}
                  unlockReason={readModel.unlockingStatus.reason}
                />
              ) : (
                <div className="bg-white p-40 rounded-[5rem] shadow-4xl text-center border border-slate-100">
                  <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-12 shadow-inner border border-emerald-100">
                    <svg className="w-16 h-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-6xl font-black mb-8 tracking-tighter">Audit Finalized</h2>
                  <p className="text-2xl text-slate-500 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">Der deterministische Projekt-Status ist vollständig validiert und bereit für die externe Zertifizierung.</p>
                  <button onClick={() => dispatch('EXPORT_AUDIT')} className="bg-slate-900 text-white px-16 py-7 rounded-[2rem] font-black uppercase tracking-[0.35em] shadow-4xl hover:bg-indigo-600 transition-all font-mono">Sign & Seal Audit Log</button>
                </div>
              )
            )}

            {activeTab === 'system' && (
              <section className="bg-white p-24 rounded-[5rem] shadow-4xl border border-slate-100">
                <div className="flex justify-between items-end mb-20">
                  <div>
                    <h2 className="text-5xl font-black mb-6 tracking-tight">Audit-Engine Evidence</h2>
                    <p className="text-slate-500 text-xl font-medium">Unveränderbare Historie der Projekt-Gouvernance (Chain of Custody).</p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <button 
                      onClick={() => dispatch('VERIFY_CHAIN')}
                      className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                        readModel.projectOverview.isChainValid 
                        ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {readModel.projectOverview.isChainValid ? '✓ Integrity Verified' : 'Verify Hash Chain'}
                    </button>
                    <span className="text-[10px] font-black text-slate-400 uppercase font-mono">Audit-Key: BB-ISO-9001-2025</span>
                  </div>
                </div>
                <div className="space-y-4 max-h-[900px] overflow-y-auto pr-8 hide-scrollbar">
                  {readModel.systemTrace.map((event, index) => (
                    <div key={event.id} className="relative">
                      {index < readModel.systemTrace.length - 1 && (
                         <div className="absolute left-[3.5rem] bottom-[-1rem] w-0.5 h-4 bg-slate-100 flex flex-col items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1" />
                         </div>
                      )}
                      <div className={`p-10 rounded-[3rem] border-2 transition-all flex items-center justify-between group ${event.category === 'INNOVATION' ? 'bg-indigo-50/20 border-indigo-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-12">
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-black text-slate-400 mb-2 font-mono">{event.timestamp}</span>
                             <div className={`w-4 h-4 rounded-full ${event.category === 'INNOVATION' ? 'bg-indigo-600' : 'bg-slate-900'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-4 mb-2">
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${event.category === 'INNOVATION' ? 'text-indigo-600' : 'text-slate-500'}`}>{event.commandType}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono font-bold text-slate-400 px-3 py-1 bg-white rounded-lg border border-slate-100">PREV: {event.previousHash}</span>
                                <span className="text-slate-200">→</span>
                                <span className="text-[9px] font-mono font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">{event.auditHash}</span>
                              </div>
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tight">{event.message}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                           <span className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-all shadow-sm">Immutable Proof</span>
                           <span className="text-[9px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">UUID: {event.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-100 p-20 mt-24 opacity-40">
        <div className="max-w-[1750px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl font-mono">BB</div>
             <span className="text-[11px] font-black uppercase tracking-[0.4em]">BlueBanana Deterministic Governance Single Source of Truth</span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] font-mono">ISO VERIFIED: {readModel.projectOverview.isChainValid ? 'TRUE' : 'PENDING'}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
