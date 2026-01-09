
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadModel, CommandType, User, ProductStage } from '../types';
import StageCard from '../components/StageCard';
import VerticalStepper from '../components/VerticalStepper';

interface GovernanceProps {
  readModel: ReadModel;
  currentUser: User;
  dispatch: (type: CommandType, payload?: any) => void;
  stages: ProductStage[];
  currentStageIndex: number;
}

const Governance: React.FC<GovernanceProps> = ({ readModel, currentUser, dispatch, stages, currentStageIndex }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-10 h-full">
      {/* Sidebar - Nur auf der Governance Seite sichtbar */}
      <aside className="w-full lg:w-[360px] shrink-0 flex flex-col gap-8">
        
        {/* Integrity Widget */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8 text-center">System Integrity</h4>
             <div className="flex justify-center mb-8 relative">
                <svg className="w-40 h-40 transform -rotate-90 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                  <circle cx="80" cy="80" r="70" stroke="#6366f1" strokeWidth="6" fill="transparent" strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * readModel.projectOverview.integrityScore) / 100} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white tracking-tighter">{readModel.projectOverview.integrityScore}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                </div>
             </div>
             <div className="flex justify-between items-center bg-black/20 rounded-xl p-4 border border-white/5">
               <div className="flex flex-col">
                 <span className="text-[9px] text-slate-400 uppercase tracking-wider">Balance</span>
                 <span className="text-xs font-bold text-white">Automated</span>
               </div>
               <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${readModel.projectOverview.governanceBalance}%` }} />
               </div>
             </div>
        </div>

        {/* Stepper */}
        <VerticalStepper stages={stages} currentIndex={currentStageIndex} />
        
        {/* Infra Widget */}
        <div className="mt-auto bg-[#0b1120] border border-slate-800 rounded-[2rem] p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase text-slate-500 mb-0.5">Deployment</p>
             <p className="text-xs font-bold text-emerald-400">{readModel.infrastructure.region}</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
            {readModel.activeStageDetails ? (
              <StageCard 
                key="stage-card"
                stage={readModel.activeStageDetails}
                currentUser={currentUser}
                onUpload={(files) => dispatch('UPLOAD_DOCUMENTS', { files })}
                onRunAudit={() => dispatch('TRIGGER_AI_AUDIT')}
                onOverride={(justification) => dispatch('GOVERNANCE_OVERRIDE', { justification })}
                onApprove={() => dispatch('APPROVE_STAGE')}
                onToggleChecklist={(itemId) => dispatch('TOGGLE_CHECKLIST', { itemId })}
                isLastStage={currentStageIndex === stages.length - 1}
                isLoading={readModel.unlockingStatus.isProcessing}
                aiInsights={readModel.activeStageDetails.aiInsights || null}
                canUnlock={readModel.unlockingStatus.isGateReady}
                isOverrideAvailable={readModel.unlockingStatus.isOverrideAvailable}
                unlockReason={readModel.unlockingStatus.reason}
                actionPlan={readModel.unlockingStatus.actionPlan}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 text-center p-20">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30">
                   <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-4xl font-black text-white mb-4">Governance Certified</h2>
                <p className="text-slate-400 text-lg max-w-lg mb-12">All stages completed successfully. The audit log has been sealed and stored immutably.</p>
                <button onClick={() => dispatch('GENERATE_ISO_COMPLIANCE_REPORT')} className="bg-white text-slate-900 px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-xl">
                  Download ISO Report
                </button>
              </div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Governance;
