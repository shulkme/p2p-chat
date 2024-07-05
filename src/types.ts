export interface MetaType {
  name: string;
  size: number;
  url: string;
  mine: string;
  percentage?: number;
}

export interface MessageType {
  id: string;
  room: string;
  uid: string;
  content: string;
  type: 'TEXT' | 'MEDIA';
  meta?: MetaType;
  time: Date;
}

export interface ChunkType {
  id: string;
  filename: string;
  chunk: string;
  chunks: number;
  index: number;
  meta?: MetaType;
}

export interface ProgressType extends Pick<ChunkType, 'id'> {
  percentage: number;
  url: string;
}
