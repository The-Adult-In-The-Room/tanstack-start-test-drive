import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const loresTable = pgTable('lores', {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar({ length: 255 }).notNull(),
  subtitle: varchar({ length: 255 }).notNull().default('N/A'),
  game: varchar({ length: 255 }).notNull().default('N/A'),
  text: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Lore = typeof loresTable.$inferSelect
export type NewLore = typeof loresTable.$inferInsert
