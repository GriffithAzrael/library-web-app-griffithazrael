import Image from 'next/image';

type ReviewCardProps = {
  reviewerName: string;
  reviewedAt: string;
  rating: number;
  reviewText: string;
  profileImageSrc?: string;
};

export function ReviewCard({
  reviewerName,
  reviewedAt,
  rating,
  reviewText,
  profileImageSrc = '/images/placeholder-profile-pic.png',
}: ReviewCardProps) {
  const fullStars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className='rounded-radius-2xl flex flex-col gap-4 bg-white p-4 shadow-[0px_0px_20px] shadow-[#cbcaca]/25'>
      <div className='flex items-center gap-3'>
        <Image
          className='size-14.5 rounded-full object-cover md:size-16'
          src={profileImageSrc}
          alt='Reviewer profile'
          width={1200}
          height={1200}
        />
        <div className='text-text-sm flex flex-col'>
          <p className='md:text-text-lg -mb-0.5 font-bold md:mb-0 md:-tracking-[2%]'>
            {reviewerName}
          </p>
          <p className='md:text-text-md -mt-0.5 font-medium -tracking-[3%] md:mt-0'>
            {reviewedAt}
          </p>
        </div>
      </div>

      {/* Rating & Review text */}
      <div className='flex flex-col gap-2'>
        <div className='flex md:gap-0.5'>
          {Array.from({ length: fullStars }).map((_, idx) => (
            <Image
              key={idx}
              src={'/icons/star-rating.svg'}
              alt='Rating'
              width={24}
              height={24}
            />
          ))}
        </div>

        <p className='text-text-sm md:text-text-md font-semibold'>
          {reviewText}
        </p>
      </div>
    </div>
  );
}
