
import { ProjectState, Command, ReadModel, CommandType } from '../types';
import { executeCommand, CommandResult } from '../commands/handlers';
import { projectReadModel } from '../queries/projections';
import { DomainEvent } from '../shared/events';
import { performDocumentAudit, generateMarketingMaterials, getStageGuidance, generateIPWhitepaper } from './geminiService';

/**
 * CQRS MANAGER (APPLICATION SERVICE LAYER)
 * Orchestrates Innovation (AI) & Assurance (Governance).
 * 
 * REPLACES: services/cqrsEngine.ts
 * This class serves as the central nervous system for the BlueBanana application,
 * maintaining the Single Source of Truth (Write Model) and projecting the
 * Read Model for the UI.
 */
export class CQRSManager {
  private writeModel: ProjectState;
  private eventStore: DomainEvent[] = [];
  private readModel: ReadModel;
  private isBusy: boolean = false;

  constructor(initialState: ProjectState) {
    this.writeModel = initialState;
    this.readModel = projectReadModel(initialState, []);
  }

  public async dispatch(command: Command): Promise<{ readModel: ReadModel; events: DomainEvent[] }> {
    try {
      const result: CommandResult = executeCommand(this.writeModel, command);
      this.writeModel = result.newState;
      this.eventStore = [...this.eventStore, ...result.events];

      this.syncReadModel();
      this.handleSideEffects(command);

      return { readModel: this.readModel, events: result.events };
    } catch (e) {
      console.error("Governance Rejection:", e);
      throw e;
    }
  }

  private async handleSideEffects(command: Command) {
    const activeStage = this.writeModel.stages[this.writeModel.currentStageIndex];
    if (!activeStage) return;

    if (command.type === 'TRIGGER_AI_AUDIT') {
      this.isBusy = true;
      try {
        const [auditResult, marketingPitch, insights, ipWhitepaper] = await Promise.all([
          performDocumentAudit(activeStage, this.writeModel.infrastructure, this.writeModel.integrations),
          generateMarketingMaterials(this.writeModel.projectName, activeStage),
          getStageGuidance(activeStage),
          generateIPWhitepaper(this.writeModel.projectName, activeStage)
        ]);

        await this.dispatch({
          type: 'RECEIVE_AI_RESULT',
          payload: { auditResult, marketingPitch, insights, ipWhitepaper },
          timestamp: Date.now()
        });
      } catch (err) {
        console.error("AI Layer Failure", err);
      } finally {
        this.isBusy = false;
        this.syncReadModel();
      }
    }
  }

  private syncReadModel() {
    this.readModel = projectReadModel(this.writeModel, this.eventStore);
    this.readModel.unlockingStatus.isProcessing = this.isBusy;
  }

  public getReadModel(): ReadModel {
    return this.readModel;
  }

  public getWriteModel(): ProjectState {
    return this.writeModel;
  }
}
