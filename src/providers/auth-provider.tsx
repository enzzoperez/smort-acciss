import { useRouter } from 'expo-router';
import { ReactNode, useEffect } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    if (true) {
      router.replace('/');
    } else {
    }
  }, []);

  return <>{children}</>;
};
