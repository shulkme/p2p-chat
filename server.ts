import { ChunkType, MessageType } from '@/types';
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

    // 分片文件上传
    socket.on('chunk', (data: ChunkType) => {
      const { filename, chunk, chunks, index } = data;

      const filePath = path.join(__dirname, 'uploads', filename);

      fs.appendFile(filePath, Buffer.from(chunk, 'base64'), (err) => {
        if (err) {
          console.log('Error:', err);
          socket.emit('upload-failed', { filename });
          return;
        }

        socket.emit('progress', { filename, index, chunks });

        if (index === chunks) {
          socket.to(room).emit('file', { filename, filePath });
        }
      });
    });

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
