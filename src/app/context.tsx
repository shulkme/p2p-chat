'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import io, { Socket } from 'socket.io-client';

interface AppContextType {
  socket: Socket | null;
  uid: string;
  room: string;
  users: number;
  shut: boolean;
  setAppState?: (state: Partial<AppContextType>) => void;
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
  const [state, setState] = useState<AppContextType>({
    socket: null,
    uid: '',
    room: '',
    shut: true,
    users: 0,
  });

  // 禁言，房间至少2人才可以发言
  const shut = useMemo(() => state.users < 2, [state.users]);

  // 重写状态更新
  const setAppState = (obj: Partial<AppContextType>) => {
    setState((prevState) => ({ ...prevState, ...obj }));
  };

  // 创建连接
  useEffect(() => {
    // 初始化socket
    const socket = io({
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    // 建立连接
    socket.on('connect', () => {
      setAppState({ uid: socket.id });
    });

    // 活跃通知
    socket.on('active', (users: number) => {
      setAppState({ users });
    });

    setAppState({ socket });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        shut,
        setAppState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
