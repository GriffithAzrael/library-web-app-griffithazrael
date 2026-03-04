import { Suspense } from 'react';
import CategoryClient from './category-client';

export default function CategoryPage() {
  return (
    <Suspense fallback={null}>
      <CategoryClient />
    </Suspense>
  );
}
