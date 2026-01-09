
import React from 'react';
import { motion } from 'framer-motion';
import { ProductStage, StageStatus } from '../types';

interface VerticalStepperProps {
  stages: ProductStage[];
  currentIndex: number;
}

const MotionDiv = motion.div as any;

const VerticalStepper: React.FC<VerticalStepperProps> = ({ stages, currentIndex }) => {
  return (
    <nav className="w-full" aria-label="Progress">
      <div className="relative">
        {/* Continuous Line Background */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10 hidden lg:block" />

        <ol className="relative flex lg:flex-col gap-0 lg:gap-8 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar scroll-smooth px-1">
          {stages.map((stage, index) => {
            const isActive = index === currentIndex;
            const isCompleted = stage.status === StageStatus.COMPLETED || index < currentIndex;
            
            return (
              <li key={stage.id} className="flex-shrink-0 lg:flex-shrink relative z-10 group cursor-default">
                <div className="flex items-center gap-5 pl-1">
                  
                  {/* Indicator Dot */}
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                      isActive ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110' :
                      isCompleted ? 'bg-emerald-500 border-emerald-400' :
                      'bg-slate-900 border-slate-700'
                  }`}>
                     {isCompleted ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     ) : (
                        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{index + 1}</span>
                     )}
                     
                     {/* Active Pulse Ring */}
                     {isActive && <div className="absolute inset-0 rounded-full border-2 border-indigo-500 animate-ping opacity-20" />}
                  </div>

                  {/* Text Content */}
                  <div className={`transition-all duration-300 ${isActive ? 'translate-x-1' : 'opacity-60 group-hover:opacity-100'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isActive ? 'text-indigo-300' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {stage.name}
                    </p>
                    <p className={`text-sm font-bold truncate max-w-[180px] ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {stage.title.split(':')[0]}
                    </p>
                  </div>

                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default VerticalStepper;
