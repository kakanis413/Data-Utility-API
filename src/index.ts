import { z } from "zod";

// Health Check Schema
export const HealthCheckResponse = z.object({
  status: z.string()
});

// Book Schemas
export const Book = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  genre: z.string().nullable(),
  status: z.enum(["want_to_read", "reading", "finished", "abandoned"]),
  rating: z.number().int().min(1).max(5).nullable(),
  notes: z.string().nullable(),
  pageCount: z.number().nullable(),
  publishedYear: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateBookBody = Book.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateBookBody = CreateBookBody.partial();
export const RateBookBody = z.object({ rating: z.number().int().min(1).max(5) });

// Parameter Schemas
export const GetBookParams = z.object({ id: z.coerce.number() });
export const UpdateBookParams = GetBookParams;
export const DeleteBookParams = GetBookParams;
export const RateBookParams = GetBookParams;

// Response Schemas
export const ListBooksResponse = z.array(Book);
export const GetBookResponse = Book;
export const UpdateBookResponse = Book;
export const RateBookResponse = Book;

// Stats Schemas
export const GetReadingStatsResponse = z.object({
  totalBooks: z.number(),
  wantToRead: z.number(),
  reading: z.number(),
  finished: z.number(),
  abandoned: z.number(),
  averageRating: z.number().nullable(),
});

export const GetGenreBreakdownResponse = z.array(z.object({
  genre: z.string(),
  count: z.number(),
}));
