'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { RelatedBookCard } from '@/components/reusables/related-book-card';

type RelatedBooksProps = {
  count?: number;
  categoryId?: number;
  authorId?: number;
  excludeBookId?: number;
};

type ApiBook = {
  id: number;
  title: string;
  coverImage: string | null;
  rating: number;
  author?: { id: number; name: string; bio?: string | null };
  category?: { id: number; name: string };
  categoryId: number;
  authorId: number;
};

type BooksListResponse = {
  success: boolean;
  message: string;
  data: {
    books: ApiBook[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export function RelatedBooks({
  count = 5,
  categoryId,
  authorId,
  excludeBookId,
}: RelatedBooksProps) {
  const enabled =
    typeof categoryId === 'number' || typeof authorId === 'number';

  const query = useQuery({
    queryKey: [
      'books',
      'related',
      { categoryId, authorId, excludeBookId, count },
    ],
    enabled,
    queryFn: async () => {
      // request sedikit lebih banyak supaya setelah excludeBookId tetap bisa dapat 5
      const limit = count + 1;
      const page = 1;

      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('limit', String(limit));

      if (typeof categoryId === 'number')
        qs.set('categoryId', String(categoryId));
      if (typeof authorId === 'number') qs.set('authorId', String(authorId));

      return apiFetch<BooksListResponse>(`/api/books?${qs.toString()}`, {
        method: 'GET',
      });
    },
  });

  const books = (query.data?.data.books ?? [])
    .filter((b) => (excludeBookId ? b.id !== excludeBookId : true))
    .slice(0, count);

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5'>
      {query.isLoading || !enabled
        ? Array.from({ length: count }).map((_, idx) => (
            <RelatedBookCard
              key={idx}
              title='Book Name'
              authorName='Author name'
              rating={4.9}
            />
          ))
        : books.map((b) => (
            <Link key={b.id} href={`/books/${b.id}`} className='block'>
              <RelatedBookCard
                title={b.title}
                authorName={b.author?.name ?? 'Author name'}
                rating={b.rating}
                coverSrc={
                  b.coverImage && !b.coverImage.startsWith('blob:')
                    ? b.coverImage
                    : '/images/book-cover-placeholder.png'
                }
              />
            </Link>
          ))}
    </div>
  );
}
