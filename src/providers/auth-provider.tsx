import { useAppSelector } from '@/libs/redux';
import { useRouter } from 'expo-router';
import { ReactNode, useEffect, useRef } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { accessToken } = useAppSelector((state) => state.auth);
  const wasAuthenticatedRef = useRef<boolean | null>(null);

  useEffect(() => {
    const isAuthenticated = !!accessToken;

    if (wasAuthenticatedRef.current === isAuthenticated) return;
    wasAuthenticatedRef.current = isAuthenticated;

    if (isAuthenticated) {
      router.replace('/select-events');
    } else {
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
    }
  }, [accessToken]);

  return <>{children}</>;
};
