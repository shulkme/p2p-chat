'use client';
import { useApp } from '@/app/context';
import ActionBar from '@/components/ActionBar';
import Bubble from '@/components/Bubble';
import Header from '@/components/Header';
import { MessageType } from '@/types';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { useEffect, useState } from 'react';

export default function Page({ params }: { params: { room: string } }) {
  const { room } = params;
  const { setAppState, socket, uid } = useApp();

  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    setAppState?.({ room });
    Fancybox.bind('[data-fancybox]', {
      Thumbs: false,
      Carousel: {
        Navigation: false,
      },
      Toolbar: {
        display: {
          left: [],
          middle: ['prev', 'infobar', 'next'],
          right: ['download', 'close'],
        },
      },
    });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join', room);

    socket.on('message', (data: MessageType) => {
      setMessages((history) => [...history, data]);
    });

    return () => {
      socket.off('message');
    };
  }, [socket]);

  return (
    <div id="app" className="flex flex-col h-screen">
      <header className="flex-none">
        <Header />
      </header>
      <main className="bg-white flex-auto rounded-t-2xl overflow-hidden flex flex-col">
        <div className="flex-auto overflow-auto">
          <div className="wrapper">
            <div className="space-y-2 py-10 px-2">
              {messages.map((msg, index) => (
                <Bubble key={index} primary={msg.uid === uid} {...msg} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-none -mt-4">
          <ActionBar />
        </div>
      </main>
    </div>
  );
}
