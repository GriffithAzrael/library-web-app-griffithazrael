'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { PopularAuthorCard } from '@/components/reusables/popular-author-card';

type PopularAuthor = {
  id: number;
  name: string;
  bio: string | null;
  bookCount: number;
  accumulatedScore: number;
};

type PopularAuthorsResponse = {
  success: boolean;
  message: string;
  data: {
    authors: PopularAuthor[];
  };
};

async function getPopularAuthors(limit: number) {
  return apiFetch<PopularAuthorsResponse>(
    `/api/authors/popular?limit=${limit}`,
    {
      method: 'GET',
    }
  );
}

export function PopularAuthorsCards() {
  // supaya tetap aman untuk layout md:flex-row (tidak wrap)
  const limit = 4;

  const query = useQuery({
    queryKey: ['authors', 'popular', { limit }],
    queryFn: () => getPopularAuthors(limit),
  });

  if (query.isLoading) {
    // placeholder cards
    return Array.from({ length: limit }).map((_, i) => (
      <PopularAuthorCard key={i} name='Author name' bookCount={5} />
    ));
  }

  if (query.isError) {
    // kalau error, tetap render placeholder agar layout tidak berubah
    return Array.from({ length: limit }).map((_, i) => (
      <PopularAuthorCard key={i} name='Author name' bookCount={5} />
    ));
  }

  const authors = query.data?.data.authors ?? [];

  return (
    <>
      {authors.map((a) => (
        <Link key={a.id} href={`/authors/${a.id}`} className='block w-full'>
          <PopularAuthorCard name={a.name} bookCount={a.bookCount} />
        </Link>
      ))}
    </>
  );
}
