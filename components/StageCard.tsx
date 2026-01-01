
import React, { useState, useEffect } from 'react';
import { ProductStage, StageStatus } from '../types';
import { performDocumentAudit, AuditResult } from '../services/geminiService';

interface StageCardProps {
  stage: ProductStage;
  onApprove: (file: File) => void;
  onToggleChecklist: (itemId: string) => void;
  isLastStage: boolean;
  isLoading: boolean;
  aiInsights: string | null;
}

const StageCard: React.FC<StageCardProps> = ({ stage, onApprove, onToggleChecklist, isLastStage, isLoading, aiInsights }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    setSelectedFile(null);
    setAuditResult(null);
  }, [stage.id]);

  const handleRunAudit = async () => {
    if (!selectedFile) return;
    console.debug(`[CARD] Starte Audit für: ${selectedFile.name}`);
    setIsAuditing(true);
    try {
      const result = await performDocumentAudit(stage, selectedFile.name);
      setAuditResult(result);
      console.debug(`[CARD] Audit Ergebnis erhalten: ${result.status}`);
    } catch (err) {
      console.error("[CARD] Audit Fehler:", err);
      alert("Audit fehlgeschlagen.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.debug(`[CARD] Datei ausgewählt: ${file.name}`);
      setSelectedFile(file);
    }
  };

  const isChecklistComplete = stage.checklist.every(item => item.isCompleted);
  const canApprove = selectedFile && auditResult?.status === 'APPROVED' && !isLoading;

  return (
    <article className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
      <header className="bg-slate-50 p-10 border-b border-slate-200 flex justify-between items-start">
        <div>
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-2 block">Phase {stage.id}: {stage.name}</span>
          <h2 className="text-3xl font-black text-slate-900">{stage.title}</h2>
          <p className="text-slate-500 mt-2 font-medium">{stage.description}</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2" role="status">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase text-slate-600">Gate Active</span>
        </div>
      </header>

      <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section aria-labelledby="checklist-title">
            <h4 id="checklist-title" className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Compliance Checkliste</h4>
            <div className="space-y-2">
              {stage.checklist.map(item => (
                <button
                  key={item.id}
                  onClick={() => onToggleChecklist(item.id)}
                  aria-pressed={item.isCompleted}
                  className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    item.isCompleted ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    item.isCompleted ? 'bg-indigo-600' : 'border-2 border-slate-200'
                  }`} aria-hidden="true">
                    {item.isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm font-bold ${item.isCompleted ? 'text-indigo-900' : 'text-slate-600'}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl" aria-labelledby="ai-insights-title">
            <h4 id="ai-insights-title" className="text-[10px] font-black uppercase text-indigo-300 mb-4 tracking-widest">KI-Expertise</h4>
            <div className="text-sm font-medium leading-relaxed opacity-90">
              {aiInsights ? (
                <div role="document">
                  {aiInsights.split('\n').map((l, i) => <p key={i} className="mb-2">{l}</p>)}
                </div>
              ) : (
                <p className="animate-pulse">Lade Guidance...</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section aria-labelledby="upload-title">
            <h4 id="upload-title" className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Upload Governance PDF</h4>
            <div 
              className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
                selectedFile ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {!selectedFile ? (
                <label className="cursor-pointer group flex flex-col items-center focus-within:ring-2 focus-within:ring-indigo-500 rounded-3xl p-2">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto mb-4 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors" aria-hidden="true">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Klicken zum Hochladen</span>
                  <input type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="flex flex-col items-center" aria-live="polite">
                   <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg" aria-hidden="true">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   </div>
                   <span className="text-xs font-bold text-indigo-900 truncate max-w-[200px]">{selectedFile.name}</span>
                   <button 
                    onClick={() => {
                      console.debug("[CARD] Datei entfernt.");
                      setSelectedFile(null);
                      setAuditResult(null);
                    }} 
                    className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 px-2 py-1"
                   >
                     Löschen
                   </button>
                </div>
              )}
            </div>
          </section>

          {auditResult && (
            <div 
              className={`p-6 rounded-3xl border-2 animate-fade-in ${
                auditResult.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
              role="alert"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${auditResult.status === 'APPROVED' ? 'bg-green-600' : 'bg-red-600'}`}>
                  {auditResult.status}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Audit Log</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{auditResult.report}</p>
              <p className="text-xs text-slate-500 mt-2">{auditResult.justification}</p>
            </div>
          )}

          <div className="space-y-4 pt-4">
             {selectedFile && !auditResult && (
               <button 
                 onClick={handleRunAudit} 
                 disabled={isAuditing || !isChecklistComplete} 
                 aria-busy={isAuditing}
                 className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
               >
                 {isAuditing ? "KI-Audit läuft..." : "AI Gate Audit starten"}
               </button>
             )}
             <button 
               onClick={() => selectedFile && onApprove(selectedFile)} 
               disabled={!canApprove} 
               aria-busy={isLoading}
               className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
             >
               {isLoading ? "Verarbeite..." : "Phase Abschließen"}
             </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default StageCard;
