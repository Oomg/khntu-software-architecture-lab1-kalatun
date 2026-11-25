import { Booking } from '../Domain/Booking';
import { IBookingRepository } from '../Domain/IBookingRepository';

export class InMemoryBookingRepository implements IBookingRepository {
  private readonly store = new Map<string, Booking>();

  async save(booking: Booking): Promise<void> {
    this.store.set(booking.id, booking);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return Array.from(this.store.values()).filter(b => b.userId === userId);
  }
}