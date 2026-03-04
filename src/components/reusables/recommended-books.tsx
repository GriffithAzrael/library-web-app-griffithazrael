'use client';

import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { RecommendedBookCard } from '@/components/reusables/recommended-book-card';

type RecommendBook = {
  id: number;
  title: string;
  coverImage: string | null;
  rating: number;
  author?: {
    id: number;
    name: string;
  };
};

type RecommendResponse = {
  success: boolean;
  message: string;
  data: {
    mode: 'rating' | string;
    books: RecommendBook[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

async function getRecommendedBooks(page: number, limit: number) {
  return apiFetch<RecommendResponse>(
    `/api/books/recommend?page=${page}&limit=${limit}`,
    { method: 'GET' }
  );
}

export function RecommendedBooks() {
  const limit = 10;

  const query = useInfiniteQuery({
    queryKey: ['books', 'recommend', { mode: 'rating', limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getRecommendedBooks(Number(pageParam), limit),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const books = query.data?.pages.flatMap((p) => p.data.books) ?? [];

  return (
    <>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5'>
        {query.isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <RecommendedBookCard
                key={i}
                title='Book Name'
                authorName='Author name'
                rating={4.9}
                coverImage={null}
              />
            ))
          : books.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`} className='block'>
                <RecommendedBookCard
                  title={book.title}
                  authorName={book.author?.name ?? 'Author name'}
                  rating={book.rating}
                  coverImage={book.coverImage}
                />
              </Link>
            ))}
      </div>

      <div className='flex justify-center'>
        <Button
          className='text-text-sm md:text-text-md h-10 w-37.5 md:h-12 md:w-50'
          variant={'white'}
          onClick={() => query.fetchNextPage()}
          disabled={!query.hasNextPage || query.isFetchingNextPage}
        >
          Load More
        </Button>
      </div>
    </>
  );
}
