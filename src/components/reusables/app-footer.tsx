import Image from 'next/image';

export function AppFooter() {
  return (
    <footer className='flex flex-col items-center border border-t-neutral-300 px-4 py-10 md:px-37.5 md:py-20'>
      <div className='flex flex-col gap-4 md:items-center md:gap-10'>
        <div className='flex flex-col gap-4 md:gap-5.5'>
          <div className='flex justify-center'>
            <Image
              src={'/icons/library-website-logo.svg'}
              alt='Website logo'
              width={155}
              height={42}
              className='h-10.5 w-35.25 md:w-38.75'
            />
          </div>

          <p className='text-text-sm md:text-text-md text-center font-semibold -tracking-[2%] text-neutral-950'>
            Discover inspiring stories & timeless knowledge, ready to borrow
            anytime. Explore online or visit our nearest library branch.
          </p>
        </div>

        <div className='flex flex-col gap-5 md:w-49'>
          <h2 className='text-text-md text-center font-extrabold md:text-left'>
            Follow on Social Media
          </h2>

          <div className='flex justify-center gap-3'>
            <div className='flex rounded-full border border-neutral-300'>
              <Image
                src={'/icons/facebook-logo.svg'}
                alt='Facebook'
                width={40}
                height={40}
              />
            </div>
            <div className='flex rounded-full border border-neutral-300'>
              <Image
                src={'/icons/instagram-logo.svg'}
                alt='Instagram'
                width={40}
                height={40}
              />
            </div>
            <div className='flex rounded-full border border-neutral-300'>
              <Image
                src={'/icons/linkedin-logo.svg'}
                alt='LinkedIn'
                width={40}
                height={40}
              />
            </div>
            <div className='flex rounded-full border border-neutral-300'>
              <Image
                src={'/icons/tiktok-logo.svg'}
                alt='Tiktok'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
