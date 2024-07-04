'use client';
import { useApp } from '@/app/context';
import InviteDialog from '@/components/InviteDialog';
import React, { useState } from 'react';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { users } = useApp();

  return (
    <>
      <div className="flex justify-between items-center py-3 px-4">
        <div className="flex gap-2 items-center">
          <div className="w-6 h-6">👋🏻</div>
          <div className="text-base font-semibold leading-none">P2P</div>
        </div>
        <div className="text-sm flex gap-1 items-center leading-none">
          <span>在线：{users}人</span>
        </div>
        <div className="flex">
          <button
            className="bg-primary text-primary-foreground px-4 py-1.5 text-sm rounded-full hover:bg-primary/80"
            onClick={() => setOpen(true)}
          >
            邀请
          </button>
        </div>
      </div>
      <InviteDialog isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default Header;
