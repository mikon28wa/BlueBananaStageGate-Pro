
import React from 'react';
import { ProductStage, StageStatus } from '../types';

interface VerticalStepperProps {
  stages: ProductStage[];
  currentIndex: number;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({ stages, currentIndex }) => {
  return (
    <nav className="flex flex-col space-y-0 w-72 pr-4" aria-label="Project stage progress tracking">
      <ol className="list-none m-0 p-0">
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = stage.status === StageStatus.COMPLETED || index < currentIndex;
          
          return (
            <li 
              key={stage.id} 
              className="relative pb-10 last:pb-0 group"
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Line connecting steps */}
              {index !== stages.length - 1 && (
                <div 
                  className={`absolute left-5 top-10 bottom-0 w-0.5 -ml-[1px] transition-colors duration-500 ${
                    isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
              
              <div className="flex items-start gap-4 transition-all duration-300">
                <div 
                  className={`z-10 flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200 scale-110' 
                      : isCompleted 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'bg-white border-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="sr-only">Completed</span>
                    </>
                  ) : (
                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col pt-1">
                  <span className={`text-sm font-bold tracking-tight transition-colors ${
                    isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {stage.name}
                  </span>
                  <span className={`text-[11px] font-medium uppercase tracking-wider ${
                    isActive ? 'text-indigo-400' : isCompleted ? 'text-green-500' : 'text-slate-400'
                  }`}>
                    {isActive ? 'Current Phase' : isCompleted ? 'Approved' : 'Locked'}
                  </span>
                  {isActive && (
                     <span className="text-[10px] text-slate-500 mt-1 max-w-[160px] leading-tight line-clamp-2">
                       {stage.title}
                     </span>
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
