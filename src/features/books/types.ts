export type Book = {
  id: number;
  title: string;
  description: string | null;
  isbn: string;
  publishedYear: number | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  authorId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
};

export type RecommendBooksResponse = {
  success: boolean;
  message: string;
  data: {
    mode: string; // biasanya "rating"
    books: Book[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type BookListItem = {
  id: number;
  title: string;
  coverImage: string | null;
  rating: number;
  author?: { id: number; name: string } | null;
};
