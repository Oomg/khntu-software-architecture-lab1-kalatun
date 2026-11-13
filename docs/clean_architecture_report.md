<!-- CLEAN-ARCH-KhNTU-Lab4-Verified -->

# Звіт про виконання лабораторної роботи №4
## Тема: Модульне ядро, Clean Architecture та Dependency Injection

**Студент:** Калатун Євгеній Володимирович  
**Група:** 2Прс  
**Тег у репозиторії:** lr4  
**Посилання на репозиторій:** https://github.com/Oomg/khntu-software-architecture-lab1-kalatun

### 1. Шар і правило залежностей

| Шар | Що містить |
|-----|------------|
| Domain | Booking, BookingStatus, IBookingRepository |
| Application | CreateBookingUseCase, DTO, ITimeProvider |
| Infrastructure | InMemoryBookingRepository, SystemTimeProvider |
| WebAPI | Program (композиційний корінь), BookingController, server |

Domain не має жодних посилань на інші шари. Application залежить тільки від Domain. Infrastructure і WebAPI залежать від абстракцій Application/Domain.

### 2. Сценарій використання

- **Ім'я:** CreateBookingUseCase
- **Порти в конструкторі:** IBookingRepository, ITimeProvider
- **Доменне правило:** відхиляє запит, якщо seatIds порожній (не викликає save)

### 3. Композиційний корінь

| Абстракція | Реалізація | Життєвий цикл | Чому саме цей |
|------------|------------|---------------|---------------|
| IBookingRepository | InMemoryBookingRepository | Scoped | Один екземпляр на область запиту |
| ITimeProvider | SystemTimeProvider | Scoped | registration-token: KhNTU-DI-42 |
| CreateBookingUseCase | CreateBookingUseCase | Transient | Не зберігає стан між викликами |

### 4. Модульні тести

- creates booking and saves it via repository
- rejects empty seatIds and does not call repository
- propagates repository error
- UseCase_WithMockedPort_DoesNotTouchInfrastructure_KhNTU42

Порти замінено ручними моками (MockBookingRepository, MockTimeProvider).  
Скріншот зеленого прогону: docs/images/tests-green.png