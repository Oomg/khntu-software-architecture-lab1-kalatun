import { IIntegrationEvent } from '../Events/IIntegrationEvent';

/**
 * In-memory шина (Broker-топологія).
 * Канал / префікс: khntu.events.v5
 */
export interface IEventBus {
  publish(event: IIntegrationEvent): Promise<void>;
  subscribe<T extends IIntegrationEvent>(
    eventType: new (...args: any[]) => T,
    subscriberName: string,
    handler: (event: T) => Promise<void>
  ): void;
  /** Демо: повторна доставка останньої події (at-least-once) */
  redeliverLast(): Promise<void>;
}
