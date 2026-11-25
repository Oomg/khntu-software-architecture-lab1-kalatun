import { IIntegrationEvent } from './IIntegrationEvent';

/**
 * Подія: бронювання успішно створено.
 * Назва — дієслово в минулому часі. Після створення незмінна.
 */
export class BookingCreatedEvent implements IIntegrationEvent {
  readonly SchemaTag = 'KhNTU-EDA-5.42' as const;

  constructor(
    public readonly eventId: string,
    public readonly occurredAt: Date,
    /** ідентифікатор агрегату */
    public readonly bookingId: string,
    public readonly eventIdRef: string,
    public readonly userId: string,
    public readonly seatIds: readonly string[],
    public readonly totalPrice: number
  ) {}
}
