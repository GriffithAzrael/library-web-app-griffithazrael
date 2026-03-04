import { MainLayout } from '@/components/reusables/main-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}