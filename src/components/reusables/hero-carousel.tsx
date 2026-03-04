'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

type Slide = {
  src: string;
  alt: string;
};

const slides: Slide[] = [
  { src: '/images/welcome-image.png', alt: 'Welcome slide 1' },
  { src: '/images/welcome-image.png', alt: 'Welcome slide 2' },
  { src: '/images/welcome-image.png', alt: 'Welcome slide 3' },
];

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(slides.length);

  React.useEffect(() => {
    if (!api) return;

    const update = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    update();
    api.on('select', update);
    api.on('reInit', update);

    return () => {
      api.off('select', update);
      api.off('reInit', update);
    };
  }, [api]);

  // ====== Klik kiri/kanan tanpa mengganggu drag/swipe ======
  const startXRef = React.useRef<number | null>(null);
  const movedRef = React.useRef(false);
  const MOVE_THRESHOLD = 12;

  const onPointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX;
    movedRef.current = false;
  };

  const onPointerMoveCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    if (Math.abs(e.clientX - startXRef.current) > MOVE_THRESHOLD) {
      movedRef.current = true;
    }
  };

  const onPointerUpCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!api) return;
    if (startXRef.current === null) return;

    const dx = e.clientX - startXRef.current;

    // Kalau user drag/swipe, jangan trigger prev/next
    if (movedRef.current || Math.abs(dx) > MOVE_THRESHOLD) {
      startXRef.current = null;
      movedRef.current = false;
      return;
    }

    // Ini dianggap tap/click
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < rect.width / 2) api.scrollPrev();
    else api.scrollNext();

    startXRef.current = null;
    movedRef.current = false;
  };

  const onPointerCancelCapture = () => {
    startXRef.current = null;
    movedRef.current = false;
  };

  return (
    <div className='flex flex-col gap-2'>
      {/* Carousel area */}
      <div
        className='relative'
        aria-label='Welcome carousel'
        onPointerDownCapture={onPointerDownCapture}
        onPointerMoveCapture={onPointerMoveCapture}
        onPointerUpCapture={onPointerUpCapture}
        onPointerCancelCapture={onPointerCancelCapture}
      >
        <Carousel setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {slides.map((s, idx) => (
              <CarouselItem key={idx}>
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={1200}
                  height={441}
                  className='h-33 w-full md:h-full'
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Dots */}
      <div className='flex justify-center gap-1 md:gap-1.5'>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className={
              idx === current
                ? 'bg-primary-300 flex size-1.5 rounded-full md:size-2.5'
                : 'flex size-1.5 rounded-full bg-neutral-300 md:size-2.5'
            }
          />
        ))}
      </div>
    </div>
  );
}
