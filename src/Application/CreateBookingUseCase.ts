import { Booking } from '../Domain/Booking';
import { BookingStatus } from '../Domain/BookingStatus';
import { IBookingRepository } from '../Domain/IBookingRepository';
import { CreateBookingRequest, CreateBookingResponse } from './CreateBookingDto';
import { ITimeProvider } from './ITimeProvider';

// простий генератор id без залежності від crypto (для сумісності)
function generateId(): string {
  return 'bkm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly timeProvider: ITimeProvider
  ) {}

  async execute(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    if (!request.seatIds || request.seatIds.length === 0) {
      throw new Error('At least one seat must be selected');
    }

    const now = this.timeProvider.now();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 хвилин
    const totalPrice = request.seatIds.length * 625;

    const booking = new Booking(
      generateId(),
      request.eventId,
      request.userId,
      request.seatIds,
      BookingStatus.CREATED,
      now,
      expiresAt,
      totalPrice
    );

    await this.bookingRepository.save(booking);

    return {
      id: booking.id,
      eventId: booking.eventId,
      userId: booking.userId,
      seatIds: booking.seatIds,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      expiresAt: booking.expiresAt.toISOString(),
      totalPrice: booking.totalPrice,
    };
  }
}