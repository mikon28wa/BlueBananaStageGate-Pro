
import React from 'react';
import SwotAnalysis from '../components/SwotAnalysis';
import { SwotData } from '../types';

interface SwotProps {
  data?: SwotData;
}

const Swot: React.FC<SwotProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white/10">
        <h2 className="text-3xl font-black text-white mb-4">Awaiting Analysis</h2>
        <p className="text-slate-400">Complete the initial strategy audit to generate real-time SWOT data.</p>
      </div>
    );
  }
  return <SwotAnalysis data={data} />;
};

export default Swot;
