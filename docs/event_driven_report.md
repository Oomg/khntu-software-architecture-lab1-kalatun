<!-- EDA-KhNTU-Lab5-Verified -->
# Звіт про виконання лабораторної роботи №5
## Тема: Подійно-орієнтована взаємодія компонентів (EDA)

**Студент:** Калатун Євгеній Володимирович  
**Група:** 2ПРс  
**Тег у репозиторії:** lr5  
**Посилання на репозиторій:** https://github.com/Oomg/khntu-software-architecture-lab1-kalatun  

### 1. Каталог подій

| Подія | Видавець | Споживачі | Поля |
| --- | --- | --- | --- |
| `BookingCreatedEvent` | `CreateBookingUseCase` | `ReserveSeatsConsumer` (склад), `SendBookingNotificationConsumer` (SMS) | `eventId`, `occurredAt` (UTC), `bookingId`, `eventIdRef`, `userId`, `seatIds[]`, `totalPrice`, `SchemaTag` |
| `BookingConfirmedEvent` | (готовий до другого сценарію) | — | `eventId`, `occurredAt` (UTC), `bookingId`, `userId`, `totalPrice`, `SchemaTag` |

Події лежать у `src/Events`. Це незмінні класи з назвами в минулому часі, без залежностей від інфраструктури. Кожна подія містить `SchemaTag = "KhNTU-EDA-5.42"`.

### 2. Транспорт

Обрано **варіант Б — in-memory шину** (`src/Messaging/InMemoryEventBus.ts`).  
Причина: для модульного моноліту окремий брокер на цьому етапі не потрібен; шина повторює модель RabbitMQ і легко замінюється.

- У кожного підписника **своя черга** і свій фоновий обробник (як окрема queue у RabbitMQ).
- `publish` лише кладе копії події в черги і одразу повертається — обробка **не** виконується в стеку виклику сценарію.
- Префікс каналу: `khntu.events.v5`.

**Топологія — Broker.** Центрального оркестратора немає: шина розсилає подію всім підписникам, кожен споживач сам вирішує, що робити. Підписки реєструються незалежно в `wireConsumers`, видавець не знає їхньої кількості.

### 3. Видавець і споживачі

`CreateBookingUseCase` спершу зберігає бронювання (`bookingRepository.save`), а потім публікує `BookingCreatedEvent` через порт `IEventPublisher` з Application. Application не посилається на клієнт шини — лише на абстракцію. Адаптер `InMemoryEventPublisher` зареєстровано в `src/WebAPI/Program.ts`.

| Споживач | Що змінює |
| --- | --- |
| `ReserveSeatsConsumer` (`inventory`) | Резервує місця (`seatIds`) для бронювання |
| `SendBookingNotificationConsumer` (`notifications`) | Надсилає клієнту SMS про прийняте бронювання |

Падіння одного споживача не зачіпає іншого і не скасовує сценарій (201 повертається клієнту до завершення споживачів).

### 4. Ідемпотентність

Оброблені `EventId` зберігаються в `InMemoryProcessedEventStore` (`khntu_processed_events_v5`). Це потокобезпечний набір пар (споживач, EventId), окремий для кожного споживача.

Базовий клас `IdempotentEventHandler` перевіряє `EventId` **до** зміни стану, а записує його **після** успішної зміни. Так не виникає стану «оброблено, але не змінено».

При пропуску дубліката в лог пишеться:  
`[KhNTU-Idempotency-42] duplicate skipped`

Фрагмент очікуваного логу:

```
[bus] published BookingCreatedEvent evt_xxxxx -> 2 subscriber(s) [channel: khntu.events.v5]
[api] 201 Created returned for booking bkm_xxxxx
[inventory] reserved seats [A12, A13] for booking bkm_xxxxx
[notifications] SMS sent: Booking bkm_xxxxx ...

[bus] REDELIVERY of BookingCreatedEvent evt_xxxxx (ack was lost)
[inventory] [KhNTU-Idempotency-42] duplicate skipped evt_xxxxx
[notifications] [KhNTU-Idempotency-42] duplicate skipped evt_xxxxx
```

Стан (резерв місць) змінюється **один** раз.

Повний лог демонстрації — `docs/lr5/demo.log`.
