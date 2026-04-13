import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, booksTable } from "@workspace/db";
import {
  CreateBookBody, UpdateBookBody, RateBookBody,
  GetBookParams, UpdateBookParams, DeleteBookParams, RateBookParams,
  ListBooksResponse, GetBookResponse, UpdateBookResponse, RateBookResponse,
  GetReadingStatsResponse, GetGenreBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /books — list all, filter by ?status= or ?genre=
router.get("/books", async (req, res): Promise<void> => {
  const { status, genre } = req.query;
  let query = db.select().from(booksTable).$dynamic();
  if (typeof status === "string") query = query.where(eq(booksTable.status, status));
  else if (typeof genre === "string") query = query.where(eq(booksTable.genre, genre));
  res.json(ListBooksResponse.parse(await query.orderBy(booksTable.createdAt)));
});

// POST /books — create
router.post("/books", async (req, res): Promise<void> => {
  const parsed = CreateBookBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [book] = await db.insert(booksTable).values(parsed.data).returning();
  res.status(201).json(GetBookResponse.parse(book));
});

// GET /books/:id
router.get("/books/:id", async (req, res): Promise<void> => {
  const params = GetBookParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, params.data.id));
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  res.json(GetBookResponse.parse(book));
});

// PATCH /books/:id — update
router.patch("/books/:id", async (req, res): Promise<void> => {
  const params = UpdateBookParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateBookBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [book] = await db.update(booksTable).set(parsed.data).where(eq(booksTable.id, params.data.id)).returning();
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  res.json(UpdateBookResponse.parse(book));
});

// DELETE /books/:id
router.delete("/books/:id", async (req, res): Promise<void> => {
  const params = DeleteBookParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [book] = await db.delete(booksTable).where(eq(booksTable.id, params.data.id)).returning();
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  res.sendStatus(204);
});

// PATCH /books/:id/rating — rate 1-5
router.patch("/books/:id/rating", async (req, res): Promise<void> => {
  const params = RateBookParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = RateBookBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [book] = await db.update(booksTable).set({ rating: parsed.data.rating }).where(eq(booksTable.id, params.data.id)).returning();
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  res.json(RateBookResponse.parse(book));
});

// GET /stats
router.get("/stats", async (_req, res): Promise<void> => {
  const books = await db.select().from(booksTable);
  const ratedBooks = books.filter((b) => b.rating != null);
  res.json(GetReadingStatsResponse.parse({
    totalBooks: books.length,
    wantToRead: books.filter((b) => b.status === "want_to_read").length,
    reading: books.filter((b) => b.status === "reading").length,
    finished: books.filter((b) => b.status === "finished").length,
    abandoned: books.filter((b) => b.status === "abandoned").length,
    averageRating: ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating ?? 0), 0) / ratedBooks.length
      : null,
  }));
});

// GET /stats/genres
router.get("/stats/genres", async (_req, res): Promise<void> => {
  const result = await db
    .select({ genre: booksTable.genre, count: sql<number>`cast(count(*) as integer)` })
    .from(booksTable)
    .where(sql`${booksTable.genre} is not null`)
    .groupBy(booksTable.genre)
    .orderBy(sql`count(*) desc`);
  res.json(GetGenreBreakdownResponse.parse(
    result.filter((r): r is { genre: string; count: number } => r.genre !== null)
  ));
});

export default router;