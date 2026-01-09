import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreadEvent } from '../digitalThreadModel';
import { CommandType } from '../types';

const MotionDiv = motion.div as any;

interface EventStreamSimulatorProps {
  dispatch: (type: CommandType, payload?: any) => void;
}

// Pre-defined scenarios
const SCENARIOS = [
  { activity: 'SAP_ORDER_CREATED', system: 'sys-sap', target: 'sys-tc', msg: 'Material Master created' },
  { activity: 'JIRA_COMMENT_ADDED', system: 'sys-jira', target: 'sys-bb', msg: 'User replied to ticket' },
  { activity: 'CAD_CHECKIN', system: 'sys-tc', target: 'sys-bb', msg: 'New revision uploaded' },
  { activity: 'QUALITY_CHECK_PASS', system: 'sys-bb', target: 'sys-sap', msg: 'Batch release confirmed' },
  // The Trigger Event
  { activity: 'JIRA_ISSUE_CLOSED', system: 'sys-jira', target: 'sys-bb', msg: 'Blocker Resolved: EPD Phase 3 Ready', isTrigger: true }
];

const EventStreamSimulator: React.FC<EventStreamSimulatorProps> = ({ dispatch }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ThreadEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        // Pick random scenario
        const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
        
        const newEvent: ThreadEvent = {
          id: `sim-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          caseId: 'SIM-AUTO',
          activity: scenario.activity,
          actor: 'System Bot',
          sourceSystemId: scenario.system,
          targetSystemId: scenario.target
        };

        // Prepend new logs but keep list manageable
        setLogs(prev => {
            const newLogs = [...prev, newEvent]; // Append to end for natural reading flow
            return newLogs.slice(-50); // Keep last 50
        });

        // Trigger Action Logic
        if (scenario.isTrigger) {
           // Simulate Jira closing an issue that unlocks Stage 3 (index 2 in array)
           dispatch('EXTERNAL_EVENT', { 
             action: 'UNLOCK_STAGE', 
             stageIndex: 2, // Phase 3
             message: `JIRA Trigger: ${scenario.msg}`
           });
        } else {
           // Just log it in the audit trail without changing stage
           dispatch('EXTERNAL_EVENT', { 
             action: 'LOG', 
             message: `${scenario.system} -> ${scenario.activity}`
           });
        }

      }, 3000); // Every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isRunning, dispatch]);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">Event Stream Sim</h3>
           <p className="text-[10px] text-slate-400">Generates synthetic enterprise traffic.</p>
        </div>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
             isRunning ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
          }`}
        >
           {isRunning ? 'Stop Stream' : 'Start Stream'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 scroll-smooth" ref={scrollRef}>
         <AnimatePresence initial={false}>
            {logs.length === 0 && <p className="text-center text-xs text-slate-300 italic mt-10">No events generated yet.</p>}
            {logs.map(log => (
               <MotionDiv 
                  key={log.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className={`p-3 rounded-lg border text-[10px] ${
                      log.activity === 'JIRA_ISSUE_CLOSED' 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-slate-50 border-slate-100'
                  }`}
               >
                  <div className="flex justify-between text-slate-400 font-mono mb-1">
                     <span>{log.timestamp}</span>
                     <span>{log.sourceSystemId}</span>
                  </div>
                  <div className={`font-bold ${log.activity === 'JIRA_ISSUE_CLOSED' ? 'text-amber-700' : 'text-slate-700'}`}>
                     {log.activity}
                  </div>
                  {log.activity === 'JIRA_ISSUE_CLOSED' && (
                     <div className="mt-1 flex items-center gap-1 text-amber-600">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="font-bold">Trigger: Unlocking Stage 3</span>
                     </div>
                  )}
               </MotionDiv>
            ))}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default EventStreamSimulator;