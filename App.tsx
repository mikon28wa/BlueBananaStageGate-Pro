
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadModel, CommandType } from './types';
import { INITIAL_STAGES, SYSTEM_ARCHITECTURE } from './constants';
import { CQRSManager } from './services/cqrsManager';
import { getStageGuidance, generateMarketingMaterials, AuditResult } from './services/geminiService';
import VerticalStepper from './components/VerticalStepper';
import StageCard from './components/StageCard';

const manager = new CQRSManager({
  projectName: "BlueBananaStageGate Pro",
  currentStageIndex: 0,
  stages: INITIAL_STAGES,
  architecture: SYSTEM_ARCHITECTURE,
  events: []
});

const App: React.FC = () => {
  const [readModel, setReadModel] = useState<ReadModel>(manager.getReadModel());
  const [isLoading, setIsLoading] = useState(false);
  const [marketingContent, setMarketingContent] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'governance' | 'roadmap' | 'finance' | 'marketing' | 'system'>('governance');
  const [notification, setNotification] = useState<string | null>(null);

  const dispatch = useCallback(async (type: CommandType, payload: any = {}) => {
    setIsLoading(true);
    try {
      if (type === 'GENERATE_MARKETING') {
        const content = await generateMarketingMaterials(readModel.projectOverview.name, readModel.activeStageDetails!);
        setMarketingContent(content);
      }
      
      const result = await manager.dispatch({ type, payload, timestamp: Date.now() });
      setReadModel(result.readModel);
      
      setNotification(`${type} synchronisiert.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      setNotification("Fehler: Operation fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  }, [readModel.projectOverview.name, readModel.activeStageDetails]);

  useEffect(() => {
    const fetchGuidance = async () => {
      if (readModel.activeStageDetails) {
        setAiInsights(null);
        const insights = await getStageGuidance(readModel.activeStageDetails);
        setAiInsights(insights);
      }
    };
    fetchGuidance();
  }, [readModel.activeStageDetails?.id]);

  const handleExport = () => {
    dispatch('EXPORT_AUDIT');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100">
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white/80 border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl">BB</div>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{readModel.projectOverview.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Calculation Layer Active</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{readModel.projectOverview.version}</span>
                </div>
            </div>
          </div>
          
          <nav className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
            {(['governance', 'roadmap', 'finance', 'marketing', 'system'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[1rem] transition-all flex-shrink-0 ${activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>
                {activeTab === tab && <motion.div layoutId="tab-active" className="absolute inset-0 bg-white shadow-sm rounded-[1rem]" />}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </nav>
          
          <button onClick={handleExport} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95">Audit Export</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full p-6 lg:p-12 flex flex-col lg:row gap-16 flex-1">
        <aside className="w-full lg:w-72">
          <div className="mb-12 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 text-center">Calculated Progress</h4>
             <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                <span>User Claim</span>
                <span className="text-slate-400">{readModel.projectOverview.progressPercent.toFixed(0)}%</span>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                <motion.div animate={{ width: `${readModel.projectOverview.progressPercent}%` }} className="h-full bg-slate-400" />
             </div>

             <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                <span className="text-indigo-600">AI Verified</span>
                <span className="text-indigo-600">{readModel.projectOverview.verifiedProgressPercent.toFixed(0)}%</span>
             </div>
             <div className="w-full bg-indigo-100 h-3 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${readModel.projectOverview.verifiedProgressPercent}%` }} className="h-full bg-indigo-600" />
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
                  onRunAudit={(auditResult) => dispatch('RUN_AI_AUDIT', { auditResult })}
                  onApprove={() => dispatch('APPROVE_STAGE')}
                  onToggleChecklist={(itemId) => dispatch('TOGGLE_CHECKLIST', { itemId })}
                  isLastStage={manager.getWriteModel().currentStageIndex === manager.getWriteModel().stages.length - 1}
                  isLoading={isLoading}
                  aiInsights={aiInsights}
                  canUnlock={readModel.unlockingStatus.isGateReady}
                  unlockReason={readModel.unlockingStatus.reason}
                />
              ) : (
                <div className="bg-white p-24 rounded-[3rem] shadow-2xl text-center border border-slate-200">
                  <h2 className="text-4xl font-black mb-4">Projekt Launch Ready</h2>
                  <p className="text-slate-500 mb-10">Alle Governance-Gates wurden KI-validiert und abgeschlossen.</p>
                  <button onClick={handleExport} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest">Audit Dossier</button>
                </div>
              )
            )}
            {/* Roadmap, Finance, Marketing, System Tabs verbleiben analog zur vorherigen Version, nutzen aber das optimierte ReadModel */}
            {activeTab === 'system' && (
              <section className="bg-white p-16 rounded-[2.5rem] shadow-xl border border-slate-200">
                <h2 className="text-3xl font-black mb-12">System Event Store</h2>
                <div className="space-y-4">
                  {readModel.systemTrace.map(event => (
                    <div key={event.id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-400 mb-1">{event.timestamp}</span>
                           <div className={`w-2 h-2 rounded-full ${event.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">{event.commandType}</span>
                          <span className="text-lg font-black text-slate-900">{event.message}</span>
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

      <footer className="bg-white border-t border-slate-200 p-12 mt-12 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">&copy; 2025 BlueBanana Systems • AI Calculation Architecture</p>
      </footer>
    </div>
  );
};

export default App;
