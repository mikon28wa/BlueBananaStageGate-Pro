
export enum StageStatus {
  LOCKED = 'LOCKED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

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

export interface ProductStage {
  id: string;
  name: string;
  title: string;
  description: string;
  status: StageStatus;
  keyRequirements: string[];
  checklist: ChecklistItem[];
  approvalDocument?: ApprovalDocument;
  aiInsights?: string;
  marketingPitch?: string;
  finance: FinancialData;
  roadmap: RoadmapData;
}

export interface ProjectState {
  currentStageIndex: number;
  stages: ProductStage[];
  projectName: string;
}
