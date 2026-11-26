<!-- ADD-ARC42-KhNTU-Lab6-Verified -->
# Architectural Design Document (ADD)
## Online Ticket Booking & Event Platform

**Шаблон:** arc42  
**Студент:** Калатун Євгеній Володимирович (2ПРс)  
**Репозиторій:** https://github.com/Oomg/khntu-software-architecture-lab1-kalatun  
**Тег:** lr6  

Документ **посилається** на артефакти ЛР1–ЛР5 і не дублює їх повністю. Новий розробник читає ADD першим.

---

## 1. Вступ та цілі системи

Система забезпечує онлайн-бронювання квитків на події: вибір місць, створення бронювання, подальша оплата/підтвердження (зовнішні сервіси — out of scope стенда).

Джерело: [docs/1_system_description.md](docs/1_system_description.md).

**Головні цілі:** зручна купівля, стійкість під піковим навантаженням, захист від ботів-перекупників, модульність для супроводу.

---

## 2. Обмеження та NFR (ISO 25010)

Повна специфікація: [docs/2_nfr_specification.md](docs/2_nfr_specification.md).

| NFR (скорочено) | Чим забезпечується | У стенді |
|-----------------|-------------------|----------|
| Час відгуку API | Просте ядро, in-memory репозиторій на стенді | Частково (навчальний обсяг) |
| Збій SMS не зупиняє бронювання | EDA: споживач notifications ізольований (ЛР5) | Так |
| Тести Domain / UseCase без БД | Clean Architecture, порти (ЛР4) | Так |
| TLS для клієнта | KhNTU Edge Gateway, HTTPS/TLS1.3 :8443 | Так (шлях на діаграмі) |
| Availability 99.9% | Потребує кількох хостів / кластера | **Ні** (один Docker-хост) — ADR-0642 |
| Горизонтальне scale споживачів | Окремий worker + спільне сховище EventId | **Ні** (in-memory у процесі API) |

---

## 3. Контекст (C4 Level 1)

Зовнішні актори: Покупець (Browser), Організатор; зовнішні системи: Payment Gateway, SMS/Email.

Джерела: [docs/images/c4-context.png](docs/images/c4-context.png), [docs/architecture_diagrams_report.md](docs/architecture_diagrams_report.md).

---

## 4. Архітектурна стратегія та ADR

| ADR | Рішення | Головний компроміс |
|-----|---------|-------------------|
| [0001](docs/adrs/0001-architectural-style.md) | Модульний моноліт | Простота vs незалежне деплоєння сервісів |
| [0002](docs/adrs/0002-database-strategy.md) | PostgreSQL + Redis (цільове) | У стенді ЛР4–6 — in-memory репозиторій |
| [0003](docs/adrs/0003-security-framework.md) | JWT / OAuth2 (цільове) | У навчальному API — без повної auth-сесії |
| **[ADR-0642](docs/adrs/ADR-0642-deployment-topology.md)** | **Compose: Edge Gateway + один API** | Відтворюваність стенда vs single host і in-memory EDA |

---

## 5. Структурні діаграми

- **C4 Container / Component / Class:** [docs/images/](docs/images/), [docs/architecture_diagrams_report.md](docs/architecture_diagrams_report.md)
- **Шари коду (ЛР4):** `src/Domain` → `src/Application` → `src/Infrastructure` / `src/WebAPI`; Events + Messaging (ЛР5)
- **Правило залежностей:** Domain без зовнішніх посилань; Application залежить лише від Domain і портів.

---

## 6. Динаміка взаємодії

- Sequence бронювання: [docs/images/sequence-booking.png](docs/images/sequence-booking.png)
- REST: [api/openapi.yaml](api/openapi.yaml)
- Події (ЛР5): `BookingCreatedEvent` → `ReserveSeatsConsumer`, `SendBookingNotificationConsumer`; ідемпотентність за EventId  
  Звіт: [docs/event_driven_report.md](docs/event_driven_report.md), лог: [docs/lr5/demo.log](docs/lr5/demo.log)

Потік стенда: Client → Gateway → API → (in-process bus) → consumers.

---

## 7. Фізична архітектура (розгортання)

[arc42-KhNTU-Ref: 6.42]

Джерело діаграми: [docs/diagrams/deployment.puml](docs/diagrams/deployment.puml) (PNG — після рендеру в `docs/diagrams/deployment.png`).

**Інвентаризація (збігається з docker-compose.yml):**

| Процес | Де | Образ / артефакт | Зв’язки |
|--------|-----|------------------|---------|
| KhNTU Edge Gateway [nginx-6.42] | контейнер | nginx:1.27-alpine, default.conf | вхід **HTTPS/TLS1.3 :8443**, вихід HTTP :8080 → API |
| ticket-booking-api | контейнер | ticket-booking/api:1.0, server.js + шари | HTTP :8080; in-memory bus всередині |
| Payment / SMS | зовнішні | — | HTTPS :443, у стенді заглушки |

Локально без Docker: `npx ts-node src/WebAPI/server.ts` (той самий процес API).

Compose: [docker-compose.yml](docker-compose.yml), [Dockerfile](Dockerfile).

---

## 8. Компроміси та ризики

1. **Один хост** — немає HA; NFR 99.9% не виконується в стенді (свідомо, ADR-0642).
2. **In-memory EDA** — не scale-out API/споживачів без спільного store EventId і брокера.
3. **Цільові PostgreSQL/Redis/JWT** описані в ADR-0002/0003, **не** розгорнуті в стенді ЛР6 — позначено явно.
4. **Edge TLS** — шлях на діаграмі обов’язковий; у локальному стенді можливі self-signed сертифікати.

Ризик неузгодженості назв знято: одна назва `ticket-booking-api` у compose, ADD і діаграмі.

---

## Додатки

- Тег репозиторію: **lr6**
- Презентація: `Architecture_Presentation.pdf` (5–7 слайдів)
- Демо-лог стенда: `docs/lr6/e2e_demo.log` (після `docker compose up` або `npm start`)
