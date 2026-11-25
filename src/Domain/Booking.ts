import { BookingStatus } from './BookingStatus';

export class Booking {
  constructor(
    public readonly id: string,
    public readonly eventId: string,
    public readonly userId: string,
    public readonly seatIds: string[],
    public status: BookingStatus,
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
    public totalPrice: number
  ) {
    if (!seatIds || seatIds.length === 0) {
      throw new Error('Booking must have at least one seat');
    }
    if (totalPrice < 0) {
      throw new Error('Total price cannot be negative');
    }
  }

  confirm(): void {
    if (this.status !== BookingStatus.PENDING_PAYMENT && this.status !== BookingStatus.LOCKED) {
      throw new Error(`Cannot confirm booking in status ${this.status}`);
    }
    this.status = BookingStatus.CONFIRMED;
  }

  cancel(): void {
    if (this.status === BookingStatus.COMPLETED || this.status === BookingStatus.CANCELLED) {
      throw new Error(`Cannot cancel booking in status ${this.status}`);
    }
    this.status = BookingStatus.CANCELLED;
  }

  isExpired(now: Date): boolean {
    return now > this.expiresAt;
  }
}