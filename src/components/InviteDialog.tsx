'use client';
import { useApp } from '@/app/context';
import RingResizeIcon from '@/icons/RingResize';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import QRCode from 'qrcode';
import type React from 'react';
import { useEffect, useState } from 'react';

export interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [img, setImg] = useState<string>('');
  const { room } = useApp();

  useEffect(() => {
    setLoading(true);
    QRCode.toDataURL(window.location.origin + '/r/' + room)
      .then((img) => {
        setImg(img);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [room]);

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
              <div className="size-64 bg-slate-200 mx-auto">
                {loading ? (
                  <div className="size-full flex justify-center items-center text-4xl text-primary/50">
                    <RingResizeIcon />
                  </div>
                ) : (
                  <img src={img} alt="qrcode" className="block size-full" />
                )}
              </div>
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
