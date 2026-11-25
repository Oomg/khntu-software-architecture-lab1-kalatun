import { BookingCreatedEvent } from '../../Events/BookingCreatedEvent';
import { IdempotentEventHandler } from '../../Messaging/IdempotentEventHandler';
import { IProcessedEventStore } from '../../Messaging/ProcessedEventStore';

/**
 * Споживач №1: резервування місць (склад).
 * Незалежний — не викликає інших споживачів.
 */
export class ReserveSeatsConsumer extends IdempotentEventHandler<BookingCreatedEvent> {
  /** Простий in-memory склад місць для демо */
  private static reserved = new Map<string, string[]>();

  constructor(processed: IProcessedEventStore) {
    super(processed, 'inventory');
  }

  protected async apply(event: BookingCreatedEvent): Promise<void> {
    ReserveSeatsConsumer.reserved.set(event.bookingId, [...event.seatIds]);
    console.log(
      `[inventory] reserved seats [${event.seatIds.join(', ')}] for booking ${shortId(event.bookingId)}`
    );
  }

  static getReserved(bookingId: string): string[] | undefined {
    return ReserveSeatsConsumer.reserved.get(bookingId);
  }

  static clear(): void {
    ReserveSeatsConsumer.reserved.clear();
  }
}

function shortId(id: string): string {
  return id.substring(0, 8);
}
