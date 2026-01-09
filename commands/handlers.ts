
import { ProjectState, Command, StageStatus, ApprovalDocument, DocumentType, StageApproval, DigitalSeal } from '../types';
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

    case 'ANALYZE_ECOSYSTEM': {
      events.push(createEvent('ANALYZE_ECOSYSTEM', newState.projectName, {}));
      break;
    }

    case 'RECEIVE_AI_RESULT': {
      const { auditResult, marketingPitch, insights, ipWhitepaper, integrationStory } = command.payload;
      
      if (auditResult && currentStage) {
        currentStage.aiStatus = auditResult.status === 'APPROVED' ? 'VERIFIED' : 'FAILED';
        currentStage.complianceScore = auditResult.complianceScore;
        currentStage.confidenceScore = auditResult.confidenceScore;
        currentStage.dependencies = auditResult.dependencies;
        currentStage.infrastructureAdvisory = auditResult.infrastructureAdvisory;
        if (auditResult.swot) {
          currentStage.swot = auditResult.swot;
        }
      }
      
      if (marketingPitch && currentStage) currentStage.marketingPitch = marketingPitch;
      if (insights && currentStage) currentStage.aiInsights = insights;
      if (ipWhitepaper && currentStage) currentStage.ipWhitepaper = ipWhitepaper;
      
      if (integrationStory) {
        newState.integrationStory = integrationStory;
      }
      
      events.push(createEvent('AI_SYNC_COMPLETED', newState.projectName, { hasStory: !!integrationStory }));
      break;
    }

    case 'APPROVE_STAGE': {
      if (!currentStage) break;
      
      const user = command.payload.user; // User passed in payload
      if (!user) throw new Error("Security Violation: Anonymous approvals denied.");

      if (currentStage.aiStatus !== 'VERIFIED' && currentStage.aiStatus !== 'OVERRIDDEN') {
        throw new Error("Governance Block: AI Intelligence must verify consistency first.");
      }
      if (!currentStage.checklist.every(c => c.isCompleted)) {
        throw new Error("Governance Block: All manual sign-offs are mandatory.");
      }
      
      // Check if user is required
      if (!currentStage.requiredRoles.includes(user.role)) {
         throw new Error(`Role Conflict: ${user.role} is not authorized for this gate.`);
      }

      // Check for duplicate signature
      if (currentStage.approvals.some(a => a.role === user.role)) {
         throw new Error("Duplicate Signature Detected.");
      }

      // Add Signature
      const newApproval: StageApproval = {
        role: user.role,
        signerName: user.name,
        timestamp: new Date().toLocaleTimeString(),
        signatureHash: Math.random().toString(16).substr(2, 8).toUpperCase()
      };
      
      currentStage.approvals.push(newApproval);
      events.push(createEvent('STAGE_SIGNED', newState.projectName, { stageId: currentStage.id, signer: user.name, role: user.role }));

      // Check if ALL required roles have signed (4-Augen-Prinzip)
      const allSigned = currentStage.requiredRoles.every(reqRole => currentStage.approvals.some(a => a.role === reqRole));

      if (allSigned) {
        currentStage.status = StageStatus.COMPLETED;
        
        // Generate Digital Seal
        const seal: DigitalSeal = {
          timestamp: new Date().toISOString(),
          certificateId: `CRT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          hash: Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          issuer: 'BlueBanana Trust Authority (D-TRUST)',
          standard: 'PAdES-B-LT (Long Term Validation)'
        };
        currentStage.digitalSeal = seal;

        const nextIdx = activeIdx + 1;
        if (nextIdx < newState.stages.length) {
          newState.stages[nextIdx].status = StageStatus.ACTIVE;
          newState.currentStageIndex = nextIdx;
        }
        events.push(createEvent('APPROVE_STAGE_FINAL', newState.projectName, { stageId: currentStage.id, certificate: seal.certificateId }));
      }
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

    case 'GENERATE_ISO_COMPLIANCE_REPORT': {
      events.push(createEvent('GENERATE_ISO_COMPLIANCE_REPORT', newState.projectName, { triggeredBy: command.user?.name }));
      break;
    }

    case 'EXTERNAL_EVENT': {
      const { action, stageIndex, message } = command.payload;
      
      if (action === 'UNLOCK_STAGE' && typeof stageIndex === 'number') {
        // Forcefully update the stage status for simulation purposes
        if (newState.stages[stageIndex]) {
           // Complete previous stages if needed (optional logic, keeping it simple)
           if (stageIndex > 0) {
             newState.stages[stageIndex - 1].status = StageStatus.COMPLETED;
           }
           newState.stages[stageIndex].status = StageStatus.ACTIVE;
           newState.currentStageIndex = stageIndex;
           events.push(createEvent('EXTERNAL_TRIGGER_UNLOCK', newState.projectName, { stage: newState.stages[stageIndex].name, reason: message }));
        }
      } else {
        events.push(createEvent('EXTERNAL_LOG', newState.projectName, { message }));
      }
      break;
    }

    default:
      events.push(createEvent(command.type, newState.projectName, {}));
      break;
  }

  return { newState, events };
};
