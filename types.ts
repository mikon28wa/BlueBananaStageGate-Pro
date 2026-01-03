
export enum StageStatus {
  LOCKED = 'LOCKED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export type AiAuditStatus = 'IDLE' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'OVERRIDDEN';

export enum DocumentType {
  BOM = 'Bill of Materials',
  SCHEMATIC = 'Schematic',
  SPECIFICATION = 'Specification',
  RISK_ASSESSMENT = 'Risk Assessment',
  OTHER = 'Other'
}

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface ApprovalDocument {
  name: string;
  type: DocumentType;
  uploadDate: string;
  size: string;
}

export interface DependencyResult {
  sourceDoc: string;
  targetDoc: string;
  status: 'CONSISTENT' | 'CONFLICT' | 'NOT_TESTED';
  finding: string;
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
  confidenceScore: number;
  keyRequirements: string[];
  checklist: ChecklistItem[];
  approvalDocuments: ApprovalDocument[];
  dependencies: DependencyResult[];
  aiInsights?: string;
  marketingPitch?: string;
  finance: FinancialData;
  roadmap: RoadmapData;
}

// --- CQRS & ARCHITECTURE TYPES ---

export type CommandType = 
  | 'APPROVE_STAGE' 
  | 'TOGGLE_CHECKLIST' 
  | 'GENERATE_MARKETING' 
  | 'EXPORT_AUDIT'
  | 'TRIGGER_AI_AUDIT' 
  | 'RECEIVE_AI_RESULT' 
  | 'UPLOAD_DOCUMENTS'
  | 'GOVERNANCE_OVERRIDE'
  | 'VERIFY_CHAIN'; // New command for auditor validation

export interface Command {
  type: CommandType;
  payload: any;
  timestamp: number;
}

export interface SystemEvent {
  id: string;
  commandType: CommandType;
  category: 'INNOVATION' | 'ASSURANCE' | 'SYSTEM';
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  message: string;
  timestamp: string;
  auditHash: string;
  previousHash: string; // Creates the immutable chain
  evidenceReference?: string;
}

export interface ReadModel {
  projectOverview: {
    name: string;
    version: string;
    currentStageName: string;
    progressPercent: number;
    verifiedProgressPercent: number;
    governanceBalance: number;
    integrityScore: number;
    auditStatus: 'VERIFIED' | 'COMPLIANT' | 'WARNING';
    isChainValid: boolean; // Result of integrity check
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
    isOverrideAvailable: boolean;
    isProcessing: boolean; 
    nextStageAllowed: boolean;
  };
}

export interface ProjectState {
  currentStageIndex: number;
  stages: ProductStage[];
  projectName: string;
  architecture: ArchitectureInfo;
  events: SystemEvent[];
  isChainVerified: boolean;
}
