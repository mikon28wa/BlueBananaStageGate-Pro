
import { ProjectState, Command, ReadModel, CommandType } from '../types';
import { executeCommand, CommandResult } from '../commands/handlers';
import { projectReadModel } from '../queries/projections';
import { DomainEvent } from '../shared/events';
import { performDocumentAudit, generateMarketingMaterials, getStageGuidance } from './geminiService';

/**
 * CQRS MANAGER (APPLICATION SERVICE LAYER)
 * Isolated layer between UI, Business Logic, and external AI.
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
      // 1. Synchronous Business Logic Execution
      const result: CommandResult = executeCommand(this.writeModel, command);
      this.writeModel = result.newState;
      this.eventStore = [...this.eventStore, ...result.events];

      // 2. Immediate UI Sync
      this.syncReadModel();

      // 3. Side-Effect Orchestration (Background Work)
      this.handleSideEffects(command);

      return { readModel: this.readModel, events: result.events };
    } catch (e) {
      console.error("Governance Rejection:", e);
      throw e;
    }
  }

  /**
   * Orchestrates asynchronous side-effects based on commands.
   * This is where the AI "Inference Layer" is isolated.
   */
  private async handleSideEffects(command: Command) {
    const activeStage = this.writeModel.stages[this.writeModel.currentStageIndex];
    if (!activeStage) return;

    // Trigger AI Audit flow
    if (command.type === 'TRIGGER_AI_AUDIT') {
      this.isBusy = true;
      try {
        // Parallel inference
        const [auditResult, marketingPitch, insights] = await Promise.all([
          performDocumentAudit(activeStage),
          generateMarketingMaterials(this.writeModel.projectName, activeStage),
          getStageGuidance(activeStage)
        ]);

        // Push results back into the deterministic engine
        await this.dispatch({
          type: 'RECEIVE_AI_RESULT',
          payload: { auditResult, marketingPitch, insights },
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
    // Inject the current processing status into the read model
    this.readModel.unlockingStatus.isProcessing = this.isBusy;
  }

  public getReadModel(): ReadModel {
    return this.readModel;
  }

  public getWriteModel(): ProjectState {
    return this.writeModel;
  }
}
