
import React from 'react';
import { motion } from 'framer-motion';
import { IntegrationStatus, InfrastructureConfig } from '../types';

interface IntegrationMatrixProps {
  integrations: IntegrationStatus[];
  infra: InfrastructureConfig;
  onSync: (id: string) => void;
  onInfraSwitch: (type: string) => void;
}

const MotionDiv = motion.div as any;

const IntegrationMatrix: React.FC<IntegrationMatrixProps> = ({ integrations, infra, onSync, onInfraSwitch }) => {
  return (
    <div className="space-y-16">
      {/* Infrastructure Section */}
      <section className="bg-slate-900 rounded-[3.5rem] p-12 lg:p-16 text-white shadow-4xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-4 block">Isolation Environment</span>
              <h3 className="text-4xl font-black tracking-tight mb-2">Vertex AI VPC Service Controls</h3>
              <p className="text-slate-400 font-medium">Lückenlose Datensouveränität durch Private Cloud Isolation.</p>
            </div>
            <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              infra.deploymentType === 'VPC_PRIVATE' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
              {infra.deploymentType === 'VPC_PRIVATE' ? '✓ Secured Tunnel Active' : 'Public Cloud Access'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
              <span className="text-[9px] font-black uppercase text-slate-500 mb-2 block">Region</span>
              <p className="text-lg font-bold">{infra.region}</p>
            </div>
            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
              <span className="text-[9px] font-black uppercase text-slate-500 mb-2 block">Encryption</span>
              <p className="text-lg font-bold">{infra.encryptionStatus}</p>
            </div>
            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
              <span className="text-[9px] font-black uppercase text-slate-500 mb-2 block">VPC Tunnel</span>
              <p className="text-lg font-mono font-bold text-indigo-400">{infra.vpcTunnelId || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              onClick={() => onInfraSwitch('VPC_PRIVATE')}
              className={`px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                infra.deploymentType === 'VPC_PRIVATE' ? 'bg-indigo-600 shadow-2xl' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Vertex AI Private VPC
            </button>
            <button 
              onClick={() => onInfraSwitch('ON_PREMISE')}
              className={`px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                infra.deploymentType === 'ON_PREMISE' ? 'bg-indigo-600 shadow-2xl' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              On-Premise Isolation
            </button>
          </div>
        </div>
      </section>

      {/* Integration Matrix */}
      <section>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h3 className="text-3xl font-black tracking-tight mb-2">ERP/PLM Integration Layer</h3>
            <p className="text-slate-500 font-medium text-lg">Breaking data silos through direct system synchronization.</p>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase mb-1">API Health</span>
             <span className="text-emerald-500 font-black text-sm">OPERATIONAL</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrations.map(int => (
            <MotionDiv 
              key={int.id}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl ${
                    int.type === 'ERP' ? 'bg-slate-900' : int.type === 'PLM' ? 'bg-indigo-600' : 'bg-amber-500'
                  }`}>
                    {int.systemName[0]}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    int.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-600' : int.status === 'SYNCING' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {int.status}
                  </span>
                </div>
                <h4 className="text-xl font-black mb-1">{int.systemName}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{int.type} Layer</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Silo Impact</span>
                    <span className="text-indigo-600">{int.silosBroken}%</span>
                  </div>
                  <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                    <MotionDiv initial={{ width: 0 }} animate={{ width: `${int.silosBroken}%` }} className="h-full bg-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                 <span className="text-[9px] font-bold text-slate-300 uppercase">{int.lastSync}</span>
                 <button 
                  onClick={() => onSync(int.id)}
                  className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 tracking-widest"
                 >
                   Manual Sync
                 </button>
              </div>
            </MotionDiv>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IntegrationMatrix;
