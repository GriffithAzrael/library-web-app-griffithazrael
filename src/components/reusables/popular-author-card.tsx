import Image from 'next/image';

type PopularAuthorCardProps = {
  name: string;
  bookCount: number;
};

export function PopularAuthorCard({ name, bookCount }: PopularAuthorCardProps) {
  return (
    <div className='rounded-radius-xl flex w-full items-center gap-3 bg-white p-3 shadow-[0px_0px_20px] shadow-[#cbcaca]/25 md:gap-4 md:p-4'>
      <Image
        src={'/images/placeholder-profile-pic.png'}
        alt='Author profile picture'
        width={81}
        height={81}
        className='size-15 rounded-full md:size-20.25'
      />
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <p className='text-text-md md:text-text-lg w-full truncate font-bold'>
          {name}
        </p>
        <div className='flex items-center gap-1.5'>
          <Image
            src={'/icons/book-icon.svg'}
            alt='Author profile picture'
            width={24}
            height={24}
          />
          <p className='text-text-sm md:text-text-md font-medium -tracking-[3%]'>
            {bookCount} books
          </p>
        </div>
      </div>
    </div>
  );
}
