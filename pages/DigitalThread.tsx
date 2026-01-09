
import React from 'react';
import DigitalThreadMap from '../components/DigitalThreadMap';
import EventStreamSimulator from '../components/EventStreamSimulator';
import { CommandType } from '../types';

interface DigitalThreadProps {
  dispatch: (type: CommandType, payload?: any) => void;
}

const DigitalThread: React.FC<DigitalThreadProps> = ({ dispatch }) => {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-end px-4">
        <div>
          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 block">System Observability</span>
          <h1 className="text-4xl font-black text-white tracking-tight">Digital Thread Visualization</h1>
        </div>
        <div className="hidden md:block">
            <p className="text-sm text-slate-400 max-w-md text-right">
                Real-time mapping of artifacts, traces, and system flows across the enterprise landscape.
            </p>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Map Area */}
        <div className="lg:col-span-3 h-full">
           <DigitalThreadMap />
        </div>

        {/* Simulator Sidebar */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
           <EventStreamSimulator dispatch={dispatch} />
        </div>
      </div>
    </div>
  );
};

export default DigitalThread;
