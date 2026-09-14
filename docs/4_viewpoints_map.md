<!-- exact hidden HTML comment -->
# Карта архітектурних ракурсів (Architectural Viewpoints Map)

Цей документ визначає набір архітектурних ракурсів (Viewpoints) та відповідних їм виглядів (Views) для системи "Online Ticket Booking & Event Platform" згідно зі стандартом ISO/IEC/IEEE 42010:2022. Карта демонструє, які саме діаграми будуть створені на наступних етапах та для яких стейкхолдерів вони призначені.

| Viewpoint (Ракурс) | View (Вигляд / Артефакт) | Нотація | Зацікавлені сторони (Stakeholders) |
| :--- | :--- | :--- | :--- |
| **Context Viewpoint** | C4 Level 1: System Context Diagram (демонструє систему та її зовнішнє оточення) | C4 Model | Business Owner, End User (Покупці, Організатори) |
| **Container Viewpoint** | C4 Level 2: Container Diagram (демонструє великі технічні частини: API, БД, веб-клієнт) | C4 Model | Software Architect, Lead Dev, DevOps |
| **Structural Viewpoint** | UML Component / Class Diagram (внутрішні модулі системи бронювання) | UML | Backend Developers, Frontend Developers |
| **Behavioral Viewpoint** | UML Sequence / State Diagram (послідовність процесу оплати та бронювання місця) | UML | Backend Developers, QA Engineers |
| **Deployment Viewpoint** | UML Deployment Diagram / C4 (сервери, інфраструктура, хмарні ресурси) | UML / C4 Model | DevOps, Security, Infrastructure Engineers |

**Примітка:** На цьому етапі визначено план представлень; детальні діаграми будуть створюватися на наступних етапах проєктування платформи.