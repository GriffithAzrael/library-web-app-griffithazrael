'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Image, { type ImageLoader } from 'next/image';
import { Button } from '@/components/ui/button';
import { ReviewCard } from '@/components/reusables/review-card';
import { RelatedBooks } from '@/components/reusables/related-books';

import { useParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMediaQuery } from '@/hooks/use-media-query';
import dayjs from 'dayjs';
import { apiFetch } from '@/lib/api';

const passthroughLoader: ImageLoader = ({ src }) => src;

type BookDetailResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    title: string;
    description: string | null;
    isbn: string;
    publishedYear: number | null;
    coverImage: string | null;
    rating: number;
    reviewCount: number;
    totalCopies: number;
    availableCopies: number;
    borrowCount: number;
    authorId: number;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
    author: {
      id: number;
      name: string;
      bio: string | null;
      createdAt: string;
      updatedAt: string;
    };
    category: {
      id: number;
      name: string;
      createdAt: string;
      updatedAt: string;
    };
    // Ada reviews di response book detail, tapi untuk load-more dipakai endpoint reviews khusus
    reviews: Array<{
      id: number;
      star: number;
      comment: string;
      userId: number;
      bookId: number;
      createdAt: string;
      user: {
        id: number;
        name: string;
      };
    }>;
  };
};

