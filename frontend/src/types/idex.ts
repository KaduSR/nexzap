// cspell: disable

export interface Contact {
  id: number;
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  isGroup: boolean;
  companyId: number;
}

export interface Queue {
  id: number;
  name: string;
  color: string;
  greentingMessage?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  queues?: Queue[];
}

export interface Ticket {
  id: number;
  status: "pending" | "open" | "closed";
  unreadMessages: number;
  lastMessage: string;
  isGroup: boolean;
  UpdatedAt: string;
  contactId: number;
  contact?: Contact;
  userId?: number;
  user?: User;
  queueId?: number;
  queue?: Queue;
  companyId: number;
  whatsappId?: number;
  uuid?: string;
}

export interface Message {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe: boolean;
  read: boolean;
  mediaType: string;
  mediaUrl?: string;
  ack: number;
  createdAt: string;
  quotedMsgId?: string;
  ticket?: Ticket;
  contact?: Contact;
}

export interface WhatsappSession {
  id: number;
  name: string;
  status: "CONNECTED" | "DISCONNECTED" | "OPENING" | "qrcode";
  qrcode?: string;
  isDefault: boolean;
  battery?: string;
  plugged?: boolean;
  retries?: number;
  greentingMessage?: string;
  farewellMessage?: string;
  outOfHoursMessage?: string;
  companyId: number;
  updatedAt: string;
}
