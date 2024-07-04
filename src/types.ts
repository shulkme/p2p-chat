export interface MessageType {
  id: string;
  room: string;
  uid: string;
  content: string;
  type: 'TEXT' | 'MEDIA';
  meta?: Record<string, any>;
}

export interface ChunkType {
  filename: string;
  chunk: string;
  chunks: number;
  index: number;
}
