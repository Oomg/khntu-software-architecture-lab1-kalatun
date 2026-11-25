/**
 * Сховище оброблених EventId.
 * Назва: khntu_processed_events_v5
 * Не є бізнес-таблицею — лише «який споживач які EventId уже бачив».
 */
export interface IProcessedEventStore {
  isProcessed(consumer: string, eventId: string): boolean;
  markProcessed(consumer: string, eventId: string): void;
}

export class InMemoryProcessedEventStore implements IProcessedEventStore {
  /** khntu_processed_events_v5 */
  private readonly store = new Map<string, Set<string>>();

  isProcessed(consumer: string, eventId: string): boolean {
    const set = this.store.get(consumer);
    return set ? set.has(eventId) : false;
  }

  markProcessed(consumer: string, eventId: string): void {
    if (!this.store.has(consumer)) {
      this.store.set(consumer, new Set());
    }
    this.store.get(consumer)!.add(eventId);
  }
}
