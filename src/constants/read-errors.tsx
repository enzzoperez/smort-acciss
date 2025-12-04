import EventMismatchError from '@/assets/svg/event-mismatch-error.svg';
import NotValidTicket from '@/assets/svg/not-valid-ticket-error.svg';
import UsedTicketError from '@/assets/svg/used-ticket-error.svg';
import ZoneMismatchError from '@/assets/svg/zone-mismatch-error.svg';
import TicketNetwork from '@/assets/svg/ticket-network.svg';

export const readErrors = [
  {
    code: 'ACCTRL-001',
    key: 'QR_NOT_FOUND',
    title: 'Ticket no encontrado',
    message:
      'El código QR no coincide con ningún registro válido. Revisar el ticket o escanear nuevamente.',
    action: 'No permitir ingreso',
    icon: <NotValidTicket />,
  },
  {
    code: 'ACCTRL-005',
    key: 'QR_NOT_VALID',
    title: 'Ticket no válido',
    message:
      'El formato o contenido del código QR no es reconocido. Revisar el ticket o escanear nuevamente.',
    action: 'No permitir ingreso',
    icon: <NotValidTicket />,
  },
  {
    code: 'ACCTRL-002',
    key: 'QR_EVENT_MISMATCH',
    title: 'Ticket de otro evento',
    message: 'Este código QR está asignado a un evento distinto. Verificar los datos del ticket.',
    action: 'No permitir ingreso',
    icon: <EventMismatchError />,
  },
  {
    code: 'ACCTRL-003',
    key: 'QR_ZONE_MISMATCH',
    title: 'Ticket de otro sector/puerta',
    message: 'Este código QR pertenece a otra puerta o sector. Derivar al acceso correcto.',
    action: 'No permitir ingreso',
    icon: <ZoneMismatchError />,
  },
  {
    code: 'ACCTRL-004',
    key: 'QR_HAS_USED',
    title: 'Ticket ya utilizado',
    message: 'Este código ya fue escaneado antes. No es válido nuevamente.',
    action: 'No permitir ingreso',
    icon: <UsedTicketError />,
  },
  {
    code: 'ACCTRL-018',
    key: 'QR_EXPIRED',
    title: 'Ticket expirado',
    message: 'Este código ya no es válido, intenta con otro por favor.',
    action: 'No permitir ingreso',
    icon: <NotValidTicket />,
  },
  {
    code: 'ACCTRL-005',
    key: 'NETWORK_ERROR',
    title: 'Error de conexión',
    message:
      'No pudimos validar el código QR por problemas de conexión. Guardamos el código para validarlo más tarde. Revisar la red y comunicarlo a tu supervisor.',
    action: 'Permitir ingreso',
    icon: <TicketNetwork />,
  },
];
