# Architecture Presentation — Online Ticket Booking (LR6)

> Експортуй у PDF (5–7 слайдів) через Marp / PowerPoint / Google Slides.

## 1. Мета і контекст
- Online Ticket Booking & Event Platform
- Покупець бронює місця; оплата/SMS — зовнішні
- C4 Context: посилання на docs/images/c4-context.png

## 2. Структура
- Модульний моноліт, Clean Architecture (Domain → Application → Infrastructure/WebAPI)
- Events + Messaging (in-memory bus, ЛР5)
- Правило залежностей: Domain без зовнішніх refs

## 3. Ключові ADR
| ADR | Рішення | Компроміс |
|-----|---------|-----------|
| 0001 | Модульний моноліт | простота vs незалежний деплой |
| 0002 | PostgreSQL+Redis (ціль) | у стенді in-memory |
| 0003 | JWT/OAuth2 (ціль) | у стенді спрощено |
| **0642** | **Edge + один API у Compose** | відтворюваність vs single host |

## 4. Розгортання
- Діаграма: docs/diagrams/deployment.puml
- Client → **HTTPS/TLS1.3 :8443** → KhNTU Edge Gateway [nginx-6.42] → HTTP :8080 → ticket-booking-api
- Події всередині процесу API

## 5. Демо
- `docker compose up --build` **або** `npx ts-node src/WebAPI/server.ts`
- Створення бронювання → 2 споживачі → duplicate skipped (ЛР5)
- Лог: docs/lr5/demo.log / docs/lr6/e2e_demo.log

## 6. Компроміси
- Немає HA (один хост)
- Немає scale-out in-memory EDA
- Цільова БД/Redis не в стенді — чесно в ADD §2 і §8

## 7. Підсумок
- Вимоги → ADR → структура → контракти → код → розгортання узгоджені
- Тег **lr6**
