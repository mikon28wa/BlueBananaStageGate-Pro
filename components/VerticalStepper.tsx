
import React from 'react';
import { motion } from 'framer-motion';
import { ProductStage, StageStatus } from '../types';

interface VerticalStepperProps {
  stages: ProductStage[];
  currentIndex: number;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({ stages, currentIndex }) => {
  return (
    <nav className="w-full lg:w-72" aria-label="Product Development Journey">
      <ol className="relative flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible py-4 lg:py-0 hide-scrollbar scroll-smooth">
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = stage.status === StageStatus.COMPLETED || index < currentIndex;
          const isLocked = !isActive && !isCompleted;

          return (
            <li 
              key={stage.id}
              className="flex-shrink-0 lg:flex-shrink"
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="flex lg:items-start gap-4 group">
                {/* Connector Line - Desktop Only */}
                <div className="hidden lg:flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200' :
                      isCompleted ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <motion.svg 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="w-5 h-5 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    ) : (
                      <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  {index !== stages.length - 1 && (
                    <div className={`w-0.5 h-12 my-2 transition-colors duration-500 ${isCompleted ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                  )}
                </div>

                {/* Mobile Dot Indicator */}
                <div className="lg:hidden">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${isActive ? 'bg-indigo-600 scale-125' : isCompleted ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                </div>

                <div className="flex flex-col pt-0 lg:pt-1 min-w-[120px]">
                  <span className={`text-xs font-black uppercase tracking-widest mb-1 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}>
                    {stage.name}
                  </span>
                  <span className={`text-sm font-bold truncate max-w-[150px] lg:max-w-none transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {stage.title}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-marker"
                      className="hidden lg:block w-full h-0.5 bg-indigo-600 mt-2" 
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default VerticalStepper;
