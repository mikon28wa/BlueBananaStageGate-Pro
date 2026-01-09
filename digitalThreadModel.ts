
export type SystemType = "ERP" | "PLM" | "ISSUE_TRACKER" | "ORCHESTRATOR" | "CAD" | "CRM";

export interface SystemNode {
  id: string;
  name: string;
  systemType: SystemType;
  url: string;
}

export type ArtifactType = 
  | "REQUIREMENT" 
  | "CHANGE_REQUEST" 
  | "BOM" 
  | "CAD_MODEL" 
  | "PART" 
  | "COST_SHEET" 
  | "CERTIFICATE";

export interface ArtifactNode {
  id: string;
  externalId: string;
  artifactType: ArtifactType;
  systemId: string;
  status: "DRAFT" | "RELEASED" | "OBSOLETE" | "PENDING";
  version: string;
  createdAt: string;
  updatedAt: string;
}

export type EdgeType = "TRACE" | "LIFECYCLE" | "SYSTEM_FLOW";

export interface Edge {
  id: string;
  sourceId: string; // ID of the source Artifact or System
  targetId: string; // ID of the target Artifact or System
  edgeType: EdgeType;
  metadata?: Record<string, any>;
}

export interface ThreadEvent {
  id: string;
  timestamp: string;
  caseId: string; // To group related events (e.g., one transaction)
  activity: string;
  actor: string;
  sourceSystemId: string;
  targetSystemId?: string;
  artifactId?: string;
  dataQualityFlags?: string[]; // e.g. ["TIMING_MISMATCH", "FIELD_TRUNCATED"]
}
