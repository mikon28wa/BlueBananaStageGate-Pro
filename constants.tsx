
import { ProductStage, StageStatus, ArchitectureInfo, IntegrationStatus, InfrastructureConfig, User, UserRole } from './types';

export const SYSTEM_ARCHITECTURE: ArchitectureInfo = {
  type: "Private Cloud Native",
  architecture: "Distributed CQRS with Vertex AI Integration",
  performance: "0.5ms Sync Latency",
  changeFrequency: "Live System Audits",
  version: "v3.0.0-enterprise"
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Sarah Weber', role: UserRole.PROJECT_MANAGER, avatarInitials: 'SW' },
  { id: 'u2', name: 'James Chen', role: UserRole.LEAD_ENGINEER, avatarInitials: 'JC' },
  { id: 'u3', name: 'Marcus Sterling', role: UserRole.QUALITY_AUDITOR, avatarInitials: 'MS' },
  { id: 'u4', name: 'Elena Korv', role: UserRole.SECURITY_OFFICER, avatarInitials: 'EK' }
];

export const INITIAL_INFRASTRUCTURE: InfrastructureConfig = {
  deploymentType: 'VPC_PRIVATE',
  encryptionStatus: 'AES-256 GCM',
  vpcTunnelId: 'TUN-882-VX-SECURE',
  region: 'europe-west3 (Frankfurt)',
  modelIsolation: true
};

export const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  { id: 'i1', systemName: 'SAP S/4HANA', type: 'ERP', status: 'CONNECTED', lastSync: '10m ago', silosBroken: 85, latencyMs: 24, pendingEvents: 0 },
  { id: 'i2', systemName: 'Siemens Teamcenter', type: 'PLM', status: 'SYNCING', lastSync: '2m ago', silosBroken: 92, latencyMs: 120, pendingEvents: 3 },
  { id: 'i3', systemName: 'Jira Software', type: 'ISSUE_TRACKER', status: 'CONNECTED', lastSync: 'Real-time', silosBroken: 100, latencyMs: 45, pendingEvents: 12 },
  { id: 'i4', systemName: 'Salesforce CRM', type: 'CRM', status: 'DISCONNECTED', lastSync: '2d ago', silosBroken: 45, latencyMs: 0, pendingEvents: 0 }
];

