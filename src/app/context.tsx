'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface AppContextType {
  socket: Socket | null;
  uid: string;
  room: string;
  setRoom: (room: string) => void;
  users: number;
  setUsers: (users: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within a AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const [uid, setUid] = useState<string>('');

  const [room, setRoom] = useState<string>('');

  const [users, setUsers] = useState<number>(0);

  // 创建连接
  useEffect(() => {
    // 初始化socket
    const the_socket = io({
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    the_socket.on('connect', () => {
      the_socket.on('uid', (uid: string) => {
        setUid(uid);
      });
    });

    setSocket(the_socket);

    return () => {
      the_socket.disconnect();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        socket,
        users,
        uid,
        room,
        setRoom,
        setUsers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
