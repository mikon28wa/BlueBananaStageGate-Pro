
import { ProjectState, Command, StageStatus, ApprovalDocument, AiAuditStatus } from '../types';
import { DomainEvent, createEvent } from '../shared/events';

export interface CommandResult {
  newState: ProjectState;
  events: DomainEvent[];
}

/**
 * COMMAND HANDLER: Führt Geschäftslogik aus.
 * Die AI Calculation Layer ist hier integriert, um bei Dokumenten-Uploads
 * oder expliziten Audits den Systemzustand zu berechnen.
 */
export const executeCommand = (state: ProjectState, command: Command): CommandResult => {
  const newState: ProjectState = JSON.parse(JSON.stringify(state));
  const events: DomainEvent[] = [];

  switch (command.type) {
    case 'UPLOAD_DOCUMENTS': {
      const { files } = command.payload;
      const idx = newState.currentStageIndex;
      
      const documents: ApprovalDocument[] = files.map((f: any) => ({
        name: f.name,
        uploadDate: new Date().toLocaleString(),
        size: `${(f.size / 1024).toFixed(1)} KB`
      }));

      newState.stages[idx].approvalDocuments = [
        ...newState.stages[idx].approvalDocuments,
        ...documents
      ];
      
      // Trigger AI Calculation Flow
      newState.stages[idx].aiStatus = 'PENDING';
      
      events.push(createEvent('UPLOAD_DOCUMENTS', newState.projectName, { 
        count: files.length 
      }));
      break;
    }

    case 'RUN_AI_AUDIT': {
      const { auditResult } = command.payload;
      const idx = newState.currentStageIndex;
      
      // KI-Berechnungsergebnisse in den State schreiben
      newState.stages[idx].aiStatus = auditResult.status === 'APPROVED' ? 'VERIFIED' : 'FAILED';
      newState.stages[idx].complianceScore = auditResult.complianceScore;
      newState.stages[idx].confidenceScore = auditResult.confidenceScore;
      
      events.push(createEvent('AI_AUDIT_COMPLETED', newState.projectName, { 
        status: auditResult.status,
        score: newState.stages[idx].complianceScore,
        confidence: newState.stages[idx].confidenceScore
      }));
      break;
    }

    case 'APPROVE_STAGE': {
      const idx = newState.currentStageIndex;
      
      // Nur zulassen, wenn KI verifiziert hat (Guard Logik auf Command Seite)
      if (newState.stages[idx].aiStatus !== 'VERIFIED') {
        throw new Error("Command abgelehnt: KI-Verifizierung fehlt.");
      }

      newState.stages[idx].status = StageStatus.COMPLETED;
      
      const prevIdx = idx;
      newState.currentStageIndex++;
      if (newState.currentStageIndex < newState.stages.length) {
        newState.stages[newState.currentStageIndex].status = StageStatus.ACTIVE;
      }

      events.push(createEvent('APPROVE_STAGE', newState.projectName, { 
        stageId: newState.stages[prevIdx].id 
      }));
      break;
    }

    case 'TOGGLE_CHECKLIST': {
      const { itemId } = command.payload;
      const idx = newState.currentStageIndex;
      newState.stages[idx].checklist = newState.stages[idx].checklist.map((c: any) => 
        c.id === itemId ? { ...c, isCompleted: !c.isCompleted } : c
      );
      
      // Jede Checklistenänderung setzt KI-Status zurück (muss neu berechnet werden)
      newState.stages[idx].aiStatus = 'IDLE';
      
      events.push(createEvent('TOGGLE_CHECKLIST', newState.projectName, { itemId }));
      break;
    }

    case 'GENERATE_MARKETING':
      events.push(createEvent('GENERATE_MARKETING', newState.projectName, {}));
      break;

    case 'EXPORT_AUDIT':
      events.push(createEvent('EXPORT_AUDIT', newState.projectName, {}));
      break;
  }

  return { newState, events };
};
