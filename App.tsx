
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadModel, CommandType, User } from './types';
import { INITIAL_STAGES, SYSTEM_ARCHITECTURE, INITIAL_INFRASTRUCTURE, INITIAL_INTEGRATIONS, MOCK_USERS } from './constants';
import { CQRSManager } from './services/cqrsManager';
import VerticalStepper from './components/VerticalStepper';
import StageCard from './components/StageCard';
import IntegrationMatrix from './components/IntegrationMatrix';
import RoadmapTimeline from './components/RoadmapTimeline';
import SwotAnalysis from './components/SwotAnalysis';

// INFRASTRUCTURE INITIALIZATION
const manager = new CQRSManager({
  projectName: "BlueBanana Intelligence Pro",
  currentStageIndex: 0,
  stages: INITIAL_STAGES,
  architecture: SYSTEM_ARCHITECTURE,
  infrastructure: INITIAL_INFRASTRUCTURE,
  integrations: INITIAL_INTEGRATIONS,
  events: [],
  isChainVerified: false
});

const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [readModel, setReadModel] = useState<ReadModel>(manager.getReadModel());
  const [activeTab, setActiveTab] = useState<'governance' | 'roadmap' | 'swot' | 'cloud' | 'security' | 'system'>('governance');
  const [notification, setNotification] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default to Project Manager
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dispatch = useCallback(async (type: CommandType, payload: any = {}) => {
    try {
      // Pass currentUser in payload for APPROVE_STAGE and traceability
      const result = await manager.dispatch({ type, payload: { ...payload, user: currentUser }, timestamp: Date.now() });
      setReadModel(result.readModel);
      
      if (type !== 'RECEIVE_AI_RESULT') {
        setNotification(`${type} Processed`);
        setTimeout(() => setNotification(null), 3000);
      }

      if (type === 'GENERATE_ISO_COMPLIANCE_REPORT') {
        const currentReadModel = result.readModel;
        
        // 1. Datenextraktion aus dem ReadModel
        const reportData = {
          reportId: `ISO-${Date.now()}`,
          projectName: currentReadModel.projectOverview.name, 
          timestamp: new Date().toISOString(),
          stage: currentReadModel.activeStageDetails?.title, 
          integrityScore: currentReadModel.projectOverview.integrityScore, 
          auditTrail: currentReadModel.systemTrace, // Der unveränderliche Beweis
          isoNorms: ["ISO 27001", "ISO 9001", "DSGVO Art. 15"] // Deine Referenzwerte
        };

        // 2. Erstellung des Blob (Simuliert PDF/A Struktur)
        const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(jsonBlob);
        
        // 3. Download-Trigger für die Beweislast
        const link = document.createElement('a');
        link.href = url;
        link.download = `KONFORMITÄTSBERICHT_${reportData.projectName.replace(/\s+/g, '_')}_${reportData.stage ? reportData.stage.replace(/\s+/g, '_') : 'ALL'}.pdf`; // PDF-Endung für das Management
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e: any) {
      setNotification(`Safety Block: ${e.message}`);
      setTimeout(() => setNotification(null), 4000);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#0038A8] flex flex-col font-sans text-slate-900 selection:bg-indigo-100">
      <AnimatePresence>
        {notification && (
          <MotionDiv initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-12 py-6 rounded-full shadow-3xl flex items-center gap-6 border border-slate-700">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.35em] font-mono">{notification}</span>
          </MotionDiv>
        )}
      </AnimatePresence>

      <header className="bg-white/90 border-b border-white/10 sticky top-0 z-[100] backdrop-blur-xl">
        <div className="max-w-[1750px] mx-auto px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-transparent opacity-20" />
               <span className="relative z-10 font-mono tracking-tighter">BB</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{readModel.projectOverview.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] px-4 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100">Enterprise Silo-Breaker v3.0</span>
                <span className={`text-[10px] font-bold font-mono ${readModel.projectOverview.isChainValid ? 'text-emerald-500' : 'text-slate-500'}`}>
                   {readModel.projectOverview.isChainValid ? 'CHAIN VERIFIED' : 'SYNCED'}
                </span>
              </div>
            </div>
          </div>
          
          <nav className="flex bg-black/5 p-2 rounded-[2rem]">
            {(['governance', 'roadmap', 'swot', 'cloud', 'security', 'system'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all ${activeTab === tab ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>
                {activeTab === tab && <MotionDiv layoutId="nav-pill-enterprise" className="absolute inset-0 bg-white shadow-xl rounded-2xl" />}
                <span className="relative z-10">
                  {tab === 'swot' ? 'Strategic SWOT' : tab === 'cloud' ? 'Cloud & Integration' : tab === 'security' ? 'IP Whitepaper' : tab}
                </span>
              </button>
            ))}
          </nav>
          
          <div className="hidden lg:flex items-center gap-10">
             {/* User Switcher */}
             <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 bg-white pl-2 pr-6 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                     {currentUser.avatarInitials}
                  </div>
                  <div className="text-left">
                     <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">Signed in as</p>
                     <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <MotionDiv 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                    >
                      {MOCK_USERS.map(user => (
                        <button 
                          key={user.id}
                          onClick={() => { setCurrentUser(user); setShowUserMenu(false); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${currentUser.id === user.id ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${currentUser.id === user.id ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                              {user.avatarInitials}
                           </div>
                           <div>
                              <p className="text-xs font-bold">{user.name}</p>
                              <p className="text-[9px] uppercase font-black opacity-50">{user.role}</p>
                           </div>
                        </button>
                      ))}
                    </MotionDiv>
                  )}
                </AnimatePresence>
             </div>

            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-400 uppercase mb-1">Silo Connectivity</span>
               <span className="text-[11px] font-black uppercase text-indigo-600">
                  {readModel.projectOverview.siloConnectivityScore}%
               </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1750px] mx-auto w-full p-10 lg:p-20 flex flex-col lg:flex-row gap-24 flex-1">
        <aside className="w-full lg:w-[380px] shrink-0">
          <div className="mb-16 space-y-10">
            <div className="bg-white p-12 rounded-[4rem] border border-white/20 shadow-4xl relative overflow-hidden">
               <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.35em] mb-12 text-center">Governance Integrity</h4>
               
               <div className="flex flex-col items-center mb-12">
                  <div className="relative">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="414.69" strokeDashoffset={414.69 - (414.69 * readModel.projectOverview.integrityScore) / 100} className="text-indigo-600 transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black tracking-tighter text-slate-900">{readModel.projectOverview.integrityScore}%</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Balanced</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Innovation</span>
                    <div className="flex-1 h-1.5 mx-4 bg-slate-100 rounded-full overflow-hidden">
                       <MotionDiv animate={{ width: `${readModel.projectOverview.governanceBalance}%` }} className="h-full bg-indigo-500" />
                    </div>
                    <span>Assurance</span>
                  </div>
               </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-10 rounded-[4rem] text-white border border-white/10 shadow-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-50" />
              <h4 className="text-[11px] font-black uppercase opacity-40 tracking-[0.35em] mb-10 text-center">Infrastructure Node</h4>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">{readModel.infrastructure.deploymentType}</span>
              </div>
              <p className="text-[10px] font-medium text-slate-300 leading-relaxed uppercase tracking-widest italic">"{readModel.infrastructure.region}"</p>
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
                  currentUser={currentUser}
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
                  actionPlan={readModel.unlockingStatus.actionPlan}
                />
              ) : (
                <div className="bg-white p-40 rounded-[5rem] shadow-4xl text-center border border-white/20">
                  <h2 className="text-6xl font-black mb-8 tracking-tighter">Governance Certified</h2>
                  <p className="text-2xl text-slate-500 mb-16 max-w-2xl mx-auto font-medium">All systems synced. All silos broken. Audit-Log immutable.</p>
                  <button onClick={() => dispatch('GENERATE_ISO_COMPLIANCE_REPORT')} className="bg-slate-900 text-white px-16 py-7 rounded-[2rem] font-black uppercase tracking-[0.35em] shadow-4xl hover:bg-indigo-600 transition-all">Download ISO Compliance Report</button>
                </div>
              )
            )}

            {activeTab === 'roadmap' && (
              <RoadmapTimeline 
                stages={manager.getWriteModel().stages} 
                currentStageIndex={manager.getWriteModel().currentStageIndex} 
              />
            )}

            {activeTab === 'swot' && (
              readModel.activeStageDetails?.swot ? (
                <SwotAnalysis data={readModel.activeStageDetails.swot} />
              ) : (
                <div className="bg-white/10 backdrop-blur-xl p-32 rounded-[5rem] shadow-4xl text-center border border-white/10">
                  <h2 className="text-5xl font-black mb-8 tracking-tighter text-white">No Strategic Insight Data</h2>
                  <p className="text-xl text-indigo-200 mb-16 max-w-xl mx-auto font-medium">Führen Sie zuerst eine "Enterprise Relation Analysis" im Governance-Tab durch, um strategische SWOT-Daten zu generieren.</p>
                  <button onClick={() => setActiveTab('governance')} className="bg-white text-indigo-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-4xl">Back to Governance</button>
                </div>
              )
            )}

            {activeTab === 'cloud' && (
              <IntegrationMatrix 
                integrations={readModel.integrations}
                infra={readModel.infrastructure}
                onSync={(id) => dispatch('SYNC_INTEGRATION', { systemId: id })}
                onInfraSwitch={(type) => dispatch('SWITCH_INFRASTRUCTURE', { type })}
              />
            )}

            {activeTab === 'security' && (
              <section className="bg-white p-24 rounded-[5rem] shadow-4xl border border-white/20">
                <div className="flex justify-between items-start mb-16">
                  <div>
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-5 py-2 rounded-full mb-6 inline-block">Security Strategy</span>
                    <h2 className="text-5xl font-black tracking-tight mb-4">IP Protection Whitepaper</h2>
                    <p className="text-slate-500 text-xl font-medium">Datensicherheit und Intellectual Property Framework für {readModel.projectOverview.name}.</p>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none bg-slate-50 p-16 rounded-[3.5rem] border border-slate-100 overflow-y-auto max-h-[700px] shadow-inner text-lg leading-relaxed font-medium">
                  {readModel.activeStageDetails?.ipWhitepaper ? (
                    <div dangerouslySetInnerHTML={{ __html: readModel.activeStageDetails.ipWhitepaper.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-slate-400 uppercase font-black text-sm tracking-widest mb-10">Run Multi-Doc Audit to generate project-specific Security Whitepaper.</p>
                      <button onClick={() => dispatch('TRIGGER_AI_AUDIT')} className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest">Generate Security Evidence</button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'system' && (
              <section className="bg-white p-24 rounded-[5rem] shadow-4xl border border-white/20">
                <div className="flex justify-between items-end mb-20">
                   <h2 className="text-5xl font-black tracking-tight">Enterprise Traceability</h2>
                   <button onClick={() => dispatch('VERIFY_CHAIN')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Verify Hash Chain</button>
                </div>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-8 hide-scrollbar">
                  {readModel.systemTrace.map(event => (
                    <div key={event.id} className="p-10 rounded-[3rem] border-2 bg-slate-50 border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-10">
                           <div className={`w-4 h-4 rounded-full ${event.category === 'INFRASTRUCTURE' ? 'bg-indigo-500' : 'bg-slate-900'}`} />
                           <div>
                              <div className="flex items-center gap-4 mb-2">
                                 <span className="text-[10px] font-black uppercase text-slate-400">{event.commandType}</span>
                                 <span className="text-[9px] font-mono text-indigo-400">HASH: {event.auditHash}</span>
                              </div>
                              <span className="text-xl font-black">{event.message}</span>
                           </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-300">{event.timestamp}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
