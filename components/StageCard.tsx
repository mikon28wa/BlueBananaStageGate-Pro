
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductStage, StageStatus, User, UserRole, DigitalSeal, ActionPlanItem } from '../types';

interface StageCardProps {
  stage: ProductStage;
  currentUser: User;
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
  actionPlan?: ActionPlanItem[];
}

const MotionArticle = motion.article as any;
const MotionDiv = motion.div as any;

const RoleBadge = ({ role }: { role: UserRole }) => {
  const labels = {
    [UserRole.PROJECT_MANAGER]: "PM",
    [UserRole.LEAD_ENGINEER]: "ENG",
    [UserRole.QUALITY_AUDITOR]: "QA",
    [UserRole.SECURITY_OFFICER]: "SEC"
  };
  
  const styles = {
    [UserRole.PROJECT_MANAGER]: "bg-blue-50 text-blue-600 border-blue-100",
    [UserRole.LEAD_ENGINEER]: "bg-purple-50 text-purple-600 border-purple-100",
    [UserRole.QUALITY_AUDITOR]: "bg-emerald-50 text-emerald-600 border-emerald-100",
    [UserRole.SECURITY_OFFICER]: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border ${styles[role]}`}>
      {labels[role]}
    </span>
  );
};

const DigitalSealDisplay = ({ seal }: { seal: DigitalSeal }) => (
  <MotionDiv 
    initial={{ scale: 0.95, opacity: 0 }} 
    animate={{ scale: 1, opacity: 1 }}
    className="w-full bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden border border-slate-800 shadow-2xl"
  >
    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />
    
    <div className="relative z-10 text-center">
      <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(251,191,36,0.5)]">
        <svg className="w-8 h-8 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">Stage Certified</h3>
      <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-6">Signed by {seal.issuer}</p>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-3">
         <div className="flex justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Hash</span>
            <span className="text-[9px] font-mono text-emerald-400 truncate w-32 text-right">{seal.hash}</span>
         </div>
         <div className="flex justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Timestamp</span>
            <span className="text-[9px] font-mono text-white">{new Date(seal.timestamp).toLocaleString()}</span>
         </div>
      </div>
    </div>
  </MotionDiv>
);

const GateActionProtocol = ({ plan }: { plan: ActionPlanItem[] }) => (
  <div className="mt-6 bg-rose-50/50 border border-rose-100 rounded-3xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      <h5 className="text-[10px] font-black uppercase text-rose-600 tracking-widest">Gate Requirements Unmet</h5>
    </div>
    <div className="space-y-2">
      {plan.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-rose-100/30">
          <span className="text-xs font-semibold text-slate-700">{item.label}</span>
          <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded">{item.assignedTo}</span>
        </div>
      ))}
    </div>
  </div>
);

const StageCard: React.FC<StageCardProps> = ({ 
  stage, currentUser, onUpload, onRunAudit, onApprove, onToggleChecklist, onOverride, 
  isLoading, aiInsights, canUnlock, isOverrideAvailable, actionPlan
}) => {
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [justification, setJustification] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) onUpload(files);
  };

  const hasUserSigned = stage.approvals.some(a => a.role === currentUser.role);
  const isUserRequired = stage.requiredRoles.includes(currentUser.role);
  const isSealed = !!stage.digitalSeal;

  return (
    <MotionArticle 
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
      className="bg-white rounded-[3rem] p-2 shadow-2xl relative overflow-hidden h-full"
    >
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

      <div className="p-8 lg:p-12 h-full flex flex-col">
          {/* Header */}
          <header className="flex flex-col xl:flex-row justify-between items-start gap-8 mb-12 border-b border-slate-100 pb-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Gate 0{stage.id}</span>
                {stage.status === 'ACTIVE' && <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" /> In Progress</span>}
                {isSealed && <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Completed</span>}
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">{stage.title}</h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">{stage.description}</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 min-w-[200px]">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Compliance</span>
                    <span className="text-3xl font-black text-indigo-600">{stage.complianceScore}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${stage.complianceScore}%` }} className="h-full bg-indigo-500 rounded-full" />
                </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 flex-1">
              
              {/* Left Column: Actions & Checks */}
              <div className="xl:col-span-5 space-y-8">
                 <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Protocol Checklist</h4>
                    <span className="text-[10px] font-bold text-slate-300">{stage.checklist.filter(c => c.isCompleted).length}/{stage.checklist.length}</span>
                 </div>
                 <div className="space-y-3">
                    {stage.checklist.map(item => (
                        <button 
                          key={item.id}
                          onClick={() => !isSealed && onToggleChecklist(item.id)}
                          disabled={isSealed}
                          className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-all ${
                              item.isCompleted 
                              ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' 
                              : 'bg-white border-slate-100 hover:border-slate-300'
                          } ${isSealed ? 'opacity-60 pointer-events-none' : ''}`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${item.isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-200'}`}>
                                {item.isCompleted && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="text-sm font-semibold">{item.label}</span>
                        </button>
                    ))}
                 </div>

                 {aiInsights && (
                     <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors" />
                        <h5 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-3 relative z-10">AI Guidance</h5>
                        <p className="text-slate-300 text-sm font-medium leading-relaxed italic relative z-10">"{aiInsights}"</p>
                     </div>
                 )}
              </div>

              {/* Right Column: Evidence & Signatures */}
              <div className="xl:col-span-7 flex flex-col gap-8">
                  
                  {/* Upload Area */}
                  {!isSealed ? (
                      <div className="relative group">
                          <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 z-10 opacity-0 cursor-pointer" />
                          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all group-hover:bg-indigo-50/30 group-hover:border-indigo-300">
                             <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                             </div>
                             <p className="text-sm font-bold text-slate-900">Drag & Drop Artifacts</p>
                             <p className="text-[10px] text-slate-400 font-medium mt-1">Supports PDF, BOM, CAD</p>
                          </div>
                      </div>
                  ) : null}

                  {/* Documents List */}
                  {stage.approvalDocuments.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                          {stage.approvalDocuments.map((doc, i) => (
                              <div key={i} className="shrink-0 flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-xl shadow-sm min-w-[200px]">
                                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500">{doc.type.substring(0,3)}</div>
                                  <div className="overflow-hidden">
                                      <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                                      <p className="text-[9px] text-slate-400 truncate">{doc.size} • {doc.sourceSystem || 'Manual'}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* Signatures */}
                  <div className="mt-auto">
                     <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Approvals</h4>
                     <div className="space-y-4">
                        {stage.requiredRoles.map((role) => {
                            const approval = stage.approvals.find(a => a.role === role);
                            return (
                                <div key={role} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${approval ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{approval?.signerName || 'Pending...'}</p>
                                            <div className="flex items-center gap-2">
                                                <RoleBadge role={role} />
                                                {approval && <span className="text-[9px] font-mono text-slate-400">{approval.timestamp}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {approval && <div className="text-[10px] font-mono text-slate-300 bg-slate-50 px-2 py-1 rounded">#{approval.signatureHash.substring(0,6)}</div>}
                                </div>
                            );
                        })}
                     </div>
                  </div>

                  {/* Action Bar */}
                  {!isSealed ? (
                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
                        <div className="flex gap-4">
                            <button onClick={onRunAudit} disabled={isLoading || stage.approvalDocuments.length === 0} className="flex-1 py-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-indigo-100 transition-colors disabled:opacity-50">
                                {isLoading ? 'Analyzing...' : 'Run Audit'}
                            </button>
                            {isOverrideAvailable && (
                                <button onClick={() => setShowOverrideDialog(true)} className="px-6 py-4 bg-amber-50 text-amber-600 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-amber-100 transition-colors">
                                    Override
                                </button>
                            )}
                        </div>
                        <button 
                          onClick={onApprove}
                          disabled={!canUnlock || isLoading || !isUserRequired || hasUserSigned}
                          className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all transform active:scale-[0.99] ${
                             !canUnlock ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' :
                             hasUserSigned ? 'bg-emerald-500 text-white cursor-default' :
                             !isUserRequired ? 'bg-slate-100 text-slate-400' :
                             'bg-slate-900 text-white hover:bg-indigo-900 hover:shadow-xl'
                          }`}
                        >
                           {hasUserSigned ? 'Signed Successfully' : !canUnlock ? 'Gate Locked' : 'Authorize Stage'}
                        </button>
                    </div>
                  ) : (
                      <DigitalSealDisplay seal={stage.digitalSeal!} />
                  )}

                  <AnimatePresence>
                     {actionPlan && !canUnlock && !isSealed && <GateActionProtocol plan={actionPlan} />}
                  </AnimatePresence>
              </div>
          </div>
      </div>

      {/* Override Dialog */}
      <AnimatePresence>
        {showOverrideDialog && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-8">
             <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 max-w-md w-full">
                <h3 className="text-xl font-black text-slate-900 mb-2">Manual Override</h3>
                <p className="text-sm text-slate-500 mb-6">This action will be logged in the immutable audit trail.</p>
                <textarea 
                    value={justification} 
                    onChange={e => setJustification(e.target.value)} 
                    placeholder="Enter compliance justification..." 
                    className="w-full p-4 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-indigo-500 outline-none mb-6 h-32 resize-none"
                />
                <div className="flex gap-3">
                    <button onClick={() => setShowOverrideDialog(false)} className="flex-1 py-3 text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={() => { onOverride(justification); setShowOverrideDialog(false); }} disabled={!justification} className="flex-1 py-3 bg-amber-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-amber-200">Confirm Override</button>
                </div>
             </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </MotionArticle>
  );
};

export default StageCard;
