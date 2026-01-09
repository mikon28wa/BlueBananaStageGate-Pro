
import { SystemNode, ArtifactNode, Edge, ThreadEvent } from './digitalThreadModel';

// 1. SYSTEMS
export const MOCK_SYSTEMS: SystemNode[] = [
  { id: 'sys-bb', name: 'BlueBanana Core', systemType: 'ORCHESTRATOR', url: 'https://app.bluebanana.io' },
  { id: 'sys-sap', name: 'SAP S/4HANA', systemType: 'ERP', url: 'sap://s4h.prod.internal' },
  { id: 'sys-tc', name: 'Siemens Teamcenter', systemType: 'PLM', url: 'https://plm.engineering.internal' },
  { id: 'sys-jira', name: 'Jira Software', systemType: 'ISSUE_TRACKER', url: 'https://jira.corp.net' }
];

// 2. ARTIFACTS
export const MOCK_ARTIFACTS: ArtifactNode[] = [
  // Jira Ticket
  { 
    id: 'art-req-101', 
    externalId: 'PROJ-402', 
    artifactType: 'CHANGE_REQUEST', 
    systemId: 'sys-jira', 
    status: 'PENDING', 
    version: '1.0', 
    createdAt: '2024-05-10T08:00:00Z', 
    updatedAt: '2024-05-10T08:30:00Z' 
  },
  // PLM Item
  { 
    id: 'art-part-882', 
    externalId: 'PN-88200-A', 
    artifactType: 'PART', 
    systemId: 'sys-tc', 
    status: 'DRAFT', 
    version: 'A.1', 
    createdAt: '2024-05-10T09:00:00Z', 
    updatedAt: '2024-05-10T09:15:00Z' 
  },
  // ERP Costing
  { 
    id: 'art-cost-882', 
    externalId: 'MAT-88200', 
    artifactType: 'COST_SHEET', 
    systemId: 'sys-sap', 
    status: 'RELEASED', 
    version: '1', 
    createdAt: '2024-05-10T10:00:00Z', 
    updatedAt: '2024-05-10T10:00:00Z' 
  }
];

// 3. EDGES (Relationships)
export const MOCK_EDGES: Edge[] = [
  { id: 'edge-1', sourceId: 'art-req-101', targetId: 'art-part-882', edgeType: 'TRACE', metadata: { type: 'implements' } },
  { id: 'edge-2', sourceId: 'art-part-882', targetId: 'art-cost-882', edgeType: 'SYSTEM_FLOW', metadata: { method: 'sync_material_master' } }
];

// 4. EVENTS (Timeline)
// Scenario: Engineering Change Request (ECR) flowing through the system
export const MOCK_THREAD_EVENTS: ThreadEvent[] = [
  {
    id: 'evt-001',
    timestamp: '09:00:01',
    caseId: 'CASE-ECR-2024-001',
    activity: 'Ticket Created: ECR #402',
    actor: 'James Chen',
    sourceSystemId: 'sys-jira',
    targetSystemId: 'sys-bb',
    artifactId: 'art-req-101'
  },
  {
    id: 'evt-002',
    timestamp: '09:00:05',
    caseId: 'CASE-ECR-2024-001',
    activity: 'Req Analysis & Impact Check',
    actor: 'BlueBanana AI',
    sourceSystemId: 'sys-bb',
    targetSystemId: 'sys-tc',
    artifactId: 'art-req-101',
    dataQualityFlags: []
  },
  {
    id: 'evt-003',
    timestamp: '09:15:22',
    caseId: 'CASE-ECR-2024-001',
    activity: 'BOM Update: Revision B',
    actor: 'System Integration',
    sourceSystemId: 'sys-tc',
    targetSystemId: 'sys-bb',
    artifactId: 'art-part-882'
  },
  {
    id: 'evt-004',
    timestamp: '09:15:25',
    caseId: 'CASE-ECR-2024-001',
    activity: 'Data Mapping Validation',
    actor: 'BlueBanana Core',
    sourceSystemId: 'sys-bb',
    targetSystemId: 'sys-sap',
    dataQualityFlags: ['FIELD_MAPPING_WARNING']
  },
  {
    id: 'evt-005',
    timestamp: '09:16:10',
    caseId: 'CASE-ECR-2024-001',
    activity: 'Material Master Update',
    actor: 'SAP Gateway',
    sourceSystemId: 'sys-sap',
    artifactId: 'art-cost-882'
  },
  {
    id: 'evt-006',
    timestamp: '10:30:00',
    caseId: 'CASE-ECR-2024-001',
    activity: 'Cost Rollup Complete',
    actor: 'SAP Background Job',
    sourceSystemId: 'sys-sap',
    targetSystemId: 'sys-bb'
  },
  {
    id: 'evt-007',
    timestamp: '10:30:05',
    caseId: 'CASE-ECR-2024-001',
    activity: 'Ticket Status: In Review',
    actor: 'BlueBanana Bot',
    sourceSystemId: 'sys-bb',
    targetSystemId: 'sys-jira',
    artifactId: 'art-req-101'
  }
];
