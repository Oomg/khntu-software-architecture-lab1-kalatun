// <!-- EDA-KhNTU-Lab5-Verified -->
/**
 * In-memory Event Bus (Broker-топологія).
 * Канал / префікс: khntu.events.v5
 *
 * У кожного підписника своя черга (як queue у RabbitMQ).
 * Publish лише кладе копії і одразу повертається — обробка асинхронна.
 * Падіння одного споживача не зачіпає інших.
 */

import { IIntegrationEvent } from '../Events/IIntegrationEvent';
import { IEventBus } from './IEventBus';

type Handler = (event: IIntegrationEvent) => Promise<void>;

interface Subscription {
  name: string;
  queue: IIntegrationEvent[];
  handler: Handler;
  processing: boolean;
}

export class InMemoryEventBus implements IEventBus {
  private readonly subscriptions = new Map<string, Subscription[]>();
  private readonly journal = new Map<string, IIntegrationEvent>();
  private lastEventId: string | null = null;

  /** Префікс каналу за вимогою: khntu.events.v5 */
  static readonly CHANNEL_PREFIX = 'khntu.events.v5';

  subscribe<T extends IIntegrationEvent>(
    eventType: new (...args: any[]) => T,
    subscriberName: string,
    handler: (event: T) => Promise<void>
  ): void {
    const key = eventType.name;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }

    const sub: Subscription = {
      name: subscriberName,
      queue: [],
      handler: handler as Handler,
      processing: false,
    };
    this.subscriptions.get(key)!.push(sub);

    // Фоновий «насос» — обробка не в стеку виклику сценарію
    this.startPump(sub);
  }

  async publish(event: IIntegrationEvent): Promise<void> {
    this.journal.set(event.eventId, event);
    this.lastEventId = event.eventId;

    const key = event.constructor.name;
    const subs = this.subscriptions.get(key) ?? [];

    console.log(
      `[bus] published ${key} ${shortId(event.eventId)} -> ${subs.length} subscriber(s) ` +
        `[channel: ${InMemoryEventBus.CHANNEL_PREFIX}]`
    );

    // Кладемо копію в чергу кожного підписника і НЕ чекаємо обробки
    for (const sub of subs) {
      sub.queue.push(event);
    }
  }

  /** Імітація повторної доставки (at-least-once) — той самий EventId */
  async redeliverLast(): Promise<void> {
    if (!this.lastEventId) {
      console.warn('[bus] no event to redeliver');
      return;
    }
    const evt = this.journal.get(this.lastEventId)!;
    console.warn(
      `[bus] REDELIVERY of ${evt.constructor.name} ${shortId(evt.eventId)} (ack was lost)`
    );
    await this.publish(evt);
  }

  private startPump(sub: Subscription): void {
    const tick = async () => {
      if (sub.processing || sub.queue.length === 0) {
        setTimeout(tick, 10);
        return;
      }
      sub.processing = true;
      const evt = sub.queue.shift()!;
      try {
        await sub.handler(evt);
      } catch (err: any) {
        console.error(
          `[${sub.name}] FAILED on ${evt.constructor.name} ${shortId(evt.eventId)}: ${err.message}`
        );
      } finally {
        sub.processing = false;
        setTimeout(tick, 0);
      }
    };
    setTimeout(tick, 0);
  }
}

function shortId(id: string): string {
  return id.substring(0, 8);
}
