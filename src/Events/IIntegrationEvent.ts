/**
 * Подія — незмінний факт у минулому часі.
 * Кожна має свій EventId і час (UTC).
 */
export interface IIntegrationEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  /** Метадані схеми */
  readonly SchemaTag: string;
}
