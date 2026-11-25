import { createContainer, wireConsumers } from './Program';
import { BookingController } from './BookingController';
import { CreateBookingUseCase } from '../Application/CreateBookingUseCase';
import { InMemoryEventBus } from '../Messaging/InMemoryEventBus';
import { SendBookingNotificationConsumer } from '../Infrastructure/Consumers/SendBookingNotificationConsumer';

const container = createContainer();
wireConsumers(container);

const useCase = container.resolve<CreateBookingUseCase>('CreateBookingUseCase');
const controller = new BookingController(useCase);
const bus = container.resolve<InMemoryEventBus>('IEventBus');

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Повна демонстрація ЛР5
async function demo() {
  console.log('=== Lab 5 Demo: Event-Driven Architecture ===\n');

  // 1. Happy path
  console.log('--- 1. Create booking (happy path) ---');
  const result = await controller.create({
    eventId: 'evt_concert_42',
    seatIds: ['A12', 'A13'],
    userId: 'user_777',
  });
  console.log(`[api] 201 Created returned for booking ${result.id.substring(0, 8)}`);
  await sleep(150);

  // 2. One consumer fails
  console.log('\n--- 2. One consumer fails (SMS gateway down) ---');
  SendBookingNotificationConsumer.simulateFailure = true;
  const result2 = await controller.create({
    eventId: 'evt_concert_42',
    seatIds: ['B5'],
    userId: 'user_888',
  });
  console.log(`[api] 201 Created returned for booking ${result2.id.substring(0, 8)}`);
  await sleep(150);
  SendBookingNotificationConsumer.simulateFailure = false;

  // 3. Redelivery
  console.log('\n--- 3. Redelivery of last event (same EventId) ---');
  await bus.redeliverLast();
  await sleep(100);

  console.log('\n=== Demo finished ===');
}

demo().catch(console.error);
