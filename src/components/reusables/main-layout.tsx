import { AppHeader } from '@/components/reusables/app-header';
import { AppFooter } from '@/components/reusables/app-footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='font-quicksand bg-white text-neutral-950'>
      <div>
        <AppHeader />
        {children}
        <AppFooter />
      </div>
    </div>
  );
}
