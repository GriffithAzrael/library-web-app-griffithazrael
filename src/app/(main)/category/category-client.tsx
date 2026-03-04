'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/reusables/book-card';

type CategoryItem = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type CategoriesResponse = {
  success: boolean;
  message: string;
  data: {
    categories: CategoryItem[];
  };
};

type BookItem = {
  id: number;
  title: string;
  coverImage: string | null;
  rating: number;
  author?: { id: number; name: string } | null;
};

type BooksResponse = {
  success: boolean;
  message: string;
  data: {
    books: BookItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export default function Category() {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get('categoryId');

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  // Ambil categoryId dari URL: /category?categoryId=7
  useEffect(() => {
    if (!categoryIdParam) {
      setSelectedCategoryId(null);
      return;
    }

    const parsed = Number(categoryIdParam);
    if (!Number.isFinite(parsed)) return;

    setSelectedCategoryId(parsed);
  }, [categoryIdParam]);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      apiFetch<CategoriesResponse>('/api/categories', { method: 'GET' }),
  });

  const limit = 8;

  const booksQuery = useInfiniteQuery({
    queryKey: ['books', 'category-page', { selectedCategoryId, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams();
      qs.set('page', String(pageParam));
      qs.set('limit', String(limit));
      if (selectedCategoryId) qs.set('categoryId', String(selectedCategoryId));

      return apiFetch<BooksResponse>(`/api/books?${qs.toString()}`, {
        method: 'GET',
      });
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const categories = categoriesQuery.data?.data.categories ?? [];
  const books = booksQuery.data?.pages.flatMap((p) => p.data.books) ?? [];

  return (
    <main className='flex flex-col bg-white px-4 pt-20 pb-4 md:w-full md:px-30 md:pt-32 md:pb-24.25'>
      {/* Container */}
      <div className='flex flex-col gap-4 md:gap-8'>
        <h2 className='text-display-xs md:text-display-lg font-bold md:tracking-normal'>
          Book List
        </h2>

        {/* Filter menu button (mobile only) */}
        <div className='rounded-radius-xl flex w-full items-center justify-between bg-white p-3 shadow-[0px_0px_20px] shadow-[#cbcaca]/25 md:hidden'>
          <p className='text-text-sm font-extrabold'>FILTER</p>
          <Image
            src={'/icons/filter-lines.svg'}
            alt='Filter icon'
            width={20}
            height={20}
          />
        </div>

        {/* Books container with filter menu (desktop only) */}
        <div className='flex items-start md:gap-10'>
          {/* Filter menu (desktop only) */}
          <div className='md:rounded-radius-xl hidden md:flex md:min-h-fit md:min-w-66.5 md:flex-col md:gap-6 md:bg-white md:py-4 md:shadow-[0px_0px_20px] md:shadow-[#cbcaca]/25'>
            <div className='flex flex-col gap-2.5 px-4'>
              <p className='text-text-md font-extrabold'>FILTER</p>
              <p className='text-text-lg font-bold -tracking-[2%]'>Category</p>

              {categoriesQuery.isLoading ? (
                <>
                  <div className='flex items-center gap-2'>
                    <Image
                      src={'/icons/checkbox-off.svg'}
                      alt='Checkbox'
                      width={20}
                      height={20}
                    />
                    <p className='text-text-md font-medium -tracking-[3%]'>
                      ...
                    </p>
                  </div>
                </>
              ) : (
                categories.map((cat) => {
                  const active = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type='button'
                      className='flex items-center gap-2 text-left'
                      onClick={() =>
                        setSelectedCategoryId((prev) =>
                          prev === cat.id ? null : cat.id
                        )
                      }
                    >
                      <Image
                        src={
                          active
                            ? '/icons/checkbox-on.svg'
                            : '/icons/checkbox-off.svg'
                        }
                        alt='Checkbox'
                        width={20}
                        height={20}
                      />
                      <p className='text-text-md font-medium -tracking-[3%]'>
                        {cat.name}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Separator */}
            <div className='h-px w-full bg-neutral-300'></div>

            {/* Rating */}
            <div className='flex flex-col gap-2.5 px-4'>
              <p className='text-text-lg font-bold -tracking-[2%]'>Rating</p>
              <div className='flex flex-col'>
                {/* Rating 5 */}
                <div className='flex p-2'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src={'/icons/checkbox-off.svg'}
                      alt='Checkbox'
                      width={20}
                      height={20}
                    />
                    <div className='flex items-center gap-0.5'>
                      <Image
                        src={'/icons/star-rating.svg'}
                        alt='Rating'
                        width={24}
                        height={24}
                      />
                      <p className='text-text-md'>5</p>
                    </div>
                  </div>
                </div>

                {/* Rating 4 */}
                <div className='flex p-2'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src={'/icons/checkbox-off.svg'}
                      alt='Checkbox'
                      width={20}
                      height={20}
                    />
                    <div className='flex items-center gap-0.5'>
                      <Image
                        src={'/icons/star-rating.svg'}
                        alt='Rating'
                        width={24}
                        height={24}
                      />
                      <p className='text-text-md'>4</p>
                    </div>
                  </div>
                </div>

                {/* Rating 3 */}
                <div className='flex p-2'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src={'/icons/checkbox-off.svg'}
                      alt='Checkbox'
                      width={20}
                      height={20}
                    />
                    <div className='flex items-center gap-0.5'>
                      <Image
                        src={'/icons/star-rating.svg'}
                        alt='Rating'
                        width={24}
                        height={24}
                      />
                      <p className='text-text-md'>3</p>
                    </div>
                  </div>
                </div>

                {/* Rating 2 */}
                <div className='flex p-2'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src={'/icons/checkbox-off.svg'}
                      alt='Checkbox'
                      width={20}
                      height={20}
                    />
                    <div className='flex items-center gap-0.5'>
                      <Image
                        src={'/icons/star-rating.svg'}
                        alt='Rating'
                        width={24}
                        height={24}
                      />
                      <p className='text-text-md'>2</p>
                    </div>
                  </div>
                </div>

                {/* Rating 1 */}
                <div className='flex p-2'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src={'/icons/checkbox-off.svg'}
                      alt='Checkbox'
                      width={20}
                      height={20}
                    />
                    <div className='flex items-center gap-0.5'>
                      <Image
                        src={'/icons/star-rating.svg'}
                        alt='Rating'
                        width={24}
                        height={24}
                      />
                      <p className='text-text-md'>1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Book list */}
          <div className='flex flex-col gap-5 md:min-w-0 md:flex-1 md:gap-10'>
            <div className='grid w-full grid-cols-2 gap-4 md:max-w-219.75 md:grid-cols-4 md:gap-5'>
              {booksQuery.isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <BookCard
                      key={i}
                      title='Book Name'
                      authorName='Author name'
                      rating={4.9}
                      coverImage={null}
                    />
                  ))
                : books.map((b) => (
                    <Link
                      key={b.id}
                      href={`/books/${b.id}`}
                      className='block w-full'
                    >
                      <BookCard
                        title={b.title}
                        authorName={b.author?.name ?? 'Author name'}
                        rating={b.rating}
                        coverImage={b.coverImage}
                      />
                    </Link>
                  ))}
            </div>

            {booksQuery.hasNextPage && (
              <Button
                variant={'white'}
                className='h-10 w-37.5 self-center md:h-12 md:w-50'
                onClick={() => booksQuery.fetchNextPage()}
                disabled={booksQuery.isFetchingNextPage}
              >
                Load More
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
