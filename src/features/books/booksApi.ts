import { apiFetch } from '@/lib/api';
import type { RecommendBooksResponse } from './types';

type GetRecommendParams = {
  by?: 'rating';
  page?: number;
  limit?: number;
  categoryId?: number;
};

export function getRecommendedBooks(params: GetRecommendParams = {}) {
  const { by = 'rating', page = 1, limit = 8, categoryId } = params;

  const qs = new URLSearchParams();
  qs.set('by', by);
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (typeof categoryId === 'number') qs.set('categoryId', String(categoryId));

  return apiFetch<RecommendBooksResponse>(
    `/api/books/recommend?${qs.toString()}`,
    {
      method: 'GET',
    }
  );
}
