'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  initSocket,
  connectSocket,
  disconnectSocket,
  onEvent,
  offEvent,
  emitEvent,
  getSocket,
} from '@/lib/socket';

export const useSocket = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      initSocket();
      connectSocket(session.user.id);

      return () => {
        disconnectSocket();
      };
    }
  }, [session?.user?.id]);

  const emit = useCallback((event: string, data: any) => {
    emitEvent(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    onEvent(event, callback);
    
    return () => {
      offEvent(event, callback);
    };
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    offEvent(event, callback);
  }, []);

  const isConnected = useCallback(() => {
    const socket = getSocket();
    return socket?.connected || false;
  }, []);

  return {
    emit,
    on,
    off,
    isConnected,
  };
};