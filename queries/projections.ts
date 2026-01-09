
import { ProjectState, ReadModel, SystemEvent, CommandType, StageStatus, ActionPlanItem } from '../types';
import { DomainEvent } from '../shared/events';

const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }
  return `0x${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
};

export const projectReadModel = (state: ProjectState, events: DomainEvent[]): ReadModel => {
  const activeIdx = state.currentStageIndex;
  const currentStage = state.stages[activeIdx] || null;

  // Build the Hash Chain
  let lastHash = "0x00000000";
  const trace: SystemEvent[] = events.map((e): SystemEvent => {
    const currentHash = generateHash(`${e.type}-${e.timestamp}-${lastHash}`);
    const eventObj: SystemEvent = {
      id: e.id,
      commandType: e.type.split('_')[0] as CommandType,
      category: getEventCategory(e.type),
      status: 'SUCCESS',
      message: formatEventMessage(e),
      timestamp: new Date(e.timestamp).toLocaleTimeString(),
      auditHash: currentHash,
      previousHash: lastHash,
      evidenceReference: e.aggregateId
    };
    lastHash = currentHash;
    return eventObj;
  }).reverse();

  const aiActions = events.filter(e => ['AI_SYNC_COMPLETED', 'GENERATE_MARKETING', 'ANALYZE_ECOSYSTEM'].includes(e.type)).length;
  const humanActions = events.filter(e => ['TOGGLE_CHECKLIST', 'GOVERNANCE_OVERRIDE', 'APPROVE_STAGE'].includes(e.type)).length;
  const balance = (aiActions + humanActions) === 0 ? 50 : (aiActions / (aiActions + humanActions)) * 100;

  const depConsistency = currentStage?.dependencies.length 
    ? (currentStage.dependencies.filter(d => d.status === 'CONSISTENT').length / currentStage.dependencies.length) * 100 
    : 0;
  const integrityScore = currentStage ? (currentStage.complianceScore * 0.7 + depConsistency * 0.3) : 0;

  const verifiedStagesCount = state.stages.filter(s => ['VERIFIED', 'OVERRIDDEN'].includes(s.aiStatus) || s.status === StageStatus.COMPLETED).length;
  const verifiedProgress = (verifiedStagesCount / state.stages.length) * 100;

  const siloScore = state.integrations.reduce((acc, int) => acc + (int.status === 'CONNECTED' || int.status === 'SYNCING' ? 25 : 0), 0);

  // GATE LOGIC & ACTION PLAN GENERATION
  const actionPlan: ActionPlanItem[] = [];
  
  if (currentStage) {
    // 1. Checklists
    currentStage.checklist.forEach(item => {
      if (!item.isCompleted) {
        actionPlan.push({
          type: 'CHECKLIST',
          label: `Complete Task: ${item.label}`,
          priority: 'HIGH',
          status: 'PENDING',
          assignedTo: 'Project Team'
        });
      }
    });

    // 2. AI Integrity
    if (currentStage.aiStatus !== 'VERIFIED' && currentStage.aiStatus !== 'OVERRIDDEN') {
      actionPlan.push({
        type: 'AI_AUDIT',
        label: currentStage.aiStatus === 'FAILED' ? 'Resolve Audit Conflicts or Override' : 'Run Enterprise Intelligence Check',
        priority: 'HIGH',
        status: 'PENDING',
        assignedTo: 'AI Engine'
      });
    }

    // 3. Signatures
    currentStage.requiredRoles.forEach(role => {
      const hasSigned = currentStage.approvals.some(a => a.role === role);
      if (!hasSigned) {
        actionPlan.push({
          type: 'SIGNATURE',
          label: `Pending Sign-off: ${role}`,
          priority: 'MEDIUM',
          status: 'PENDING',
          assignedTo: role
        });
      }
    });
  }

  const isGateReady = currentStage ? actionPlan.length === 0 : false;

  const isOverrideAvailable = currentStage?.aiStatus === 'FAILED' || (currentStage?.aiStatus === 'VERIFIED' && currentStage.confidenceScore < 60);

  return {
    projectOverview: {
      name: state.projectName,
      version: state.architecture.version,
      currentStageName: currentStage?.name || 'Abgeschlossen',
      progressPercent: (activeIdx / state.stages.length) * 100,
      verifiedProgressPercent: verifiedProgress,
      governanceBalance: balance,
      integrityScore: Math.round(integrityScore),
      auditStatus: integrityScore > 80 ? 'VERIFIED' : integrityScore > 50 ? 'COMPLIANT' : 'WARNING',
      isChainValid: state.isChainVerified,
      siloConnectivityScore: siloScore
    },
    activeStageDetails: currentStage,
    infrastructure: state.infrastructure,
    integrations: state.integrations,
    integrationStory: state.integrationStory,
    roadmapView: state.stages.map(s => s.roadmap),
    financialAudit: {
      totalBudget: state.stages.reduce((acc, s) => acc + s.finance.budget, 0),
      totalSpent: state.stages.reduce((acc, s) => acc + s.finance.actualSpent, 0),
      stages: state.stages.map(s => ({ 
        name: s.name, 
        spent: s.finance.actualSpent, 
        budget: s.finance.budget 
      }))
    },
    systemTrace: trace,
    unlockingStatus: {
      isGateReady,
      isOverrideAvailable,
      nextStageAllowed: activeIdx < state.stages.length,
      isProcessing: false,
      reason: !isGateReady ? "Prerequisites incomplete" : undefined,
      actionPlan
    }
  };
};

function getEventCategory(type: string): 'INNOVATION' | 'ASSURANCE' | 'SYSTEM' | 'INFRASTRUCTURE' {
  if (type.startsWith('AI_') || type.startsWith('GENERATE_') || type.startsWith('RECEIVE_') || type.startsWith('ANALYZE_')) return 'INNOVATION';
  if (type.startsWith('TOGGLE_') || type.startsWith('GOVERNANCE_') || type.startsWith('APPROVE_')) return 'ASSURANCE';
  if (type.startsWith('SWITCH_') || type.startsWith('SYNC_')) return 'INFRASTRUCTURE';
  return 'SYSTEM';
}

function formatEventMessage(event: DomainEvent): string {
  switch (event.type) {
    case 'AI_SYNC_COMPLETED': return `Deterministischer Cross-Check validiert.`;
    case 'GOVERNANCE_OVERRIDE': return `Manuelles Governance-Mandat durch Auditor erteilt.`;
    case 'APPROVE_STAGE': return `Phase erfolgreich im Audit-Log finalisiert.`;
    case 'TOGGLE_CHECKLIST': return `Manuelle Sign-Off Änderung protokolliert.`;
    case 'UPLOAD_DOCUMENTS': return `Artefakte (${event.payload?.count || 1}) sicher im Vault abgelegt.`;
    case 'TRIGGER_AI_AUDIT': return `Enterprise Intelligence Audit initiiert.`;
    case 'GENERATE_ISO_COMPLIANCE_REPORT': return `ISO-Konformitätsbericht generiert.`;
    case 'ANALYZE_ECOSYSTEM': return `Digital Thread Analyse gestartet.`;
    case 'SYNC_INTEGRATION': return `System-Synchronisation angefordert.`;
    case 'SWITCH_INFRASTRUCTURE': return `Infrastruktur-Konfiguration aktualisiert.`;
    case 'VERIFY_CHAIN': return `Blockchain-Verifizierung erfolgreich.`;
    default: return `${event.type} Event verarbeitet.`;
  }
}
