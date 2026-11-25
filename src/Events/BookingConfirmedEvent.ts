import { IIntegrationEvent } from './IIntegrationEvent';

/**
 * Подія: бронювання підтверджено.
 */
export class BookingConfirmedEvent implements IIntegrationEvent {
  readonly SchemaTag = 'KhNTU-EDA-5.42' as const;

  constructor(
    public readonly eventId: string,
    public readonly occurredAt: Date,
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly totalPrice: number
  ) {}
}
