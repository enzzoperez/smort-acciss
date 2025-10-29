import { useAppSelector } from '@/libs/redux';
import { useRouter } from 'expo-router';
import { ReactNode, useEffect } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      router.replace('/select-events');
    } else {
      router.replace('/');
    }
  }, [accessToken]);

  return <>{children}</>;
};
