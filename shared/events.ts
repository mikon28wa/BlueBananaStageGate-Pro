
import { CommandType } from '../types';

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  payload: any;
  timestamp: number;
}

export const createEvent = (type: CommandType | string, aggregateId: string, payload: any): DomainEvent => ({
  id: Math.random().toString(36).substr(2, 9),
  type: type.includes('_') ? type : `${type}_SUCCESS`,
  aggregateId,
  payload,
  timestamp: Date.now()
});
