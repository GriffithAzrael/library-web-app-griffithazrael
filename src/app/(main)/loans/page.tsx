'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Loans() {
  return (
    <main className='bg-neutral-25 flex flex-col px-4 pt-20 pb-4 md:ml-55 md:w-139.25 md:px-0 md:pt-30 md:pb-27.5'>
      {/* Container */}
      <div className='flex flex-col gap-3.75'>
        {/* Menu Buttons (when clicked, each will redirect to a page) */}
        <div className='rounded-radius-2xl flex gap-2 bg-neutral-100 p-2'>
          <Button
            className='md:text-text-md h-10 flex-1 bg-transparent font-medium'
            variant={'menu'}
          >
            Profile
          </Button>
          <Button className='md:text-text-md h-10 flex-1' variant={'menu'}>
            Borrowed List
          </Button>
          <Button
            className='md:text-text-md h-10 flex-1 bg-transparent font-medium'
            variant={'menu'}
          >
            Reviews
          </Button>
        </div>

        {/* Borrowed books list */}
        <h2 className='text-display-xs font-bold'>Borrowed List</h2>
        {/* Borrowed list container */}
        
      </div>
    </main>
  );
}
