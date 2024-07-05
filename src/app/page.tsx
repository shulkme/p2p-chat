'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const room = uuidv4();
    router.push(`/r/${room}`);
  }, []);
  return null;
}
