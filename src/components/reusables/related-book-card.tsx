import { BookCard } from '@/components/reusables/book-card';

type RelatedBookCardProps = {
  title: string;
  authorName: string;
  rating: number;
  coverSrc?: string;
};

export function RelatedBookCard({
  title,
  authorName,
  rating,
  coverSrc = '/images/book-cover-placeholder.png',
}: RelatedBookCardProps) {
  return (
    <BookCard
      coverVariant='aspect'
      title={title}
      authorName={authorName}
      rating={rating}
      coverImage={coverSrc}
      titleClassName='truncate font-bold -tracking-[3%]'
      authorClassName='truncate font-medium -tracking-[3%]'
    />
  );
}
