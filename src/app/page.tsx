'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const room = crypto.randomUUID();
    router.push(`/r/${room}`);
  }, []);
  return null;
}
