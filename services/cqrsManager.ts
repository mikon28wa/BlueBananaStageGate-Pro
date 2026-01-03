
import { ProjectState, Command, ReadModel } from '../types';
import { executeCommand, CommandResult } from '../commands/handlers';
import { projectReadModel } from '../queries/projections';
import { DomainEvent } from '../shared/events';

/**
 * CQRS MANAGER
 * Orchestriert den Command-Query Cycle und die AI Calculation Layer.
 */
export class CQRSManager {
  private writeModel: ProjectState;
  private eventStore: DomainEvent[] = [];
  private readModel: ReadModel;

  constructor(initialState: ProjectState) {
    this.writeModel = initialState;
    this.readModel = projectReadModel(initialState, []);
  }

  public async dispatch(command: Command): Promise<{ readModel: ReadModel; events: DomainEvent[] }> {
    try {
      // 1. Write Side: Execute Logic
      const result: CommandResult = executeCommand(this.writeModel, command);
      this.writeModel = result.newState;
      this.eventStore = [...this.eventStore, ...result.events];

      // 2. Query Side: Sync Projection
      await new Promise(resolve => setTimeout(resolve, 30)); 
      this.readModel = projectReadModel(this.writeModel, this.eventStore);

      return {
        readModel: this.readModel,
        events: result.events
      };
    } catch (e) {
      console.error("CQRS Command Failure:", e);
      throw e;
    }
  }

  public getReadModel(): ReadModel {
    return this.readModel;
  }

  public getWriteModel(): ProjectState {
    return this.writeModel;
  }
}
