import { BookCard } from '@/components/reusables/book-card';

type AuthorBookCardProps = {
  title: string;
  authorName: string;
  rating: number;
  coverImage: string | null;
};

export function AuthorBookCard({
  title,
  authorName,
  rating,
  coverImage,
}: AuthorBookCardProps) {
  return (
    <BookCard
      coverVariant='aspect'
      title={title}
      authorName={authorName}
      rating={rating}
      coverImage={coverImage}
      titleClassName='truncate font-bold -tracking-[3%]'
      authorClassName='truncate font-medium -tracking-[3%]'
    />
  );
}
