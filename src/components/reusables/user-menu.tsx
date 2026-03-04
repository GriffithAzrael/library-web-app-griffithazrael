'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type UserMenuProps = {
  variant?: 'desktop' | 'mobile';
  onLogout: () => void;
  children: (props: { open: boolean }) => React.ReactNode;
};

export function UserMenu({
  variant = 'desktop',
  onLogout,
  children,
}: UserMenuProps) {
  const [open, setOpen] = React.useState(false);

  const sideOffset = variant === 'desktop' ? 10 : 10;

  const contentClassName = cn(
    'rounded-[16px] p-4 font-quicksand border-0 shadow-[0px_0px_20px] shadow-[#cbcaca]/25 flex flex-col gap-4',
    variant === 'desktop' ? 'w-46' : 'w-[calc(100vw-32px)]'
  );

  const itemClassName = cn(
    'w-38',
    '!px-0 !py-0',
    'font-semibold text-md leading-7.5 text-neutral-950',
    'focus:bg-transparent focus:text-neutral-950',
    'data-[highlighted]:bg-transparent data-[highlighted]:text-neutral-950'
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children({ open })}</DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        sideOffset={sideOffset}
        className={contentClassName}
      >
        <DropdownMenuItem asChild className={itemClassName}>
          <Link href='/profile'>Profile</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className={itemClassName}>
          <Link href='/borrowed-list'>Borrowed List</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className={itemClassName}>
          <Link href='/reviews'>Reviews</Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            itemClassName,
            'text-destructive focus:text-destructive data-highlighted:text-destructive'
          )}
          onSelect={(e) => {
            e.preventDefault();
            setOpen(false);
            onLogout();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
