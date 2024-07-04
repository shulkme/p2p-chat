export interface MessageType {
  room: string;
  uid: string;
  content: string;
  type: 'TEXT' | 'MEDIA';
  meta?: Record<string, any>;
}
