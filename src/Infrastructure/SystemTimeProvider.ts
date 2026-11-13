import { ITimeProvider } from '../Application/ITimeProvider';

export class SystemTimeProvider implements ITimeProvider {
  now(): Date {
    return new Date();
  }
}