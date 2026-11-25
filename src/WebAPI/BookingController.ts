import { CreateBookingUseCase } from '../Application/CreateBookingUseCase';
import { CreateBookingRequest } from '../Application/CreateBookingDto';

export class BookingController {
  constructor(private readonly createBookingUseCase: CreateBookingUseCase) {}

  async create(request: CreateBookingRequest) {
    return this.createBookingUseCase.execute(request);
  }
}