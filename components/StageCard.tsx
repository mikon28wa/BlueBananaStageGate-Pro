
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductStage, StageStatus, ApprovalDocument } from '../types';
import { performDocumentAudit, AuditResult } from '../services/geminiService';

interface StageCardProps {
  stage: ProductStage;
  onUpload: (files: File[]) => void;
  onRunAudit: (result: AuditResult) => void;
  onApprove: () => void;
  onToggleChecklist: (itemId: string) => void;
  isLastStage: boolean;
  isLoading: boolean;
  aiInsights: string | null;
  canUnlock: boolean;
  unlockReason?: string;
}

const StageCard: React.FC<StageCardProps> = ({ 
  stage, onUpload, onRunAudit, onApprove, onToggleChecklist, isLastStage, isLoading, aiInsights, canUnlock, unlockReason 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    setSelectedFiles([]);
  }, [stage.id]);

  const handleRunAudit = async () => {
    if (selectedFiles.length === 0) return;
    setIsAuditing(true);
    try {
      const fileNames = selectedFiles.map(f => f.name);
      const result = await performDocumentAudit(stage, fileNames);
      onRunAudit(result);
    } catch (err) {
      alert("Audit Fehlgeschlagen.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      onUpload(files);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-500 bg-amber-500/10';
    return 'text-rose-500 bg-rose-500/10';
  };

  const getConfidenceBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden"
    >
      <header className="bg-slate-50 p-8 lg:p-12 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">GATE {stage.id}</span>
            {stage.aiStatus === 'VERIFIED' && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                 AI Verified
               </motion.div>
            )}
            {stage.confidenceScore > 0 && (
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getConfidenceColor(stage.confidenceScore)}`}>
                AI Confidence: {stage.confidenceScore}%
              </span>
            )}
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-4">{stage.title}</h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">{stage.description}</p>
        </div>
        
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col items-center justify-center min-w-[200px] shadow-2xl relative overflow-hidden">
           <div className="relative z-10 w-full">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black uppercase opacity-50">Compliance</span>
                <span className="text-3xl font-black">{stage.complianceScore}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${stage.complianceScore}%` }} className="h-full bg-indigo-500" />
              </div>

              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black uppercase opacity-50">AI Confidence</span>
                <span className={`text-xl font-black ${stage.confidenceScore < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {stage.confidenceScore}%
                </span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${stage.confidenceScore}%` }} 
                    className={`h-full ${getConfidenceBarColor(stage.confidenceScore)}`} 
                  />
              </div>
              {stage.confidenceScore > 0 && stage.confidenceScore < 60 && (
                <p className="text-[9px] font-bold text-rose-300 uppercase tracking-tighter mt-2 text-center animate-pulse">
                  Uncertainty detected: Human review advised
                </p>
              )}
           </div>
        </div>
      </header>

      <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <section className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Manuelle Checkliste</h4>
            <ul className="space-y-3">
              {stage.checklist.map(item => (
                <li key={item.id}>
                  <button onClick={() => onToggleChecklist(item.id)} className={`w-full p-5 rounded-2xl border transition-all flex items-center gap-4 ${item.isCompleted ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white border-slate-200'}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.isCompleted ? 'bg-indigo-600' : 'border-2 border-slate-200'}`}>
                      {item.isCompleted && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-base font-bold">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-xl">
             <h4 className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-4">AI Strategie</h4>
             <p className="text-sm font-medium leading-relaxed opacity-90">{aiInsights || "Warte auf AI Sync..."}</p>
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Dokumenten-Audit (Command Side)</h4>
            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer relative group">
               <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               <div className="text-slate-400 group-hover:text-indigo-600 mb-4 flex justify-center">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 16V8m0 8l-3-3m3 3l3-3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" /></svg>
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-slate-500">Kollektiver Upload</span>
            </div>
            
            {stage.approvalDocuments.length > 0 && (
               <div className="mt-6 space-y-2">
                 {stage.approvalDocuments.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl">
                       <span className="text-xs font-bold text-slate-700">{doc.name}</span>
                       <span className="text-[10px] font-black text-slate-300">{doc.uploadDate}</span>
                    </div>
                 ))}
               </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
             <button 
                onClick={handleRunAudit}
                disabled={isAuditing || stage.approvalDocuments.length === 0}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase text-xs tracking-widest shadow-xl disabled:opacity-30 hover:bg-black transition-all flex items-center justify-center gap-3"
             >
                {isAuditing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Trigger AI Calculation
             </button>

             <div className="pt-4 border-t border-slate-100">
               <button 
                  onClick={onApprove}
                  disabled={!canUnlock || isLoading}
                  className="w-full py-5 bg-emerald-600 text-white rounded-[1.25rem] font-black uppercase text-xs tracking-widest shadow-2xl disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none hover:bg-emerald-700 transition-all"
               >
                  {isLastStage ? 'Final Launch' : 'Gate Freischalten'}
               </button>
               {!canUnlock && stage.status !== StageStatus.COMPLETED && (
                  <p className="text-[10px] text-center font-bold text-slate-400 mt-4 uppercase tracking-widest">
                    Sperre aktiv: {unlockReason}
                  </p>
               )}
             </div>
          </div>
        </section>
      </div>
    </motion.article>
  );
};

export default StageCard;
