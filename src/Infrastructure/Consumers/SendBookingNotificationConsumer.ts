import { BookingCreatedEvent } from '../../Events/BookingCreatedEvent';
import { IdempotentEventHandler } from '../../Messaging/IdempotentEventHandler';
import { IProcessedEventStore } from '../../Messaging/ProcessedEventStore';

/**
 * Споживач №2: сповіщення клієнта (SMS / email).
 * Незалежний від складу.
 */
export class SendBookingNotificationConsumer extends IdempotentEventHandler<BookingCreatedEvent> {
  /** Для демо падіння */
  static simulateFailure = false;

  constructor(processed: IProcessedEventStore) {
    super(processed, 'notifications');
  }

  protected async apply(event: BookingCreatedEvent): Promise<void> {
    if (SendBookingNotificationConsumer.simulateFailure) {
      throw new Error('SMS gateway timeout');
    }

    await sleep(50);

    console.log(
      `[notifications] SMS sent: Booking ${shortId(event.bookingId)} ` +
        `for event ${event.eventIdRef} accepted, seats: ${event.seatIds.length}, total ${event.totalPrice} UAH`
    );
  }
}

function shortId(id: string): string {
  return id.substring(0, 8);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
