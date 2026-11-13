export interface CreateBookingRequest {
  eventId: string;
  seatIds: string[];
  userId: string;
}

export interface CreateBookingResponse {
  id: string;
  eventId: string;
  userId: string;
  seatIds: string[];
  status: string;
  createdAt: string;
  expiresAt: string;
  totalPrice: number;
}