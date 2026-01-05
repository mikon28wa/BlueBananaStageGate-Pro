
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

export enum UserRole {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  LEAD_ENGINEER = 'LEAD_ENGINEER',
  QUALITY_AUDITOR = 'QUALITY_AUDITOR',
  SECURITY_OFFICER = 'SECURITY_OFFICER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
}

export interface StageApproval {
  role: UserRole;
  signerName: string;
  timestamp: string;
  signatureHash: string;
}

export interface DigitalSeal {
  timestamp: string;
  certificateId: string;
  hash: string;
  issuer: string;
  standard: string;
}

export interface SwotItem {
  point: string;
  significance: string;
  impact: 'low' | 'medium' | 'high';
  isAssumption?: boolean;
}

export interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  strategicRisks: string[];
  leveragePoints: string[];
  positioning: 'Conservative' | 'Balanced' | 'Aggressive';
  recommendations: {
    shortTerm: string[];
    midTerm: string[];
  };
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
  sourceSystem?: string;
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

export interface IntegrationStatus {
  id: string;
  systemName: string;
  type: 'ERP' | 'PLM' | 'CAD' | 'CRM';
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  lastSync: string;
  silosBroken: number;
}

export interface InfrastructureConfig {
  deploymentType: 'PUBLIC' | 'VPC_PRIVATE' | 'ON_PREMISE';
  encryptionStatus: string;
  vpcTunnelId?: string;
  region: string;
  modelIsolation: boolean;
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
  
  // New Matrix Fields
  requiredRoles: UserRole[];
  approvals: StageApproval[];
  digitalSeal?: DigitalSeal; // The Certificate

  aiInsights?: string;
  marketingPitch?: string;
  ipWhitepaper?: string;
  swot?: SwotData;
  infrastructureAdvisory?: string;
  finance: FinancialData;
  roadmap: RoadmapData;
}

export type CommandType = 
  | 'APPROVE_STAGE' 
  | 'TOGGLE_CHECKLIST' 
  | 'GENERATE_MARKETING' 
  | 'GENERATE_WHITEPAPER'
  | 'EXPORT_AUDIT'
  | 'GENERATE_ISO_COMPLIANCE_REPORT'
  | 'TRIGGER_AI_AUDIT' 
  | 'RECEIVE_AI_RESULT' 
  | 'UPLOAD_DOCUMENTS'
  | 'GOVERNANCE_OVERRIDE'
  | 'VERIFY_CHAIN'
  | 'SYNC_INTEGRATION'
  | 'SWITCH_INFRASTRUCTURE';

export interface Command {
  type: CommandType;
  payload: any;
  timestamp: number;
  user?: User; // Trace who triggered it
}

export interface SystemEvent {
  id: string;
  commandType: CommandType;
  category: 'INNOVATION' | 'ASSURANCE' | 'SYSTEM' | 'INFRASTRUCTURE';
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  message: string;
  timestamp: string;
  auditHash: string;
  previousHash: string;
  evidenceReference?: string;
  actor?: string; // Who did it
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
    isChainValid: boolean;
    siloConnectivityScore: number;
  };
  activeStageDetails: ProductStage | null;
  infrastructure: InfrastructureConfig;
  integrations: IntegrationStatus[];
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
  infrastructure: InfrastructureConfig;
  integrations: IntegrationStatus[];
  events: SystemEvent[];
  isChainVerified: boolean;
}
