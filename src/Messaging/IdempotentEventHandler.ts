import { IIntegrationEvent } from '../Events/IIntegrationEvent';
import { IProcessedEventStore } from './ProcessedEventStore';

/**
 * Базовий клас споживача з перевіркою EventId.
 * Порядок: змінити стан → позначити обробленим.
 * Якщо Apply впав — EventId не записано, повтор доробить роботу.
 */
export abstract class IdempotentEventHandler<T extends IIntegrationEvent> {
  constructor(
    protected readonly processed: IProcessedEventStore,
    protected readonly consumerName: string
  ) {}

  async handle(event: T): Promise<void> {
    if (this.processed.isProcessed(this.consumerName, event.eventId)) {
      // Точний рядок за вимогою
      console.warn(
        `[${this.consumerName}] [KhNTU-Idempotency-42] duplicate skipped ${shortId(event.eventId)}`
      );
      return;
    }

    // 1. Змінюємо стан
    await this.apply(event);
    // 2. Лише після успіху фіксуємо EventId
    this.processed.markProcessed(this.consumerName, event.eventId);
  }

  /** Реалізує конкретний споживач */
  protected abstract apply(event: T): Promise<void>;
}

function shortId(id: string): string {
  return id.substring(0, 8);
}
