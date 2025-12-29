
export type TicketStatus = 'open' | 'pending' | 'closed';

export interface Contact {
  id: string;
  name: string;
  number: string;
  profilePicUrl?: string;
  lastMessage?: string;
  updatedAt: string;
  channel: 'WHATSAPP' | 'TELEGRAM' | 'INSTAGRAM' | 'FACEBOOK' | 'X';
}

export interface Message {
  id: string;
  ticketId: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  type: 'text' | 'image' | 'audio' | 'video';
}

export interface Ticket {
  id: string;
  contact: Contact;
  status: TicketStatus;
  unreadMessages: number;
  lastMessage: string;
  queueId?: string;
}

export interface Queue {
  id: string;
  name: string;
  color: string;
}

export interface Connection {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PAIRING' | 'TIMEOUT' | 'ERROR';
  type: 'BAILEYS' | 'META_WA' | 'TELEGRAM' | 'INSTAGRAM' | 'FACEBOOK' | 'X';
  number?: string;
  username?: string;
  updatedAt: string;
}

export interface DashboardStats {
  ticketsOpened: number;
  ticketsFinished: number;
  avgResponseTime: string;
  leadsCaptured: number;
}
