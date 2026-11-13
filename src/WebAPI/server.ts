import { createContainer } from './Program';
import { BookingController } from './BookingController';
import { CreateBookingUseCase } from '../Application/CreateBookingUseCase';

const container = createContainer();
const useCase = container.resolve<CreateBookingUseCase>('CreateBookingUseCase');
const controller = new BookingController(useCase);

// Демо-виклик
async function demo() {
  const result = await controller.create({
    eventId: 'evt_12345',
    seatIds: ['seat_A12', 'seat_A13'],
    userId: 'usr_98765',
  });
  console.log('Booking created:', result);
}

demo().catch(console.error);