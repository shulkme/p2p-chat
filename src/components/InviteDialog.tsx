'use client';
import { useApp } from '@/app/context';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import QRCode from 'qrcode';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

export interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [img, setImg] = useState<string>('');

  const { room } = useApp();
  const url = useMemo(() => {
    return process.env.NEXT_PUBLIC_BASE_HOST + '/r/' + room;
  }, [room]);

  useEffect(() => {
    setLoading(true);
    QRCode.toDataURL(url)
      .then((img) => {
        setImg(img);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [url]);

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={onClose}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/80">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-sm rounded-3xl bg-white p-6 duration-300 ease-out data-[closed]:transform-[scale(0%)] data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="text-base/7 font-medium text-slate-950 text-center"
            >
              邀请
            </DialogTitle>
            <p className="mt-4 text-center">
              <img
                src={img}
                alt="qrcode"
                className="block size-64 bg-slate-200 mx-auto"
              />
              <Button
                className="bg-primary text-primary-foreground text-sm mt-4 px-4 py-2 rounded-full hover:bg-primary/80"
                onClick={onClose}
              >
                关闭
              </Button>
            </p>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default InviteDialog;
