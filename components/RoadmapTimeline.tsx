
import React from 'react';
import { motion } from 'framer-motion';
import { RoadmapData, ProductStage } from '../types';

interface RoadmapTimelineProps {
  stages: ProductStage[];
  currentStageIndex: number;
}

const MotionDiv = motion.div as any;

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ stages, currentStageIndex }) => {
  // Sort or extract all dates to find the range
  const allDates = stages.flatMap(s => [new Date(s.roadmap.startDate), new Date(s.roadmap.endDate)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  const totalDuration = maxDate.getTime() - minDate.getTime();

  const getPercentage = (dateStr: string) => {
    const date = new Date(dateStr);
    return ((date.getTime() - minDate.getTime()) / totalDuration) * 100;
  };

  return (
    <section className="bg-white p-12 lg:p-20 rounded-[5rem] shadow-4xl border border-slate-100 overflow-hidden">
      <div className="flex justify-between items-start mb-20">
        <div>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-5 py-2 rounded-full mb-6 inline-block">Release Strategy</span>
          <h2 className="text-5xl font-black tracking-tight mb-4">Enterprise MVP Roadmap</h2>
          <p className="text-slate-500 text-xl font-medium">Visualizing the critical path from strategy to mass production.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600" />
              <span className="text-[10px] font-black uppercase text-slate-400">Completed</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <span className="text-[10px] font-black uppercase text-slate-400">Planned</span>
           </div>
        </div>
      </div>

      <div className="relative mt-20 min-h-[500px]">
        {/* Time Markers */}
        <div className="absolute top-0 left-0 w-full flex justify-between px-2 opacity-20 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-px h-[600px] bg-slate-400 border-dashed border-l" />
            </div>
          ))}
        </div>

        <div className="space-y-12 relative z-10">
          {stages.map((stage, idx) => {
            const startPct = getPercentage(stage.roadmap.startDate);
            const endPct = getPercentage(stage.roadmap.endDate);
            const width = endPct - startPct;
            const isCurrent = idx === currentStageIndex;
            const isPast = idx < currentStageIndex;

            return (
              <div key={stage.id} className="group">
                <div className="flex justify-between items-center mb-4 px-2">
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {stage.name}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{stage.roadmap.milestone}</span>
                   </div>
                   <span className="text-[9px] font-mono text-slate-400 uppercase">{stage.roadmap.startDate} — {stage.roadmap.endDate}</span>
                </div>
                
                <div className="relative h-14 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                  <MotionDiv
                    initial={{ width: 0, x: `${startPct}%` }}
                    animate={{ width: `${width}%`, x: `${startPct}%` }}
                    transition={{ duration: 1, delay: idx * 0.1, ease: "circOut" }}
                    className={`absolute inset-y-0 rounded-xl flex items-center px-6 ${
                      isPast ? 'bg-slate-200' : 
                      isCurrent ? 'bg-indigo-600 shadow-2xl shadow-indigo-200' : 
                      'bg-white border-2 border-slate-100'
                    }`}
                  >
                    {isCurrent && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Active Phase</span>
                      </div>
                    )}
                  </MotionDiv>

                  {/* Milestone Marker Pin */}
                  <MotionDiv
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, x: `${endPct}%` }}
                    transition={{ delay: 1 + idx * 0.1 }}
                    className="absolute top-1/2 -translate-y-1/2 -ml-3 z-20"
                  >
                    <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center ${
                      isPast || isCurrent ? 'bg-white border-indigo-600' : 'bg-white border-slate-200'
                    }`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${isPast || isCurrent ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    </div>
                  </MotionDiv>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Date Indicator (Approximate) */}
        <div className="absolute top-0 bottom-0 w-px bg-indigo-500 z-30" style={{ left: '15%' }}>
           <div className="absolute top-0 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase whitespace-nowrap">Today</div>
        </div>
      </div>

      <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-10">
         <div className="max-w-xl">
            <h4 className="text-2xl font-black mb-4 tracking-tight">MVP Critical Path</h4>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">
              Die Zeitachse basiert auf den deterministischen Meilensteinen des BlueBanana Governance-Systems. 
              Jede Phase erfordert einen verifizierten Cross-Check vor dem Übergang in die nächste Planungseinheit.
            </p>
         </div>
         <button className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all">
            Download Timeline PDF
         </button>
      </div>
    </section>
  );
};

export default RoadmapTimeline;
