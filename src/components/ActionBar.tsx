'use client';
import { useApp } from '@/app/context';
import ArrowUpIcon from '@/icons/ArrowUp';
import PaperclipIcon from '@/icons/Paperclip';
import { MessageType } from '@/types';
import { cn } from '@/utils/classnames';
import { Button, Textarea, TextareaProps } from '@headlessui/react';
import React, { useEffect, useRef, useState } from 'react';

const ActionBar: React.FC = () => {
  const { socket, room, uid, shut } = useApp();

  const [text, setText] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const onUploadChange = () => {};

  // 文本框监听
  const onTextChange: TextareaProps['onChange'] = (event) => {
    const lines = event.target.value.split('\n').length;
    if (lines > 5) {
      event.target.rows = 5;
    } else {
      event.target.rows = lines || 1;
    }
    setText(event.target.value);
  };

  // 文本框提交事件
  const onTextSubmit = () => {
    if (text.trim() !== '' && socket) {
      const data: MessageType = {
        uid,
        room,
        content: text,
        type: 'TEXT',
        meta: {},
      };
      socket.emit('message', data);
    }
    setText('');
    if (textareaRef.current) {
      textareaRef.current.rows = 1;
    }
  };

  // 回车监听
  const onTextKeyDown: TextareaProps['onKeyDown'] = (event) => {
    if (event.key === 'Enter') {
      if (event.ctrlKey) {
        setText((txt) => txt + '\n');
      } else {
        event.preventDefault();
        onTextSubmit();
      }
    }
  };

  // 自动滚动条
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div className="bg-gradient-to-t from-white via-20% via-white to-transparent">
      <div className="wrapper py-4">
        <div className="flex items-end gap-1 bg-white p-2 rounded-3xl shadow-2xl">
          <div className="flex-none">
            <Button
              disabled={shut}
              className={cn(
                'flex justify-center size-9 rounded-full items-center bg-slate-100 text-black text-lg [&:not([data-disabled])]:hover:bg-slate-200',
                'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
              )}
            >
              <PaperclipIcon />
            </Button>
          </div>
          <div className="flex-auto">
            <Textarea
              ref={textareaRef}
              disabled={shut}
              value={text}
              placeholder={shut ? '请等待其他人' : '发送消息'}
              rows={1}
              className={cn(
                'block resize-none outline-none text-sm w-full text-slate-950 placeholder:text-slate-400 p-2 bg-transparent',
                'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
              )}
              onChange={onTextChange}
              onKeyDown={onTextKeyDown}
            />
          </div>
          <div className="flex-none">
            <Button
              disabled={shut || text.trim() === ''}
              className={cn(
                'flex justify-center size-9 rounded-full items-center bg-primary text-primary-foreground text-lg [&:not([data-disabled])]:hover:bg-primary/80',
                'data-[disabled]:opacity-70 data-[disabled]:cursor-not-allowed',
              )}
              onClick={onTextSubmit}
            >
              <ArrowUpIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
