import Link from 'next/link';
import { CategoryCard } from '@/components/reusables/category-card';
import { RecommendedBooks } from '@/components/reusables/recommended-books';
import { PopularAuthorsCards } from '@/components/reusables/popular-authors-cards';
import { HeroCarousel } from '@/components/reusables/hero-carousel';

const categories = [
  { title: 'Fiction', iconSrc: '/icons/fiction-icon.png' },
  {
    title: 'Non-Fiction',
    iconSrc: '/icons/non-fiction-icon.png',
    iconAlt: 'Non-fiction',
  },
  {
    title: 'Self-Improvement',
    iconSrc: '/icons/self-improvement-icon.png',
    iconAlt: 'Self-improvement',
  },
  { title: 'Finance', iconSrc: '/icons/finance-icon.png' },
  { title: 'Science', iconSrc: '/icons/science-icon.png' },
  { title: 'Education', iconSrc: '/icons/education-icon.png' },
];

type CategoriesResponse = {
  success: boolean;
  message: string;
  data: {
    categories: Array<{ id: number; name: string }>;
  };
};

function normalizeCategoryName(s: string) {
  return s.toLowerCase().replace(/[\s-_]/g, '');
}

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  let categoryIdByName = new Map<string, number>();

  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/categories`, {
        cache: 'no-store',
      });
      const json = (await res.json()) as CategoriesResponse;

      if (res.ok && json?.success) {
        categoryIdByName = new Map(
          json.data.categories.map((c) => [normalizeCategoryName(c.name), c.id])
        );
      }
    } catch {
      // fallback
    }
  }

  return (
    <main className='flex flex-col gap-6 px-4 pt-20 pb-4 md:px-30 md:pt-32 md:pb-29'>
      {/* Hero */}
      <section className='flex flex-col gap-6 md:gap-12'>
        <div className='flex flex-col gap-6 md:gap-12'>
          {/* Carousel (interactive) */}
          <HeroCarousel />

          {/* Category cards */}
          <div className='grid grid-cols-3 gap-3 md:flex md:w-full md:grid-cols-none md:justify-between md:gap-4'>
            {categories.map((cat) => {
              const categoryId = categoryIdByName.get(
                normalizeCategoryName(cat.title)
              );
              const href = categoryId
                ? `/category?categoryId=${categoryId}`
                : '/category';

              return (
                <Link key={cat.title} href={href} className='block w-full'>
                  <CategoryCard {...cat} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recommendation */}
      <section className='flex flex-col gap-5 md:gap-10'>
        <h2 className='text-display-xs md:text-display-lg font-bold'>
          Recommendation
        </h2>

        <RecommendedBooks />
      </section>

      {/* Separator */}
      <div className='h-px w-full bg-neutral-300'></div>

      {/* Popular Authors */}
      <section className='flex flex-col gap-6 md:gap-12'>
        <h2 className='text-display-xs md:text-display-lg font-bold'>
          Popular Authors
        </h2>

        <div className='flex flex-col gap-4 md:flex-row md:gap-5'>
          <PopularAuthorsCards />
        </div>
      </section>
    </main>
  );
}
