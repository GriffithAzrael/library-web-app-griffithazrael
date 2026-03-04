'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/reusables/user-menu';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/features/auth/authSlice';
import { clearAuthFromStorage } from '@/features/auth/authStorage';

type AppHeaderProps = {
  logoutRedirectTo?: string;
};

export function AppHeader({ logoutRedirectTo = '/' }: AppHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const { token, user, hydrated } = useAppSelector((s) => s.auth);
  const isLoggedIn = hydrated && !!token && !!user;

  const profileSrc =
    user?.profilePhoto && user.profilePhoto.trim().length > 0
      ? user.profilePhoto
      : '/images/placeholder-profile-pic.png';

  const isProfileDataUrl =
    typeof profileSrc === 'string' && profileSrc.startsWith('data:');

  useEffect(() => {
    if (!isMobileSearchOpen) return;
    // focus input ketika search dibuka
    mobileSearchInputRef.current?.focus();
  }, [isMobileSearchOpen]);

  useEffect(() => {
    if (!isMobileSearchOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileSearchOpen]);

  const handleLogout = () => {
    dispatch(logout());
    clearAuthFromStorage();
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    router.push(logoutRedirectTo);
    router.refresh();
  };

  return (
    <header className='fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-[0px_0px_20px] shadow-[#cbcaca]/25 md:h-20 md:px-30'>
      {/* Desktop logo */}
      <Link href='/' className='hidden md:block'>
        <Image
          className='hidden md:block'
          src={'/icons/library-website-logo.svg'}
          alt='Website logo'
          width={155}
          height={42}
        />
      </Link>

      {/* ===== Mobile search open state (mobile only) ===== */}
      {isMobileSearchOpen ? (
        <div className='flex w-full items-center gap-3 md:hidden'>
          {/* Mobile logo */}
          <Link href='/' className='shrink-0'>
            <Image
              className='md:hidden'
              src={'/icons/library-website-logo-mobile.svg'}
              alt='Website logo'
              width={40}
              height={40}
            />
          </Link>

          {/* Search input */}
          <div className='relative flex-1'>
            <span className='absolute inset-y-0 left-4 flex items-center'>
              <Search size={20} className='text-neutral-700' />
            </span>
            <input
              ref={mobileSearchInputRef}
              type='text'
              placeholder='Search book'
              className='text-text-sm h-10 w-full rounded-full border border-neutral-300 bg-white pr-4 pl-11 font-semibold text-neutral-950 outline-none placeholder:text-neutral-700'
            />
          </div>

          {/* Close button */}
          <button
            type='button'
            aria-label='Close search'
            className='shrink-0'
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <X size={28} className='text-neutral-950' />
          </button>
        </div>
      ) : (
        <>
          {/* Mobile logo (normal state) */}
          <Link href='/' className='md:hidden'>
            <Image
              className='md:hidden'
              src={'/icons/library-website-logo-mobile.svg'}
              alt='Website logo'
              width={40}
              height={40}
            />
          </Link>

          {/* Desktop search (only when logged in) */}
          {isLoggedIn && (
            <div className='hidden flex-1 justify-center px-8 md:flex'>
              <div className='relative w-full max-w-125'>
                <span className='absolute inset-y-0 left-4 flex items-center'>
                  <Image
                    src={'/icons/search-icon.svg'}
                    alt='Search'
                    width={20}
                    height={20}
                  />
                </span>
                <input
                  type='text'
                  placeholder='Search book'
                  className='text-text-sm h-11 w-full rounded-full border border-neutral-300 bg-white pr-4 pl-11 font-semibold text-neutral-700 outline-none'
                />
              </div>
            </div>
          )}

          {/* Desktop buttons container (logged out) */}
          <div className='hidden items-center gap-4 md:flex'>
            {!isLoggedIn && (
              <>
                <Link href='/login'>
                  <Button variant={'white'} className='h-12 w-40.75'>
                    Login
                  </Button>
                </Link>
                <Link href='/register'>
                  <Button className='h-12 w-40.75'>Register</Button>
                </Link>
              </>
            )}

            {/* Desktop logged-in */}
            {isLoggedIn && (
              <div className='flex items-center gap-4 md:gap-6'>
                <Image
                  className='size-7 md:size-8'
                  src={'/icons/bag-icon.svg'}
                  alt='Cart'
                  width={32}
                  height={32}
                />

                <UserMenu variant='desktop' onLogout={handleLogout}>
                  {({ open }) => (
                    <button
                      type='button'
                      className='grid h-12 w-46 grid-cols-[auto_1fr_auto] items-center gap-4'
                    >
                      <Image
                        src={profileSrc}
                        alt='Profile'
                        width={48}
                        height={48}
                        className='size-10 rounded-full object-cover md:size-12'
                        unoptimized={isProfileDataUrl}
                      />

                      <p className='text-text-lg min-w-0 truncate font-semibold text-neutral-950'>
                        {user?.name}
                      </p>

                      {open ? (
                        <ChevronUp className='text-neutral-700' size={24} />
                      ) : (
                        <ChevronDown className='text-neutral-700' size={24} />
                      )}
                    </button>
                  )}
                </UserMenu>
              </div>
            )}
          </div>

          {/* Mobile buttons container */}
          <div className='flex items-center gap-4 md:hidden'>
            {/* Search button (lucide) */}
            <button
              type='button'
              aria-label='Open search'
              onClick={() => {
                // kalau hamburger menu kebuka, tutup dulu
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                setIsMobileSearchOpen(true);
              }}
            >
              <Search size={24} className='text-neutral-950' />
            </button>

            <Image
              src={'/icons/bag-icon.svg'}
              alt='Cart'
              width={28}
              height={28}
            />

            {/* Logged out: hamburger/close */}
            {!isLoggedIn && (
              <button
                type='button'
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((v) => !v)}
              >
                <Image
                  src={
                    isMobileMenuOpen
                      ? '/icons/menu-close-icon-mobile.svg'
                      : '/icons/hamburger-menu-icon.svg'
                  }
                  alt={isMobileMenuOpen ? 'Close mobile menu' : 'Mobile menu'}
                  width={24}
                  height={24}
                />
              </button>
            )}

            {/* Logged in: profile picture (no hamburger, matches Figma) */}
            {isLoggedIn && (
              <UserMenu variant='mobile' onLogout={handleLogout}>
                {() => (
                  <button type='button' aria-label='Open profile menu'>
                    <Image
                      src={profileSrc}
                      alt='Profile'
                      width={48}
                      height={48}
                      className='size-10 rounded-full object-cover md:size-12'
                      unoptimized={isProfileDataUrl}
                    />
                  </button>
                )}
              </UserMenu>
            )}
          </div>

          {/* Mobile menu (INSIDE HEADER) - only when logged out */}
          {!isLoggedIn && isMobileMenuOpen && (
            <div className='absolute top-full right-0 left-0 bg-white px-4 pb-4 md:hidden'>
              <div className='flex gap-3'>
                <Link
                  href='/login'
                  className='flex-1'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant={'white'} className='h-12 w-full'>
                    Login
                  </Button>
                </Link>

                <Link
                  href='/register'
                  className='flex-1'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className='h-12 w-full'>Register</Button>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </header>
  );
}
