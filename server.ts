import { createServer } from 'http';
import next from 'next';
import { Simulate } from 'react-dom/test-utils';
import { Server, Socket } from 'socket.io';
import error = Simulate.error;

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on('connection', (socket: Socket) => {
    // 加入房间
    socket.on('join', (room) => {
      console.log(room);
      socket.join(room);
      // 通知在线人数
      io.to(room).emit('active', io.sockets.adapter.rooms.get(room)?.size || 0);
    });

    socket.on('message', (message) => {
      const { room } = message;
      if (io.sockets.adapter.rooms.has(room)) {
        io.to(room).emit('message', message);
      }
    });

    socket.on('disconnect', () => {});
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
