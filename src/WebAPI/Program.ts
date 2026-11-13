// CLEAN-ARCH-KhNTU-Lab4-Verified

import { CreateBookingUseCase } from '../Application/CreateBookingUseCase';
import { IBookingRepository } from '../Domain/IBookingRepository';
import { ITimeProvider } from '../Application/ITimeProvider';
import { InMemoryBookingRepository } from '../Infrastructure/InMemoryBookingRepository';
import { SystemTimeProvider } from '../Infrastructure/SystemTimeProvider';

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
    // transient і scoped для простоти створюємо щоразу (scoped в реальному HTTP був би per-request)
    return entry.factory();
  }
}

export function createContainer(): Container {
  const container = new Container();

  // Scoped — один екземпляр на область видимості запиту. Типовий вибір для репозиторію.
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

  // Transient — новий об'єкт на кожне вирішення (сценарій не зберігає стан між викликами)
  container.register<CreateBookingUseCase>(
    'CreateBookingUseCase',
    () => new CreateBookingUseCase(
      container.resolve<IBookingRepository>('IBookingRepository'),
      container.resolve<ITimeProvider>('ITimeProvider')
    ),
    'transient'
  );

  return container;
}