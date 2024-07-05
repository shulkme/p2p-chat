'use client';
import { useApp } from '@/app/context';
import ActionBar from '@/components/ActionBar';
import Bubble from '@/components/Bubble';
import Header from '@/components/Header';
import { MessageType, ProgressType } from '@/types';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { useEffect, useState } from 'react';

export default function Page({ params }: { params: { room: string } }) {
  const { room } = params;
  const { setAppState, socket, uid } = useApp();

  const [messages, setMessages] = useState<MessageType[]>([]);

  const emitMessage = (message: MessageType) => {
    setMessages((history) => [...history, message]);
  };

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
    socket.on('message', (data: MessageType) => {
      emitMessage(data);
    });

    socket.on('upload-progress', (data: ProgressType) => {
      const { id, percentage, url } = data;
      setMessages((prevState) =>
        prevState.map((msg) => {
          const meta = {
            ...msg.meta,
            percentage,
            url,
          };
          return msg.id === id ? { ...msg, meta } : msg;
        }),
      );
    });

    socket.on('upload-failed', (data: { id: string }) => {
      const { id } = data;
      setMessages((prevState) =>
        prevState.map((msg) => {
          return msg.id === id
            ? { ...msg, type: 'TEXT', content: '上传失败' }
            : msg;
        }),
      );
    });

    return () => {
      socket.off('message');
      socket.off('upload-progress');
      socket.off('upload-failed');
    };
  }, [socket]);

  return (
    <div id="app" className="flex flex-col h-dvh overflow-hidden">
      <header className="flex-none">
        <Header />
      </header>
      <main className="bg-white flex-auto rounded-t-2xl overflow-hidden flex flex-col">
        <div className="flex-auto overflow-auto">
          <div className="wrapper">
            <div className="space-y-2 py-10 px-2">
              {messages.map((msg) => (
                <Bubble key={msg.id} primary={msg.uid === uid} {...msg} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-none -mt-4">
          <ActionBar emitMessage={emitMessage} />
        </div>
      </main>
    </div>
  );
}
