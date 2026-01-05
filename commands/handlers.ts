
import { ProjectState, Command, StageStatus, ApprovalDocument, DocumentType } from '../types';
import { DomainEvent, createEvent } from '../shared/events';

export interface CommandResult {
  newState: ProjectState;
  events: DomainEvent[];
}

export const executeCommand = (state: ProjectState, command: Command): CommandResult => {
  const newState: ProjectState = JSON.parse(JSON.stringify(state));
  const events: DomainEvent[] = [];
  const activeIdx = newState.currentStageIndex;
  const currentStage = newState.stages[activeIdx];

  switch (command.type) {
    case 'VERIFY_CHAIN': {
      newState.isChainVerified = true;
      events.push(createEvent('VERIFY_CHAIN', newState.projectName, { result: 'PASSED' }));
      break;
    }

    case 'SYNC_INTEGRATION': {
      const { systemId } = command.payload;
      newState.integrations = newState.integrations.map(int => 
        int.id === systemId ? { ...int, status: 'SYNCING', lastSync: 'Just now' } : int
      );
      events.push(createEvent('SYNC_INTEGRATION', newState.projectName, { systemId }));
      break;
    }

    case 'SWITCH_INFRASTRUCTURE': {
      const { type } = command.payload;
      newState.infrastructure.deploymentType = type;
      events.push(createEvent('SWITCH_INFRASTRUCTURE', newState.projectName, { newType: type }));
      break;
    }

    case 'UPLOAD_DOCUMENTS': {
      if (!currentStage) break;
      const { files, sourceSystem } = command.payload;
      const documents: ApprovalDocument[] = files.map((f: any) => ({
        name: f.name,
        type: f.name.toLowerCase().includes('bom') ? DocumentType.BOM : 
              f.name.toLowerCase().includes('sch') ? DocumentType.SCHEMATIC : DocumentType.SPECIFICATION,
        uploadDate: new Date().toLocaleString(),
        size: `${(f.size / 1024).toFixed(1)} KB`,
        sourceSystem: sourceSystem || 'Manual Upload'
      }));
      currentStage.approvalDocuments = [...currentStage.approvalDocuments, ...documents];
      currentStage.aiStatus = 'IDLE'; 
      newState.isChainVerified = false;
      events.push(createEvent('UPLOAD_DOCUMENTS', newState.projectName, { count: files.length, source: sourceSystem }));
      break;
    }

    case 'TRIGGER_AI_AUDIT': {
      if (!currentStage) break;
      currentStage.aiStatus = 'PENDING';
      events.push(createEvent('TRIGGER_AI_AUDIT', newState.projectName, {}));
      break;
    }

    case 'RECEIVE_AI_RESULT': {
      if (!currentStage) break;
      const { auditResult, marketingPitch, insights, ipWhitepaper } = command.payload;
      if (auditResult) {
        currentStage.aiStatus = auditResult.status === 'APPROVED' ? 'VERIFIED' : 'FAILED';
        currentStage.complianceScore = auditResult.complianceScore;
        currentStage.confidenceScore = auditResult.confidenceScore;
        currentStage.dependencies = auditResult.dependencies;
        currentStage.infrastructureAdvisory = auditResult.infrastructureAdvisory;
        if (auditResult.swot) {
          currentStage.swot = auditResult.swot;
        }
      }
      if (marketingPitch) currentStage.marketingPitch = marketingPitch;
      if (insights) currentStage.aiInsights = insights;
      if (ipWhitepaper) currentStage.ipWhitepaper = ipWhitepaper;
      
      events.push(createEvent('AI_SYNC_COMPLETED', newState.projectName, {}));
      break;
    }

    case 'APPROVE_STAGE': {
      if (!currentStage) break;
      if (currentStage.aiStatus !== 'VERIFIED' && currentStage.aiStatus !== 'OVERRIDDEN') {
        throw new Error("Governance Block: AI Intelligence must verify consistency first.");
      }
      if (!currentStage.checklist.every(c => c.isCompleted)) {
        throw new Error("Governance Block: All manual sign-offs are mandatory for audit compliance.");
      }

      currentStage.status = StageStatus.COMPLETED;
      const nextIdx = activeIdx + 1;
      if (nextIdx < newState.stages.length) {
        newState.stages[nextIdx].status = StageStatus.ACTIVE;
        newState.currentStageIndex = nextIdx;
      }
      events.push(createEvent('APPROVE_STAGE', newState.projectName, { stageId: currentStage.id }));
      break;
    }

    case 'TOGGLE_CHECKLIST': {
      if (!currentStage) break;
      const { itemId } = command.payload;
      currentStage.checklist = currentStage.checklist.map(c => 
        c.id === itemId ? { ...c, isCompleted: !c.isCompleted } : c
      );
      currentStage.aiStatus = 'IDLE';
      newState.isChainVerified = false;
      events.push(createEvent('TOGGLE_CHECKLIST', newState.projectName, { itemId }));
      break;
    }

    case 'GOVERNANCE_OVERRIDE': {
      if (!currentStage) break;
      const { justification } = command.payload;
      currentStage.aiStatus = 'OVERRIDDEN';
      events.push(createEvent('GOVERNANCE_OVERRIDE', newState.projectName, { justification }));
      break;
    }

    case 'EXPORT_AUDIT': {
        events.push(createEvent('EXPORT_AUDIT', newState.projectName, { format: 'ISO-Dossier-JSON' }));
        break;
    }

    default:
      events.push(createEvent(command.type, newState.projectName, {}));
      break;
  }

  return { newState, events };
};
