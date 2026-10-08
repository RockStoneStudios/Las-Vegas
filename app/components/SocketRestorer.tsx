
'use client';
import { useEffect } from 'react';
import { useSocketStore } from '@/lib/store/useSocketStore';

export default function SocketRestorer() {
  useEffect(() => {
    useSocketStore.getState().restaurarSesion();
  }, []);
  return null;
}