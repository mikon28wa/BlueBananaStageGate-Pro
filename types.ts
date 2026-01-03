
export enum StageStatus {
  LOCKED = 'LOCKED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export type AiAuditStatus = 'IDLE' | 'PENDING' | 'VERIFIED' | 'FAILED';

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface ApprovalDocument {
  name: string;
  uploadDate: string;
  size: string;
}

export interface FinancialData {
  budget: number;
  actualSpent: number;
  currency: string;
}

export interface RoadmapData {
  startDate: string;
  endDate: string;
  milestone: string;
}

export interface ArchitectureInfo {
  type: string;
  architecture: string;
  performance: string;
  changeFrequency: string;
  version: string;
}

export interface ProductStage {
  id: string;
  name: string;
  title: string;
  description: string;
  status: StageStatus;
  aiStatus: AiAuditStatus;
  complianceScore: number;
  confidenceScore: number; // Added to track AI certainty
  keyRequirements: string[];
  checklist: ChecklistItem[];
  approvalDocuments: ApprovalDocument[];
  aiInsights?: string;
  finance: FinancialData;
  roadmap: RoadmapData;
}

// --- CQRS TYPES ---

export type CommandType = 
  | 'APPROVE_STAGE' 
  | 'TOGGLE_CHECKLIST' 
  | 'GENERATE_MARKETING' 
  | 'EXPORT_AUDIT'
  | 'RUN_AI_AUDIT' 
  | 'UPLOAD_DOCUMENTS';

export interface Command {
  type: CommandType;
  payload: any;
  timestamp: number;
}

export interface SystemEvent {
  id: string;
  commandType: CommandType;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  message: string;
  timestamp: string;
}

export interface ReadModel {
  projectOverview: {
    name: string;
    version: string;
    currentStageName: string;
    progressPercent: number;
    verifiedProgressPercent: number;
  };
  activeStageDetails: ProductStage | null;
  roadmapView: RoadmapData[];
  financialAudit: {
    totalBudget: number;
    totalSpent: number;
    stages: { name: string; spent: number; budget: number }[];
  };
  systemTrace: SystemEvent[];
  unlockingStatus: {
    isGateReady: boolean;
    reason?: string;
  };
}

export interface ProjectState {
  currentStageIndex: number;
  stages: ProductStage[];
  projectName: string;
  architecture: ArchitectureInfo;
  events: SystemEvent[];
}