export const INITIAL_STAGES: ProductStage[] = [
  {
    id: '1',
    name: 'Strategie',
    title: 'ISO 9001: Qualitätsmanagement',
    description: 'Festlegung des QMS-Rahmens, Risikoanalysen und Marktvalidierung.',
    status: StageStatus.ACTIVE,
    aiStatus: 'IDLE',
    complianceScore: 0,
    confidenceScore: 0,
    keyRequirements: ['Kontext-Analyse', 'Risiko-Register'],
    checklist: [
      { id: 'c1-1', label: 'Qualitätsziele (ISO 5.2) definiert & abgeglichen', isCompleted: false },
      { id: 'c1-2', label: 'Stakeholder-Analyse (ISO 4.2) finalisiert', isCompleted: false },
      { id: 'c1-3', label: 'Risiko-Chancen-Matrix (ISO 6.1) erstellt', isCompleted: false },
      { id: 'c1-4', label: 'Marktanalyse & Business Case validiert', isCompleted: false }
    ],
    approvalDocuments: [],
    dependencies: [],
    requiredRoles: [UserRole.PROJECT_MANAGER, UserRole.QUALITY_AUDITOR], // 4-Augen-Prinzip
    approvals: [],
    finance: { budget: 15000, actualSpent: 12500, currency: 'EUR' },
    roadmap: { startDate: '2024-01-01', endDate: '2024-02-15', milestone: 'Business Case Ready' }
  },
  {
    id: '2',
    name: 'Design',
    title: 'IPC-2221: PCB-Entwicklung',
    description: 'Design von Leiterplatten, Bauteilauswahl und thermisches Management.',
    status: StageStatus.LOCKED,
    aiStatus: 'IDLE',
    complianceScore: 0,
    confidenceScore: 0,
    keyRequirements: ['Schaltplan-Review'],
    checklist: [
      { id: 'c2-1', label: 'Schaltplan vs. Lastenheft verifiziert', isCompleted: false },
      { id: 'c2-2', label: 'Bauteil-Freigabe (AVL Check & Verfügbarkeit)', isCompleted: false },
      { id: 'c2-3', label: 'Lagenaufbau & Impedanz (IPC-2221B) validiert', isCompleted: false },
      { id: 'c2-4', label: 'Thermische Simulation (< 85°C Hotspots)', isCompleted: false }
    ],
    approvalDocuments: [],
    dependencies: [],
    requiredRoles: [UserRole.LEAD_ENGINEER, UserRole.PROJECT_MANAGER],
    approvals: [],
    finance: { budget: 45000, actualSpent: 0, currency: 'EUR' },
    roadmap: { startDate: '2024-02-16', endDate: '2024-04-30', milestone: 'Gerber Files Final' }
  },
  {
    id: '3',
    name: 'Prototyping',
    title: 'IPC-A-610: Baugruppen-Qualität',
    description: 'Fertigung der Prototypen und Abnahmekriterien für elektronische Baugruppen.',
    status: StageStatus.LOCKED,
    aiStatus: 'IDLE',
    complianceScore: 0,
    confidenceScore: 0,
    keyRequirements: ['IPC Class Report'],
    checklist: [
      { id: 'c3-1', label: 'Lötstellen-Inspektion (IPC-A-610 Class 2)', isCompleted: false },
      { id: 'c3-2', label: 'Power-On Self-Test (POST) erfolgreich', isCompleted: false },
      { id: 'c3-3', label: 'AOI/AXI Bericht analysiert & freigegeben', isCompleted: false },
      { id: 'c3-4', label: 'Mechanischer Fit-Check (Gehäuse-Integration)', isCompleted: false }
    ],
    approvalDocuments: [],
    dependencies: [],
    requiredRoles: [UserRole.QUALITY_AUDITOR, UserRole.LEAD_ENGINEER],
    approvals: [],
    finance: { budget: 30000, actualSpent: 0, currency: 'EUR' },
    roadmap: { startDate: '2024-05-01', endDate: '2024-06-15', milestone: 'First Article Inspection' }
  },
  {
    id: '4',
    name: 'Sicherheit',
    title: 'IEC 62368-1: Produktsicherheit',
    description: 'Sicherheitsanforderungen für IT-Geräte und elektrische Sicherheitstests.',
    status: StageStatus.LOCKED,
    aiStatus: 'IDLE',
    complianceScore: 0,
    confidenceScore: 0,
    keyRequirements: ['Energiequellen-Audit'],
    checklist: [
      { id: 'c4-1', label: 'Energiequellen-Klassifizierung (ES1/ES2/ES3)', isCompleted: false },
      { id: 'c4-2', label: 'Isolationsfestigkeit (Hi-Pot Test) bestanden', isCompleted: false },
      { id: 'c4-3', label: 'Ableitstrom-Messung (Leakage < 0.5mA)', isCompleted: false },
      { id: 'c4-4', label: 'Erwärmungsprüfung (Normalbetrieb & Fehlerfall)', isCompleted: false }
    ],
    approvalDocuments: [],
    dependencies: [],
    requiredRoles: [UserRole.SECURITY_OFFICER, UserRole.QUALITY_AUDITOR],
    approvals: [],
    finance: { budget: 20000, actualSpent: 0, currency: 'EUR' },
    roadmap: { startDate: '2024-06-16', endDate: '2024-07-31', milestone: 'Safety Certification' }
  },
  {
    id: '5',
    name: 'Produktion',
    title: 'DFM & Serienreife',
    description: 'Optimierung der Montageprozesse und Vorbereitung der Massenproduktion.',
    status: StageStatus.LOCKED,
    aiStatus: 'IDLE',
    complianceScore: 0,
    confidenceScore: 0,
    keyRequirements: ['DFM Audit'],
    checklist: [
      { id: 'c5-1', label: 'Nutzen-Design (Panelization) freigegeben', isCompleted: false },
      { id: 'c5-2', label: 'Testabdeckung (ICT/FCT) > 95% validiert', isCompleted: false },
      { id: 'c5-3', label: 'Supply Chain Validierung (Second Sources)', isCompleted: false },
      { id: 'c5-4', label: 'Verpackungs-Falltest (ISTA 2A) bestanden', isCompleted: false }
    ],
    approvalDocuments: [],
    dependencies: [],
    requiredRoles: [UserRole.PROJECT_MANAGER, UserRole.QUALITY_AUDITOR, UserRole.LEAD_ENGINEER], // High stakes = 6-Augen
    approvals: [],
    finance: { budget: 100000, actualSpent: 0, currency: 'EUR' },
    roadmap: { startDate: '2024-08-01', endDate: '2024-12-31', milestone: 'Mass Production Start' }
  }
];
