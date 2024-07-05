import { MessageType, MetaType, ProgressType } from '@/types';
import * as fs from 'fs';
import { createServer } from 'http';
import next from 'next';
import path from 'node:path';
import { Simulate } from 'react-dom/test-utils';
import { Server, Socket } from 'socket.io';
import error = Simulate.error;

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = app.getRequestHandler();

const rooms: Map<string, Set<string>> = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on('connection', (socket: Socket) => {
    const { room } = socket.handshake.query as { room: string };

    if (!room) return;

    if (!rooms.has(room)) {
      rooms.set(room, new Set());
    }

    // 加入房间
    rooms.get(room).add(socket.id);
    socket.join(room);

    // 通知在线人数
    io.to(room).emit('active', rooms.get(room).size || 0);

    // 转发消息
    socket.on('message', (message: MessageType) => {
      socket.to(room).emit('message', message);
    });

    // 开始上传
    socket.on('start-upload', (message: MessageType) => {
      let bytesReceived = 0;
      const { id, meta } = message;
      const { name, size } = meta as MetaType;
      const filePath = path.join(__dirname, 'uploads', id + '_' + name);
      const writableStream = fs.createWriteStream(filePath);

      const onChunk = (data) => {
        const { chunk } = data;
        const buffer = Buffer.from(chunk, 'base64');
        writableStream.write(buffer, (error) => {
          if (error) {
            socket.emit('upload-failed', { id });
            return;
          }
          bytesReceived += buffer.length;
          const percentage = Math.round((bytesReceived / size) * 100);
          socket.emit('upload-progress', {
            id,
            percentage,
            url: filePath,
          } as ProgressType);
        });
      };

      const onChunkEnd = () => {
        writableStream.end();
        socket.to(room).emit('message', {
          id,
          room,
          uid: socket.id,
          content: name,
          type: 'MEDIA',
          meta: {
            ...meta,
            url: filePath,
          },
        } as MessageType);
        socket.off('chunk', onChunk);
        socket.off('end-upload', onChunkEnd);
      };

      socket.off('chunk', onChunk);
      socket.off('end-upload', onChunkEnd);

      socket.on('chunk', onChunk);
      socket.on('end-upload', onChunkEnd);
    });

    // 断开连接
    socket.on('disconnect', () => {
      rooms.get(room).delete(socket.id);

      // 通知在线人数
      io.to(room).emit('active', rooms.get(room).size || 0);

      socket.leave(room);
    });
  });

  httpServer
    .once('error', () => {
      console.log(error);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Server listening at http://localhost:${port} as ${
          dev ? 'development' : process.env.NODE_ENV
        }`,
      );
    });
});
