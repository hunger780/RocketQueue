
import { BackendBooking, QueueEntry, QueueStatus, User } from './types';

export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const generateMockJwt = (user: User) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    }));
    return `${header}.${payload}.mock_signature_hash`;
};

export const mapBackendToFrontend = (booking: BackendBooking): QueueEntry => {
  let status = QueueStatus.WAITING;
  switch (booking.status) {
    case 'serving': status = QueueStatus.IN_PROGRESS; break;
    case 'completed': status = QueueStatus.COMPLETED; break;
    case 'cancelled': status = QueueStatus.CANCELLED; break;
    case 'confirmed': status = QueueStatus.WAITING; break;
    case 'waiting': status = QueueStatus.WAITING; break;
    default: status = QueueStatus.WAITING;
  }

  return {
    id: booking._id,
    userId: booking.customerId,
    userName: booking.details.customerName,
    joinedAt: booking.joinedAt ? new Date(booking.joinedAt).getTime() : Date.now(),
    status: status,
    estimatedMinutes: booking.estimatedMinutes || 0,
    bookedSlotStart: booking.appointmentTime ? new Date(booking.appointmentTime).getTime() : undefined
  };
};
