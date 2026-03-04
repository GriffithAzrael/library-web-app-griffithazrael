import Image, { type ImageLoader } from 'next/image';
import { cn } from '@/lib/utils';

type CoverVariant = 'fixed' | 'aspect';

type BookCardProps = {
  title: string;
  authorName: string;
  rating: number;
  coverImage: string | null;

  // untuk menjaga styling tetap fleksibel tanpa duplikasi komponen
  coverVariant?: CoverVariant;

  titleClassName?: string;
  authorClassName?: string;

  // optional: untuk override wrapper cover aspect (kalau suatu halaman beda)
  coverAspectWrapperClassName?: string;
};

const passthroughLoader: ImageLoader = ({ src }) => src;

export function BookCard({
  title,
  authorName,
  rating,
  coverImage,
  coverVariant = 'aspect',
  titleClassName,
  authorClassName,
  coverAspectWrapperClassName,
}: BookCardProps) {
  const safeCover =
    coverImage && !coverImage.startsWith('blob:')
      ? coverImage
      : '/images/book-cover-placeholder.png';

  const isRemote = safeCover.startsWith('http');
  const isDataUrl = safeCover.startsWith('data:');

  return (
    <div className='rounded-radius-xl flex flex-col bg-white shadow-[0px_0px_20px] shadow-[#cbcaca]/25'>
      {coverVariant === 'aspect' ? (
        <div
          className={cn(
            'rounded-t-radius-xl relative aspect-2/3 w-full overflow-hidden',
            coverAspectWrapperClassName
          )}
        >
          <Image
            fill
            loader={isRemote ? passthroughLoader : undefined}
            unoptimized={isRemote || isDataUrl ? true : undefined}
            src={safeCover}
            alt='Book cover image'
            className='object-cover'
            sizes='(min-width: 768px) 20vw, 50vw'
          />
        </div>
      ) : (
        <Image
          loader={isRemote ? passthroughLoader : undefined}
          unoptimized={isRemote || isDataUrl ? true : undefined}
          src={safeCover}
          alt='Book cover image'
          width={400}
          height={600}
          className='rounded-t-radius-xl h-64.5 w-full object-cover'
        />
      )}

      <div className='text-text-sm md:text-text-md flex flex-col gap-0.5 p-3 md:gap-1 md:p-4'>
        <p className={cn('md:text-text-lg truncate font-bold', titleClassName)}>
          {title}
        </p>
        <p
          className={cn('truncate font-medium -tracking-[3%]', authorClassName)}
        >
          {authorName}
        </p>

        <div className='flex items-center gap-0.5'>
          <Image
            src={'/icons/star-rating.svg'}
            alt='Rating'
            width={24}
            height={24}
          />
          <p className='font-semibold'>{Number(rating).toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
