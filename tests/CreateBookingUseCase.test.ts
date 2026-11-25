import { CreateBookingUseCase } from '../src/Application/CreateBookingUseCase';
import { IBookingRepository } from '../src/Domain/IBookingRepository';
import { ITimeProvider } from '../src/Application/ITimeProvider';
import { Booking } from '../src/Domain/Booking';
import { BookingStatus } from '../src/Domain/BookingStatus';

class MockBookingRepository implements IBookingRepository {
  public saved: Booking[] = [];
  public shouldFail = false;

  async save(booking: Booking): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Repository failure');
    }
    this.saved.push(booking);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.saved.find((b) => b.id === id) ?? null;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return this.saved.filter((b) => b.userId === userId);
  }
}

class MockTimeProvider implements ITimeProvider {
  private fixedDate: Date;

  constructor(fixedDate: Date) {
    this.fixedDate = fixedDate;
  }

  now(): Date {
    return this.fixedDate;
  }
}

describe('CreateBookingUseCase', () => {
  const fixedNow = new Date('2026-11-13T10:00:00.000Z');

  test('creates booking and saves it via repository', async () => {
    const repo = new MockBookingRepository();
    const time = new MockTimeProvider(fixedNow);
    const useCase = new CreateBookingUseCase(repo, time);

    const result = await useCase.execute({
      eventId: 'evt_123',
      seatIds: ['A1', 'A2'],
      userId: 'usr_1',
    });

    expect(result.status).toBe('CREATED');
    expect(result.seatIds).toEqual(['A1', 'A2']);
    expect(repo.saved.length).toBe(1);
    expect(repo.saved[0].eventId).toBe('evt_123');
  });

  test('rejects empty seatIds and does not call repository', async () => {
    const repo = new MockBookingRepository();
    const time = new MockTimeProvider(fixedNow);
    const useCase = new CreateBookingUseCase(repo, time);

    await expect(
      useCase.execute({
        eventId: 'evt_123',
        seatIds: [],
        userId: 'usr_1',
      })
    ).rejects.toThrow('At least one seat must be selected');

    expect(repo.saved.length).toBe(0);
  });

  test('propagates repository error', async () => {
    const repo = new MockBookingRepository();
    repo.shouldFail = true;
    const time = new MockTimeProvider(fixedNow);
    const useCase = new CreateBookingUseCase(repo, time);

    await expect(
      useCase.execute({
        eventId: 'evt_123',
        seatIds: ['A1'],
        userId: 'usr_1',
      })
    ).rejects.toThrow('Repository failure');
  });

  test('UseCase_WithMockedPort_DoesNotTouchInfrastructure_KhNTU42', async () => {
    const repo = new MockBookingRepository();
    const time = new MockTimeProvider(fixedNow);
    const useCase = new CreateBookingUseCase(repo, time);

    const result = await useCase.execute({
      eventId: 'evt_test',
      seatIds: ['S1'],
      userId: 'u1',
    });

    expect(result.id).toBeDefined();
    expect(repo.saved.length).toBe(1);
  });
});