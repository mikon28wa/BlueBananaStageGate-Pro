
import React, { useState, useEffect, useCallback } from 'react';
import { ProductStage, StageStatus, ProjectState } from './types';
import { INITIAL_STAGES } from './constants';
import VerticalStepper from './components/VerticalStepper';
import StageCard from './components/StageCard';
import { getStageGuidance, generateMarketingMaterials } from './services/geminiService';

const App: React.FC = () => {
  const [project, setProject] = useState<ProjectState>({
    projectName: "H-Forge PCB Solutions",
    currentStageIndex: 0,
    stages: INITIAL_STAGES
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeStageInsights, setActiveStageInsights] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'governance' | 'roadmap' | 'finance' | 'marketing'>('governance');
  const [marketingContent, setMarketingContent] = useState<string | null>(null);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  const showDebug = (msg: string) => {
    console.debug(`[APP] ${msg}`);
    setDebugMessage(msg);
    setTimeout(() => setDebugMessage(null), 3000);
  };

  const fetchInsights = useCallback(async (stage: ProductStage) => {
    showDebug(`Lade KI-Expertise für Phase: ${stage.name}`);
    setActiveStageInsights(null);
    const insights = await getStageGuidance(stage);
    setActiveStageInsights(insights);
    showDebug(`KI-Expertise geladen.`);
  }, []);

  useEffect(() => {
    if (project.currentStageIndex < project.stages.length) {
      fetchInsights(project.stages[project.currentStageIndex]);
    }
  }, [project.currentStageIndex, fetchInsights]);

  const handleMarketingGen = async () => {
    showDebug("Starte Marketing-Generierung...");
    setIsLoading(true);
    const content = await generateMarketingMaterials(project.projectName, project.stages[Math.min(project.currentStageIndex, project.stages.length - 1)]);
    setMarketingContent(content);
    setIsLoading(false);
    showDebug("Marketing-Material generiert.");
  };

  const handleApprove = async (file: File) => {
    showDebug(`Schließe Phase ab mit Datei: ${file.name}`);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setProject(prev => {
      const newStages = [...prev.stages];
      const idx = prev.currentStageIndex;
      newStages[idx] = {
        ...newStages[idx],
        status: StageStatus.COMPLETED,
        approvalDocument: {
          name: file.name,
          uploadDate: new Date().toLocaleString(),
          size: `${(file.size / 1024).toFixed(1)} KB`
        }
      };
      const next = idx + 1;
      if (next < newStages.length) newStages[next].status = StageStatus.ACTIVE;
      
      const resMsg = next < newStages.length 
        ? `Phase ${idx + 1} abgeschlossen. Weiter zu Phase ${next + 1}.`
        : "Gesamtes Projekt abgeschlossen!";
      
      setTimeout(() => showDebug(resMsg), 100);
      
      return { ...prev, stages: newStages, currentStageIndex: next };
    });
    setIsLoading(false);
  };

  const exportAuditLog = () => {
    showDebug("Exportiere Audit-Report...");
    const report = project.stages.map(s => `STAGE: ${s.name}\nSTATUS: ${s.status}\nDOC: ${s.approvalDocument?.name || 'N/A'}\nBUDGET: ${s.finance.budget}\n---\n`).join('\n');
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Report_${project.projectName}.txt`;
    a.click();
    showDebug("Report-Download gestartet.");
  };

  const handleToggleChecklist = (id: string) => {
    showDebug(`Checklist-Item geändert: ${id}`);
    setProject(p => {
      const stages = [...p.stages];
      const s = stages[p.currentStageIndex];
      s.checklist = s.checklist.map(c => c.id === id ? {...c, isCompleted: !c.isCompleted} : c);
      return {...p, stages};
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Live Region for notifications */}
      <div 
        aria-live="polite" 
        className="fixed bottom-8 right-8 z-[100] flex flex-col gap-2"
      >
        {debugMessage && (
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">{debugMessage}</span>
          </div>
        )}
      </div>

      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black" aria-hidden="true">HF</div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{project.projectName}</h1>
          </div>
          
          <nav aria-label="Main Navigation">
            <div className="flex bg-slate-100 p-1 rounded-xl" role="tablist">
              {(['governance', 'roadmap', 'finance', 'marketing'] as const).map(tab => (
                <button 
                  key={tab} 
                  id={`tab-${tab}`}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`panel-${tab}`}
                  onClick={() => {
                    showDebug(`Tab gewechselt: ${tab}`);
                    setActiveTab(tab);
                  }} 
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    activeTab === tab ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </nav>
          
          <button 
            onClick={exportAuditLog} 
            aria-label="Export Audit Report as Text File"
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Export Report
          </button>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto w-full p-8 flex flex-col lg:flex-row gap-12 flex-1">
        <aside className="lg:w-72 flex-shrink-0">
          <VerticalStepper stages={project.stages} currentIndex={project.currentStageIndex} />
        </aside>

        <main id="main-content" className="flex-1 min-w-0">
          <div 
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={0}
            className="focus:outline-none"
          >
            {activeTab === 'governance' && (
              project.currentStageIndex >= project.stages.length ? (
                <section className="bg-white p-20 rounded-[3rem] shadow-2xl text-center animate-fade-in">
                  <h2 className="text-4xl font-black text-slate-900 mb-4">Launch Ready!</h2>
                  <p className="text-slate-500 mb-8">Alle Gates wurden erfolgreich passiert.</p>
                  <button onClick={exportAuditLog} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    Download Final Report
                  </button>
                </section>
              ) : (
                <StageCard 
                  stage={project.stages[project.currentStageIndex]} 
                  onApprove={handleApprove}
                  onToggleChecklist={handleToggleChecklist}
                  isLastStage={project.currentStageIndex === project.stages.length - 1}
                  isLoading={isLoading}
                  aiInsights={activeStageInsights}
                />
              )
            )}

            {activeTab === 'roadmap' && (
              <section className="bg-white p-12 rounded-[3rem] shadow-2xl space-y-8 animate-fade-in">
                <h2 className="text-3xl font-black text-slate-900">MVP Roadmap</h2>
                <div className="relative border-l-4 border-indigo-100 ml-4 space-y-12">
                  {project.stages.map((s, i) => (
                    <div key={s.id} className={`relative pl-10 ${i > project.currentStageIndex ? 'opacity-40 grayscale' : ''}`}>
                      <div className={`absolute -left-[14px] top-0 w-6 h-6 rounded-full border-4 bg-white ${i <= project.currentStageIndex ? 'border-indigo-600' : 'border-slate-200'}`} aria-hidden="true" />
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{s.roadmap.startDate} — {s.roadmap.endDate}</span>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">{s.roadmap.milestone}</h3>
                        <p className="text-sm text-slate-500">{s.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'finance' && (
              <section className="bg-white p-12 rounded-[3rem] shadow-2xl space-y-8 animate-fade-in">
                <h2 className="text-3xl font-black text-slate-900">Budgeting & Controlling</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {project.stages.map(s => (
                     <article key={s.id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                       <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.name}</span>
                         <span 
                           className={`text-[10px] font-black uppercase tracking-widest ${s.finance.actualSpent > s.finance.budget ? 'text-red-600' : 'text-green-600'}`}
                         >
                           {s.finance.actualSpent > s.finance.budget ? 'Over Budget' : 'On Track'}
                         </span>
                       </div>
                       <p className="text-2xl font-black text-slate-900">{s.finance.actualSpent.toLocaleString()} {s.finance.currency}</p>
                       <div 
                         className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden" 
                         role="progressbar" 
                         aria-valuenow={Math.min(100, (s.finance.actualSpent / s.finance.budget) * 100)} 
                         aria-valuemin={0} 
                         aria-valuemax={100}
                         aria-label={`Spending for ${s.name}`}
                       >
                         <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (s.finance.actualSpent / s.finance.budget) * 100)}%` }} />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Budget: {s.finance.budget.toLocaleString()} {s.finance.currency}</p>
                     </article>
                   ))}
                </div>
              </section>
            )}

            {activeTab === 'marketing' && (
              <section className="bg-white p-12 rounded-[3rem] shadow-2xl space-y-8 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-slate-900">Marketing Assets</h2>
                  <button 
                    onClick={handleMarketingGen} 
                    disabled={isLoading} 
                    aria-busy={isLoading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Generating...' : 'Generieren'}
                  </button>
                </div>
                {marketingContent ? (
                  <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white prose prose-invert max-w-none">
                    <div className="text-[10px] font-black uppercase text-indigo-400 mb-6 tracking-widest">AI Generated Content</div>
                    {marketingContent.split('\n').map((l, i) => <p key={i} className="mb-4 text-indigo-100 font-medium">{l}</p>)}
                  </div>
                ) : (
                  <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[2.5rem]">
                    <p className="text-slate-400 font-black uppercase text-xs">Bereit zum Generieren von Pitches...</p>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
      
      <footer className="bg-white border-t border-slate-200 p-8 mt-12 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2025 GateWay Forge • Enterprise Governance Engine</p>
      </footer>
    </div>
  );
};

export default App;
