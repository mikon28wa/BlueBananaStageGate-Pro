
import { ProjectState, Command, ReadModel, CommandType } from '../types';
import { executeCommand, CommandResult } from '../commands/handlers';
import { projectReadModel } from '../queries/projections';
import { DomainEvent } from '../shared/events';
import { performDocumentAudit, generateMarketingMaterials, getStageGuidance, generateIPWhitepaper } from './geminiService';

const STORAGE_KEY = 'bluebanana_event_store_v1';

/**
 * CQRS MANAGER (APPLICATION SERVICE LAYER)
 * Orchestrates Innovation (AI) & Assurance (Governance).
 * 
 * Includes LocalStorage Persistence to simulate a backend database.
 */
export class CQRSManager {
  private writeModel: ProjectState;
  private eventStore: DomainEvent[] = [];
  private readModel: ReadModel;
  private isBusy: boolean = false;

  constructor(initialState: ProjectState) {
    // 1. Try to load existing events from "Database" (LocalStorage)
    const persistedEvents = this.loadFromStorage();
    
    if (persistedEvents.length > 0) {
      console.log(`[CQRS] Rehydrating system from ${persistedEvents.length} persisted events...`);
      this.eventStore = persistedEvents;
      
      // Replay events to build current state (Event Sourcing Pattern)
      // We start with initial state and apply all historical events
      let state = JSON.parse(JSON.stringify(initialState));
      
      // Note: Ideally we would have a 'reducer' function for state replay.
      // For this prototype, we will trust the last snapshot if we implemented snapshots,
      // but here we just re-calculate the read model. 
      // Since our 'executeCommand' logic is coupled to state transitions, 
      // a full replay without logic duplication is complex in this lightweight demo.
      // STRATEGY: We will just use the ReadModel projection which is pure.
      // Limitations: The WriteModel (ProjectState) resets to default on refresh in this demo 
      // unless we also persist the WriteModel snapshot.
      
      // Better approach for this Demo: Persist the WriteModel Snapshot too.
      const persistedSnapshot = localStorage.getItem(`${STORAGE_KEY}_snapshot`);
      if (persistedSnapshot) {
         this.writeModel = JSON.parse(persistedSnapshot);
      } else {
         this.writeModel = initialState;
      }
    } else {
      this.writeModel = initialState;
    }

    // 2. Project the Read Model
    this.readModel = projectReadModel(this.writeModel, this.eventStore);
  }

  public async dispatch(command: Command): Promise<{ readModel: ReadModel; events: DomainEvent[] }> {
    try {
      const result: CommandResult = executeCommand(this.writeModel, command);
      
      // Update State
      this.writeModel = result.newState;
      this.eventStore = [...this.eventStore, ...result.events];

      // Persist to "Database"
      this.saveToStorage();

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
      this.syncReadModel(); // Update UI to show processing state
      
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

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.eventStore));
      localStorage.setItem(`${STORAGE_KEY}_snapshot`, JSON.stringify(this.writeModel));
    } catch (e) {
      console.warn("LocalStorage Quota exceeded or disabled");
    }
  }

  private loadFromStorage(): DomainEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public getReadModel(): ReadModel {
    return this.readModel;
  }

  public getWriteModel(): ProjectState {
    return this.writeModel;
  }
  
  // Debug Utility: Clear Persistence
  public hardReset() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}_snapshot`);
    window.location.reload();
  }
}
