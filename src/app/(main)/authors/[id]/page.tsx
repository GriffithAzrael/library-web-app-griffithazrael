'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { AuthorBookCard } from '@/components/reusables/author-book-card';
import { Button } from '@/components/ui/button';

type Author = {
  id: number;
  name: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuthorBook = {
  id: number;
  title: string;
  coverImage: string | null;
  rating: number;
  author?: { id: number; name: string };
};

type BooksByAuthorResponse = {
  success: boolean;
  message: string;
  data: {
    author: Author;
    books: AuthorBook[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export default function BookByAuthor() {
  const params = useParams<{ id: string }>();
  const authorId = Number(params.id);

  const limit = 12;

  const booksQuery = useInfiniteQuery({
    queryKey: ['authors', authorId, 'books', { limit }],
    enabled: Number.isFinite(authorId),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiFetch<BooksByAuthorResponse>(
        `/api/authors/${authorId}/books?page=${Number(pageParam)}&limit=${limit}`,
        { method: 'GET' }
      ),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const firstPage = booksQuery.data?.pages?.[0];
  const author = firstPage?.data.author;

  const totalBooks =
    firstPage?.data.pagination.total ?? firstPage?.data.books.length ?? 0;

  const books =
    booksQuery.data?.pages
      .flatMap((p) => p.data.books)
      // jaga-jaga jika API mengulang data
      .filter((b, idx, arr) => arr.findIndex((x) => x.id === b.id) === idx) ??
    [];

  return (
    <main className='flex flex-col bg-white px-4 pt-20 pb-10 md:w-full md:px-30 md:pt-32 md:pb-27.5'>
      {/* Container */}
      <div className='flex flex-col gap-4 md:gap-10'>
        {/* Author card */}
        <div className='rounded-radius-2xl flex w-full items-center gap-3 bg-white p-3 shadow-[0px_0px_20px] shadow-[#cbcaca]/25 md:gap-4 md:p-4'>
          <Image
            src={'/images/placeholder-profile-pic.png'}
            alt='Author profile picture'
            width={81}
            height={81}
            className='size-15 rounded-full md:size-20.25'
          />
          <div className='flex flex-col gap-0.5'>
            <p className='text-text-md font-bold'>
              {booksQuery.isLoading ? '...' : (author?.name ?? 'Author name')}
            </p>
            <div className='flex gap-1.5'>
              <Image
                src={'/icons/book-icon.svg'}
                alt='Author profile picture'
                width={24}
                height={24}
              />
              <p className='text-text-sm md:text-text-md font-medium -tracking-[3%]'>
                {booksQuery.isLoading ? '...' : `${totalBooks} books`}
              </p>
            </div>
          </div>
        </div>

        {/* Book List */}
        <div className='flex flex-col gap-4 md:gap-8'>
          <h2 className='text-display-xs md:text-display-lg font-bold'>
            Book List
          </h2>

          {/* Author's books cards */}
          <div className='grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5'>
            {booksQuery.isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <AuthorBookCard
                    key={i}
                    title='Book Name'
                    authorName='Author name'
                    rating={4.9}
                    coverImage={null}
                  />
                ))
              : books.map((b) => (
                  <Link key={b.id} href={`/books/${b.id}`} className='block'>
                    <AuthorBookCard
                      title={b.title}
                      authorName={
                        b.author?.name ?? author?.name ?? 'Author name'
                      }
                      rating={b.rating}
                      coverImage={b.coverImage}
                    />
                  </Link>
                ))}
          </div>

          {/* Load More: muncul hanya jika masih ada page berikutnya */}
          {booksQuery.hasNextPage && (
            <div className='flex justify-center'>
              <Button
                variant={'white'}
                className='h-10 w-37.5 self-center md:h-12 md:w-50'
                onClick={() => booksQuery.fetchNextPage()}
                disabled={booksQuery.isFetchingNextPage}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
