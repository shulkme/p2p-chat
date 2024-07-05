'use client';
import { useApp } from '@/app/context';
import ArrowUpIcon from '@/icons/ArrowUp';
import PaperclipIcon from '@/icons/Paperclip';
import { MessageType, MetaType } from '@/types';
import { cn } from '@/utils/classnames';
import {
  Button,
  Input,
  InputProps,
  Textarea,
  TextareaProps,
} from '@headlessui/react';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ActionBar: React.FC<{
  emitMessage: (message: MessageType) => void;
}> = ({ emitMessage }) => {
  const { socket, room, uid, shut } = useApp();

  const [text, setText] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const chunk_size = 1024 * 10; // 10kb
  const max_upload_size = 1024 * 1024 * 10; // 10mb

  const pushMessage = (obj: Partial<MessageType>, remote: boolean = true) => {
    const data: MessageType = {
      id: uuidv4(),
      uid,
      room,
      content: '',
      type: 'TEXT',
      time: new Date(),
      ...obj,
    };
    emitMessage(data);
    if (socket && remote) socket.emit('message', data);
  };

  const onUploadChange: InputProps['onChange'] = (event) => {
    const files = event.target.files;

    if (!files || files.length < 1) return;

    const file = files[0];

    if (file.size > max_upload_size) {
      return;
    }

    const meta: MetaType = {
      mine: file.type,
      size: file.size,
      name: file.name,
      url: '',
    };

    const data: Partial<MessageType> = {
      id: uuidv4(),
      type: 'MEDIA',
      content: file.name,
      meta: {
        ...meta,
        percentage: 0,
      },
    };

    pushMessage(data, false);

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileSize = file.size;
      let offset = 0;

      socket.emit('start-upload', data);

      while (offset < fileSize) {
        const chunk = reader.result.slice(offset, offset + chunk_size);
        const base64Chunk = btoa(chunk as string); // Convert chunk to base64

        socket.emit('chunk', {
          chunk: base64Chunk,
        });

        offset += chunk_size;
      }

      socket.emit('end-upload');
    };

    reader.readAsBinaryString(file);
  };

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
    if (text.trim() !== '') {
      pushMessage({
        content: text,
        type: 'TEXT',
      });
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
            <Input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={onUploadChange}
            />
            <Button
              disabled={shut}
              className={cn(
                'flex justify-center size-9 rounded-full items-center bg-slate-100 text-black text-lg [&:not([data-disabled])]:hover:bg-slate-200',
                'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
              )}
              onClick={() => fileRef.current?.click()}
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
