import Image from 'next/image';
import { cn } from '@/lib/utils';

type CategoryCardProps = {
  title: string;
  iconSrc: string;
  iconAlt?: string;
  className?: string;
  iconWrapperClassName?: string;
};

export function CategoryCard({
  title,
  iconSrc,
  iconAlt,
  className,
  iconWrapperClassName,
}: CategoryCardProps) {
  return (
    <div
      className={cn(
        'rounded-radius-2xl flex h-33 flex-col gap-3 bg-white p-2 shadow-[0px_0px_20px] shadow-[#cbcaca]/25 md:h-32.5 md:w-full md:p-3',
        className
      )}
    >
      <div
        className={cn(
          'md:rounded-radius-xl flex items-center justify-center rounded-[10.5px] bg-[#E0ECFF] p-[5.6px] md:p-[6.4px]',
          iconWrapperClassName
        )}
      >
        <Image
          src={iconSrc}
          alt={iconAlt ?? title}
          width={51.2}
          height={51.2}
          className='size-[44.8px] md:size-[51.2px]'
        />
      </div>

      <p className='text-text-xs md:text-text-md truncate font-semibold'>
        {title}
      </p>
    </div>
  );
}
