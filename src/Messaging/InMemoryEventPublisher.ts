import { IIntegrationEvent } from '../Events/IIntegrationEvent';
import { IEventPublisher } from '../Application/IEventPublisher';
import { IEventBus } from './IEventBus';

/**
 * Адаптер порту IEventPublisher → InMemoryEventBus.
 * Реєструється в композиційному корені.
 */
export class InMemoryEventPublisher implements IEventPublisher {
  constructor(private readonly bus: IEventBus) {}

  async publish(event: IIntegrationEvent): Promise<void> {
    await this.bus.publish(event);
  }
}
