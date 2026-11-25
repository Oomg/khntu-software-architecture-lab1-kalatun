import { IIntegrationEvent } from '../Events/IIntegrationEvent';

/**
 * Порт видавця — живе в Application.
 * Сценарій залежить лише від абстракції, не від транспорту.
 */
export interface IEventPublisher {
  publish(event: IIntegrationEvent): Promise<void>;
}
