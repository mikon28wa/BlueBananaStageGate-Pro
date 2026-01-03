
import { ProjectState, ReadModel, SystemEvent, CommandType } from '../types';
import { DomainEvent } from '../shared/events';

/**
 * PROJECTOR: Erzeugt optimierte Read-Modelle für das Dashboard.
 */
export const projectReadModel = (state: ProjectState, events: DomainEvent[]): ReadModel => {
  const currentStage = state.stages[state.currentStageIndex] || null;
  const totalBudget = state.stages.reduce((acc, s) => acc + s.finance.budget, 0);
  const totalSpent = state.stages.reduce((acc, s) => acc + s.finance.actualSpent, 0);

  // Berechnung des verifizierten Fortschritts (nur KI-bestätigte Phasen zählen 100%)
  const verifiedStagesCount = state.stages.filter(s => s.aiStatus === 'VERIFIED' || s.status === 'COMPLETED').length;
  const verifiedProgress = (verifiedStagesCount / state.stages.length) * 100;

  const trace: SystemEvent[] = events.map((e): SystemEvent => ({
    id: e.id,
    commandType: e.type.split('_')[0] as CommandType,
    status: e.type.includes('SUCCESS') || e.type.includes('COMPLETED') ? 'SUCCESS' : 'PENDING',
    message: formatEventMessage(e),
    timestamp: new Date(e.timestamp).toLocaleTimeString()
  })).reverse();

  // Dashboard Unlocking Status Logik
  const isGateReady = currentStage ? (currentStage.aiStatus === 'VERIFIED' && currentStage.checklist.every(c => c.isCompleted)) : false;

  return {
    projectOverview: {
      name: state.projectName,
      version: state.architecture.version,
      currentStageName: currentStage?.name || 'Abgeschlossen',
      progressPercent: (state.currentStageIndex / state.stages.length) * 100,
      verifiedProgressPercent: verifiedProgress
    },
    activeStageDetails: currentStage,
    roadmapView: state.stages.map(s => s.roadmap),
    financialAudit: {
      totalBudget,
      totalSpent,
      stages: state.stages.map(s => ({ 
        name: s.name, 
        spent: s.finance.actualSpent, 
        budget: s.finance.budget 
      }))
    },
    systemTrace: trace,
    unlockingStatus: {
      isGateReady,
      reason: !isGateReady ? (currentStage?.aiStatus !== 'VERIFIED' ? "KI-Audit steht noch aus" : "Checkliste unvollständig") : undefined
    }
  };
};

function formatEventMessage(event: DomainEvent): string {
  switch (event.type) {
    case 'UPLOAD_DOCUMENTS_SUCCESS': return `Dokumente zur KI-Prüfung hinzugefügt.`;
    case 'AI_AUDIT_COMPLETED': return `KI-Berechnung abgeschlossen: Score ${event.payload.score}%.`;
    case 'APPROVE_STAGE_SUCCESS': return `Phasen-Gate erfolgreich passiert.`;
    case 'TOGGLE_CHECKLIST_SUCCESS': return `Anforderung manuell aktualisiert.`;
    case 'GENERATE_MARKETING_SUCCESS': return `Marketing-Content generiert.`;
    case 'EXPORT_AUDIT_SUCCESS': return `Audit-Log exportiert.`;
    default: return `Operation: ${event.type}`;
  }
}
