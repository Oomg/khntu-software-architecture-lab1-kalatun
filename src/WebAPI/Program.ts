// CLEAN-ARCH-KhNTU-Lab4-Verified
// EDA extension for Lab 5

import { CreateBookingUseCase } from '../Application/CreateBookingUseCase';
import { IBookingRepository } from '../Domain/IBookingRepository';
import { ITimeProvider } from '../Application/ITimeProvider';
import { IEventPublisher } from '../Application/IEventPublisher';
import { InMemoryBookingRepository } from '../Infrastructure/InMemoryBookingRepository';
import { SystemTimeProvider } from '../Infrastructure/SystemTimeProvider';
import { InMemoryEventBus } from '../Messaging/InMemoryEventBus';
import { InMemoryEventPublisher } from '../Messaging/InMemoryEventPublisher';
import { InMemoryProcessedEventStore } from '../Messaging/ProcessedEventStore';
import { BookingCreatedEvent } from '../Events/BookingCreatedEvent';
import { ReserveSeatsConsumer } from '../Infrastructure/Consumers/ReserveSeatsConsumer';
import { SendBookingNotificationConsumer } from '../Infrastructure/Consumers/SendBookingNotificationConsumer';

// Простий контейнер (без зовнішніх бібліотек)
class Container {
  private services = new Map<string, any>();

  register<T>(key: string, factory: () => T, lifetime: 'transient' | 'scoped' | 'singleton'): void {
    this.services.set(key, { factory, lifetime, instance: null });
  }

  resolve<T>(key: string): T {
    const entry = this.services.get(key);
    if (!entry) throw new Error(`Service ${key} not registered`);

    if (entry.lifetime === 'singleton') {
      if (!entry.instance) entry.instance = entry.factory();
      return entry.instance;
    }
    // transient і scoped для простоти створюємо щоразу
    return entry.factory();
  }
}

export function createContainer(): Container {
  const container = new Container();

  // --- з ЛР4 ---
  // Scoped — один екземпляр на область видимості запиту
  container.register<IBookingRepository>(
    'IBookingRepository',
    () => new InMemoryBookingRepository(),
    'scoped'
  );

  // Scoped — registration-token: KhNTU-DI-42
  container.register<ITimeProvider>(
    'ITimeProvider',
    () => new SystemTimeProvider(),
    'scoped'
  );

  // --- ЛР5: шина і ідемпотентність (Singleton — один «брокер» на процес) ---
  container.register(
    'IEventBus',
    () => new InMemoryEventBus(),
    'singleton'
  );

  container.register(
    'IProcessedEventStore',
    () => new InMemoryProcessedEventStore(),
    'singleton'
  );

  // Scoped публікатор
  container.register<IEventPublisher>(
    'IEventPublisher',
    () => new InMemoryEventPublisher(container.resolve('IEventBus')),
    'scoped'
  );

  // Transient — сценарій не зберігає стан між викликами
  container.register<CreateBookingUseCase>(
    'CreateBookingUseCase',
    () =>
      new CreateBookingUseCase(
        container.resolve<IBookingRepository>('IBookingRepository'),
        container.resolve<ITimeProvider>('ITimeProvider'),
        container.resolve<IEventPublisher>('IEventPublisher')
      ),
    'transient'
  );

  return container;
}

/**
 * Підписує споживачів на подію BookingCreatedEvent.
 * Викликається один раз при старті (композиційний корінь).
 */
export function wireConsumers(container: Container): void {
  const bus = container.resolve<InMemoryEventBus>('IEventBus');
  const store = container.resolve<InMemoryProcessedEventStore>('IProcessedEventStore');

  const inventory = new ReserveSeatsConsumer(store);
  const notifications = new SendBookingNotificationConsumer(store);

  bus.subscribe(BookingCreatedEvent, 'inventory', (e) => inventory.handle(e));
  bus.subscribe(BookingCreatedEvent, 'notifications', (e) => notifications.handle(e));
}
