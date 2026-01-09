
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ReadModel, CommandType, User } from './types';
import { INITIAL_STAGES, SYSTEM_ARCHITECTURE, INITIAL_INFRASTRUCTURE, INITIAL_INTEGRATIONS, MOCK_USERS } from './constants';
import { CQRSManager } from './services/cqrsManager';

// Page Imports
import Governance from './pages/Governance';
import Roadmap from './pages/Roadmap';
import Swot from './pages/Swot';
import Integration from './pages/Integration';

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
  const [notification, setNotification] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); 
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const location = useLocation();

  const dispatch = useCallback(async (type: CommandType, payload: any = {}) => {
    try {
      const result = await manager.dispatch({ type, payload: { ...payload, user: currentUser }, timestamp: Date.now() });
      setReadModel(result.readModel);
      
      if (type !== 'RECEIVE_AI_RESULT') {
        setNotification(`${type} Processed`);
        setTimeout(() => setNotification(null), 3000);
      }

      if (type === 'GENERATE_ISO_COMPLIANCE_REPORT') {
         // (Keep existing PDF generation logic)
         const currentReadModel = result.readModel;
         const reportData = {
           reportId: `ISO-${Date.now()}`,
           projectName: currentReadModel.projectOverview.name, 
           timestamp: new Date().toISOString(),
           stage: currentReadModel.activeStageDetails?.title, 
           integrityScore: currentReadModel.projectOverview.integrityScore, 
           auditTrail: currentReadModel.systemTrace,
           isoNorms: ["ISO 27001", "ISO 9001", "DSGVO Art. 15"]
         };
         const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
         const url = URL.createObjectURL(jsonBlob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `KONFORMITÄTSBERICHT.pdf`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      }
    } catch (e: any) {
      setNotification(`Safety Block: ${e.message}`);
      setTimeout(() => setNotification(null), 4000);
    }
  }, [currentUser]);

  // Helper to check active route
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence>
        {notification && (
          <MotionDiv initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="text-xs font-bold uppercase tracking-widest">{notification}</span>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-6 z-[100] px-6 lg:px-12 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-6">
            <Link to="/" className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
               <span className="font-mono font-black tracking-tighter text-lg">BB</span>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">{readModel.projectOverview.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">v3.0 Enterprise</span>
                <span className={`w-1.5 h-1.5 rounded-full ${readModel.projectOverview.isChainValid ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span className="text-[9px] font-medium text-slate-400">{readModel.projectOverview.isChainValid ? 'Verified' : 'Synced'}</span>
              </div>
            </div>
          </div>
          
          <nav className="hidden xl:flex bg-black/20 p-1.5 rounded-2xl border border-white/5">
            {[
              { path: '/', label: 'Governance' },
              { path: '/roadmap', label: 'Roadmap' },
              { path: '/swot', label: 'SWOT' },
              { path: '/integration', label: 'Integration' }
            ].map(link => (
              <Link key={link.path} to={link.path} className={`relative px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${isActive(link.path) ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                {isActive(link.path) && <MotionDiv layoutId="nav-pill" className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl shadow-sm" />}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-6">
             {/* Connectivity Pill */}
             <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span className="text-[10px] font-black text-indigo-300">{readModel.projectOverview.siloConnectivityScore}% Sync</span>
             </div>

             {/* User Profile */}
             <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold border border-white/10">
                     {currentUser.avatarInitials}
                  </div>
                  <div className="text-left hidden sm:block">
                     <p className="text-[10px] font-bold text-white leading-none">{currentUser.name}</p>
                     <p className="text-[8px] font-medium text-slate-400 leading-none mt-0.5">{currentUser.role.split('_')[1] || 'USER'}</p>
                  </div>
                </button>
                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                      {MOCK_USERS.map(user => (
                        <button key={user.id} onClick={() => { setCurrentUser(user); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 text-xs text-slate-300 border-b border-white/5 last:border-0 transition-colors">
                           {user.name} <span className="opacity-50 text-[9px] ml-1">({user.role.split('_')[1]})</span>
                        </button>
                      ))}
                    </MotionDiv>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </header>

      {/* Routed Content */}
      <div className="max-w-[1920px] mx-auto w-full px-6 lg:px-12 pb-12 flex-1 relative z-10">
        <Routes>
          <Route path="/" element={
            <Governance 
              readModel={readModel} 
              currentUser={currentUser} 
              dispatch={dispatch} 
              stages={manager.getWriteModel().stages}
              currentStageIndex={manager.getWriteModel().currentStageIndex}
            />
          } />
          
          <Route path="/roadmap" element={
            <Roadmap 
              stages={manager.getWriteModel().stages} 
              currentStageIndex={manager.getWriteModel().currentStageIndex} 
            />
          } />
          
          <Route path="/swot" element={
            <Swot data={readModel.activeStageDetails?.swot} />
          } />
          
          <Route path="/integration" element={
            <Integration 
              integrations={readModel.integrations}
              infra={readModel.infrastructure}
              dispatch={dispatch}
            />
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
