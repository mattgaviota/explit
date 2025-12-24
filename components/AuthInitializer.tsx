'use client';

import { useEffect } from 'react';
import { initializeAuth } from '@/lib/firebase';

export default function AuthInitializer() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return null;
}
