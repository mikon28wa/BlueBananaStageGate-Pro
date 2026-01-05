
import React from 'react';
import { motion } from 'framer-motion';
import { SwotData, SwotItem } from '../types';

interface SwotAnalysisProps {
  data: SwotData;
}

const MotionDiv = motion.div as any;

const ImpactBadge = ({ impact }: { impact: 'low' | 'medium' | 'high' }) => {
  const colors = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${colors[impact]}`}>
      {impact} impact
    </span>
  );
};

const SwotCard = ({ title, items, colorClass, delay }: { title: string, items: SwotItem[], colorClass: string, delay: number }) => (
  <MotionDiv 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl flex flex-col"
  >
    <div className="flex items-center gap-4 mb-8">
      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
      <h4 className="text-xl font-black tracking-tight">{title}</h4>
    </div>
    <div className="space-y-6 flex-1">
      {items.map((item, idx) => (
        <div key={idx} className="group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
              {item.point} {item.isAssumption && <span className="text-[9px] text-slate-400 italic font-medium ml-1">(Assumption)</span>}
            </p>
            <ImpactBadge impact={item.impact} />
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.significance}</p>
        </div>
      ))}
    </div>
  </MotionDiv>
);

const SwotAnalysis: React.FC<SwotAnalysisProps> = ({ data }) => {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-5 py-2 rounded-full mb-6 inline-block">Strategic Analysis</span>
          <h2 className="text-5xl font-black tracking-tight mb-4 text-white">SWOT & Strategic Positioning</h2>
          <p className="text-indigo-200 text-xl font-medium">Enterprise decision-support framework derived from cross-silo data.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 text-white text-center">
           <span className="text-[9px] font-black uppercase opacity-60 block mb-1">Recommended Positioning</span>
           <span className="text-xl font-black uppercase tracking-widest">{data.positioning}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SwotCard title="Strengths (Internal)" items={data.strengths} colorClass="bg-indigo-600" delay={0.1} />
        <SwotCard title="Weaknesses (Internal)" items={data.weaknesses} colorClass="bg-rose-500" delay={0.2} />
        <SwotCard title="Opportunities (External)" items={data.opportunities} colorClass="bg-emerald-500" delay={0.3} />
        <SwotCard title="Threats (External)" items={data.threats} colorClass="bg-amber-500" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-12 text-white border border-white/10 shadow-4xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-10">Strategic Action Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                  <h5 className="text-xs font-black uppercase text-slate-400 mb-6">Short-term (0–3 months)</h5>
                  <ul className="space-y-4">
                     {data.recommendations.shortTerm.map((rec, i) => (
                       <li key={i} className="flex gap-4 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span className="text-sm font-medium opacity-80 leading-relaxed">{rec}</span>
                       </li>
                     ))}
                  </ul>
               </div>
               <div>
                  <h5 className="text-xs font-black uppercase text-slate-400 mb-6">Mid-term (3–12 months)</h5>
                  <ul className="space-y-4">
                     {data.recommendations.midTerm.map((rec, i) => (
                       <li key={i} className="flex gap-4 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span className="text-sm font-medium opacity-80 leading-relaxed">{rec}</span>
                       </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-12 shadow-4xl border border-slate-100">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] mb-10">Critical Risks & Leverage</h4>
            <div className="space-y-10">
               <div>
                  <h5 className="text-[10px] font-black uppercase text-rose-500 mb-4">Strategic Risks</h5>
                  <div className="space-y-3">
                     {data.strategicRisks.map((risk, i) => (
                       <p key={i} className="text-xs font-bold text-slate-900 border-l-2 border-rose-100 pl-4 py-1">{risk}</p>
                     ))}
                  </div>
               </div>
               <div>
                  <h5 className="text-[10px] font-black uppercase text-indigo-500 mb-4">Leverage Points</h5>
                  <div className="space-y-3">
                     {data.leveragePoints.map((point, i) => (
                       <p key={i} className="text-xs font-bold text-slate-900 border-l-2 border-indigo-100 pl-4 py-1">{point}</p>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SwotAnalysis;
