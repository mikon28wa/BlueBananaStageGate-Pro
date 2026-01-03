
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductStage, StageStatus, DependencyResult } from '../types';

interface StageCardProps {
  stage: ProductStage;
  onUpload: (files: File[]) => void;
  onRunAudit: () => void;
  onApprove: () => void;
  onToggleChecklist: (itemId: string) => void;
  onOverride: (justification: string) => void;
  isLastStage: boolean;
  isLoading: boolean;
  aiInsights: string | null;
  canUnlock: boolean;
  isOverrideAvailable: boolean;
  unlockReason?: string;
}

const MotionArticle = motion.article as any;
const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

const StageCard: React.FC<StageCardProps> = ({ 
  stage, onUpload, onRunAudit, onApprove, onToggleChecklist, onOverride, 
  isLastStage, isLoading, aiInsights, canUnlock, isOverrideAvailable, unlockReason 
}) => {
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [justification, setJustification] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <MotionArticle 
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[3.5rem] shadow-3xl border border-slate-200 overflow-hidden"
    >
      <header className="bg-slate-50 p-12 lg:p-16 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="px-5 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em]">GATE {stage.id}</span>
            <AnimatePresence>
              {stage.aiStatus === 'VERIFIED' && (
                <MotionDiv initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase shadow-lg shadow-emerald-100">
                   Multi-Doc Verified
                </MotionDiv>
              )}
            </AnimatePresence>
            <div className="px-5 py-2 rounded-full bg-indigo-950 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-900">
               Cross-Check Intelligence Active
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">{stage.title}</h2>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">{stage.description}</p>
        </div>

        <div className="bg-slate-900 p-12 rounded-[2.5rem] text-white shadow-3xl min-w-[280px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <span className="text-[10px] font-black uppercase opacity-40 block mb-3 tracking-[0.3em]">Integrity Index</span>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-6xl font-black">{stage.complianceScore}</span>
            <span className="text-xl opacity-30">%</span>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <MotionDiv initial={{ width: 0 }} animate={{ width: `${stage.complianceScore}%` }} className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]" />
          </div>
        </div>
      </header>

      <div className="p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <section className="lg:col-span-5 space-y-12">
          <div>
            <div className="flex items-center justify-between mb-8">
               <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Human Assurance Layer</h4>
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Manual Sign-off</span>
            </div>
            <div className="space-y-4">
              {stage.checklist.map(item => (
                <button 
                  key={item.id}
                  onClick={() => onToggleChecklist(item.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-6 text-left group ${
                    item.isCompleted ? 'bg-indigo-50 border-indigo-500/20 text-indigo-900 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-active:scale-95 ${item.isCompleted ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                    {item.isCompleted && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-lg font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-transparent" />
             <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-6">Intelligence Stream</h4>
             <div className="prose prose-invert prose-sm font-medium leading-relaxed opacity-90 italic">
                {aiInsights || "Synchronizing artifacts with intelligence layer..."}
             </div>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-12">
          <div>
            <div className="flex items-center justify-between mb-8">
               <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Intelligence Relationship Matrix</h4>
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Automated Cross-Check</span>
            </div>
            
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center group hover:border-indigo-400 transition-all cursor-pointer relative mb-12">
              <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 4v16m8-8H4" /></svg>
              </div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Upload Artifacts</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Targeting: BOM, SCHEMATICS, SPECIFICATIONS</p>
            </div>
            
            <div className="grid gap-4">
              {stage.dependencies.length === 0 ? (
                <div className="p-12 bg-white border border-slate-100 rounded-3xl text-center">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Matrix empty. Run inference to detect relationships.</p>
                </div>
              ) : (
                stage.dependencies.map((dep, i) => (
                  <MotionDiv 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 bg-white border rounded-[1.75rem] flex items-center justify-between shadow-sm transition-all hover:shadow-md ${
                      dep.status === 'CONFLICT' ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100'
                    }`}
                  >
                     <div className="flex items-center gap-6">
                        <div className={`w-3 h-3 rounded-full ${dep.status === 'CONSISTENT' ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-rose-500 animate-pulse shadow-[0_0_12px_#f43f5e]'}`} />
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase">{dep.sourceDoc}</span>
                              <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                              <span className="text-[10px] font-black text-slate-400 uppercase">{dep.targetDoc}</span>
                           </div>
                           <p className={`text-sm font-bold ${dep.status === 'CONFLICT' ? 'text-rose-900' : 'text-slate-900'}`}>{dep.finding}</p>
                        </div>
                     </div>
                     <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${dep.status === 'CONSISTENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-100 text-rose-700'}`}>
                        {dep.status}
                     </span>
                  </MotionDiv>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-10 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={onRunAudit}
                disabled={isLoading || stage.approvalDocuments.length === 0}
                className="py-7 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
              >
                {isLoading && <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                Run Multi-Doc Cross-Check
              </button>

              {isOverrideAvailable && (
                <button onClick={() => setShowOverrideDialog(true)} className="py-7 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-amber-600 transition-all">
                  Manual Intervention
                </button>
              )}
            </div>

            <button 
              onClick={onApprove}
              disabled={!canUnlock || isLoading}
              className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.4em] shadow-3xl disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none hover:bg-black transition-all"
            >
              {isLastStage ? 'Authorize Global Launch' : 'Finalize Stage Intelligence'}
            </button>
            <AnimatePresence>
              {!canUnlock && stage.status !== StageStatus.COMPLETED && (
                <MotionP initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-center font-black text-rose-500 uppercase tracking-[0.3em]">
                  Inconsistency Detected: {unlockReason}
                </MotionP>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showOverrideDialog && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/95 backdrop-blur-xl">
            <MotionDiv initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-3xl">
              <h3 className="text-4xl font-black mb-6 tracking-tight">Governance Mandate</h3>
              <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">Why should this gate be cleared despite Intelligence Layer findings?</p>
              <textarea 
                className="w-full h-48 p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:ring-8 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none font-medium mb-10 text-lg"
                placeholder="Detailed justification..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
              <div className="flex flex-col gap-4">
                <button onClick={() => { onOverride(justification); setShowOverrideDialog(false); }} disabled={!justification.trim()} className="w-full py-7 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl disabled:opacity-30">Issue Override</button>
                <button onClick={() => setShowOverrideDialog(false)} className="w-full py-7 text-slate-400 font-black uppercase text-xs tracking-widest">Cancel</button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionArticle>
  );
};

export default StageCard;
