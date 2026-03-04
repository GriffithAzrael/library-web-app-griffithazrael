'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { loadAuthFromStorage } from '@/features/auth/authStorage';
import { setCredentials, setHydrated } from '@/features/auth/authSlice';

function AuthHydrator() {
  useEffect(() => {
    const data = loadAuthFromStorage();
    if (data) {
      store.dispatch(setCredentials(data));
    }
    store.dispatch(setHydrated(true));
  }, []);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