type BookReviewsResponse = {
  success: boolean;
  message: string;
  data: {
    bookId: number;
    reviews: Array<{
      id: number;
      star: number;
      comment: string;
      userId: number;
      bookId: number;
      createdAt: string;
      user: {
        id: number;
        name: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export default function Detail() {
  const params = useParams<{ id: string }>();
  const bookId = Number(params.id);

  const bookQuery = useQuery({
    queryKey: ['book', bookId],
    enabled: Number.isFinite(bookId),
    queryFn: () =>
      apiFetch<BookDetailResponse>(`/api/books/${bookId}`, { method: 'GET' }),
  });

  const book = bookQuery.data?.data;

  const coverSrc = book?.coverImage ?? '/images/book-detail-placeholder.png';
  const isRemoteCover =
    typeof coverSrc === 'string' && coverSrc.startsWith('http');

  // Reviews pagination (Load More)
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const limit = isDesktop ? 6 : 3;

  const reviewsQuery = useInfiniteQuery({
    queryKey: ['reviews', 'book', bookId, { limit }],
    enabled: Number.isFinite(bookId),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiFetch<BookReviewsResponse>(
        `/api/reviews/book/${bookId}?page=${Number(pageParam)}&limit=${limit}`,
        { method: 'GET' }
      ),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const reviews = reviewsQuery.data?.pages.flatMap((p) => p.data.reviews) ?? [];

  return (
    <main className='flex flex-col bg-white px-4 pt-20 pb-4 md:w-full md:px-30 md:pt-32 md:pb-29.5'>
      <div className='flex flex-col gap-6 md:gap-16'>
        <div className='flex flex-col gap-4'>
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className='text-primary-300 font-semibold'
                  href='/'
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className='text-primary-300 font-semibold'
                  href='/category'
                >
                  Category
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className='font-semibold text-neutral-950'>
                  {bookQuery.isLoading ? '...' : (book?.title ?? '-')}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Book cover */}
          <div className='flex flex-col gap-9 md:flex-row md:items-start'>
            <div className='h-82.25 w-55.75 shrink-0 self-center bg-neutral-200 p-1.25 md:h-124.5 md:w-84.25 md:p-2'>
              <Image
                className='size-full'
                src={coverSrc}
                alt='Book cover'
                width={650}
                height={1063}
                loader={isRemoteCover ? passthroughLoader : undefined}
                unoptimized={isRemoteCover ? true : undefined}
              />
            </div>

            {/* Book details */}
            <div className='flex flex-col gap-4 md:gap-5'>
              {/* Book title and rating */}
              <div className='flex flex-col gap-3 md:gap-5.5'>
                <div className='flex flex-col gap-0.5 md:gap-1'>
                  <div className='text-text-sm rounded-radius-sm flex w-fit border border-neutral-300 px-2 leading-6.5 font-bold'>
                    {bookQuery.isLoading
                      ? '...'
                      : (book?.category?.name ?? '-')}
                  </div>
                  <h1 className='text-display-xs md:text-display-sm font-bold md:-tracking-[2%]'>
                    {bookQuery.isLoading ? '...' : (book?.title ?? '-')}
                  </h1>
                  <p className='text-text-sm md:text-text-md font-semibold text-neutral-700'>
                    {bookQuery.isLoading ? '...' : (book?.author?.name ?? '-')}
                  </p>
                  <div className='flex gap-0.5'>
                    <Image
                      src={'/icons/star-rating.svg'}
                      alt='Rating'
                      width={24}
                      height={24}
                    />
                    <p className='text-text-md font-bold'>
                      {bookQuery.isLoading
                        ? '...'
                        : Number(book?.rating ?? 0).toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Book stats */}
                <div className='flex gap-5'>
                  <div className='flex w-full flex-col md:max-w-25.5'>
                    <p className='text-text-lg md:text-display-xs font-bold'>
                      {bookQuery.isLoading ? '...' : (book?.totalCopies ?? 0)}
                    </p>
                    <p className='text-text-sm md:text-text-md font-medium md:-tracking-[3%]'>
                      Total
                    </p>
                  </div>

                  <div className='w-px bg-neutral-300'></div>

                  <div className='flex w-full flex-col md:max-w-25.5'>
                    <p className='text-text-lg md:text-display-xs font-bold'>
                      {bookQuery.isLoading ? '...' : (book?.borrowCount ?? 0)}
                    </p>
                    <p className='text-text-sm md:text-text-md font-medium md:-tracking-[3%]'>
                      Borrowed
                    </p>
                  </div>

                  <div className='w-px bg-neutral-300'></div>

                  <div className='flex w-full flex-col md:max-w-25.5'>
                    <p className='text-text-lg md:text-display-xs font-bold'>
                      {bookQuery.isLoading
                        ? '...'
                        : (book?.availableCopies ?? 0)}
                    </p>
                    <p className='text-text-sm md:text-text-md font-medium md:-tracking-[3%]'>
                      Available
                    </p>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className='h-px w-full bg-neutral-300'></div>

              {/* Description */}
              <div className='flex flex-col gap-1'>
                <h2 className='text-text-xl font-bold -tracking-[2%]'>
                  Description
                </h2>
                <p className='text-text-sm md:text-text-md font-medium -tracking-[3%]'>
                  {bookQuery.isLoading ? '...' : (book?.description ?? '-')}
                </p>
              </div>

              {/* Buttons (hidden on mobile) */}
              <div className='hidden md:flex md:gap-3'>
                <Button className='h-12 w-50' variant={'white'}>
                  Add to Cart
                </Button>
                <Button className='h-12 w-50'>Borrow Book</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className='h-px w-full bg-neutral-300'></div>

        {/* Reviews */}
        <div className='flex flex-col gap-4.5'>
          <div className='flex flex-col gap-1 md:gap-3'>
            <p className='text-display-xs md:text-display-lg font-bold md:tracking-normal'>
              Review
            </p>
            <div className='flex gap-1'>
              <Image
                src={'/icons/star-rating.svg'}
                alt='Rating'
                width={24}
                height={24}
              />
              <p className='text-text-md md:text-text-xl font-bold'>
                {bookQuery.isLoading
                  ? '...'
                  : `${Number(book?.rating ?? 0).toFixed(1)} (${book?.reviewCount ?? 0} Ulasan)`}
              </p>
            </div>
          </div>

          {/* Review card */}
          <div className='grid gap-4.5 md:grid-cols-2'>
            {reviewsQuery.isLoading
              ? Array.from({ length: limit }).map((_, i) => (
                  <ReviewCard
                    key={i}
                    reviewerName='John Doe'
                    reviewedAt='...'
                    rating={5}
                    reviewText='...'
                  />
                ))
              : reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    reviewerName={r.user.name}
                    reviewedAt={dayjs(r.createdAt).format(
                      'DD MMMM YYYY, HH:mm'
                    )}
                    rating={r.star}
                    reviewText={r.comment}
                  />
                ))}
          </div>

          <Button
            variant={'white'}
            className='h-10 w-37.5 self-center md:h-12 md:w-50'
            onClick={() => reviewsQuery.fetchNextPage()}
            disabled={
              !reviewsQuery.hasNextPage || reviewsQuery.isFetchingNextPage
            }
          >
            Load More
          </Button>
        </div>

        {/* Separator */}
        <div className='h-px w-full bg-neutral-300'></div>

        {/* Related Books */}
        <div className='flex flex-col gap-5 md:gap-10'>
          <h2 className='text-display-xs md:text-display-lg font-bold'>
            Related Books
          </h2>
          <RelatedBooks
            count={5}
            categoryId={book?.categoryId}
            excludeBookId={book?.id}
          />
        </div>
      </div>

      {/* Spacer khusus mobile agar konten tidak ketutup fixed bar */}
      <div className='h-24 md:hidden' />

      {/* Fixed bottom action bar (mobile only) */}
      <div className='fixed right-0 bottom-0 left-0 z-50 flex gap-3 bg-white p-4 shadow-[0px_0px_20px] shadow-[#cbcaca]/25 md:hidden'>
        <Button className='h-10 flex-1' variant={'white'}>
          Add to Cart
        </Button>
        <Button className='h-10 flex-1'>Borrow Book</Button>
      </div>
    </main>
  );
}
