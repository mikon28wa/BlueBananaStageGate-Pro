
import React from 'react';
import RoadmapTimeline from '../components/RoadmapTimeline';
import { ProductStage } from '../types';

interface RoadmapProps {
  stages: ProductStage[];
  currentStageIndex: number;
}

const Roadmap: React.FC<RoadmapProps> = ({ stages, currentStageIndex }) => {
  return (
    <div className="h-full">
      <RoadmapTimeline 
        stages={stages} 
        currentStageIndex={currentStageIndex} 
      />
    </div>
  );
};

export default Roadmap;
