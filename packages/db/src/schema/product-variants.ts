import { mysqlTable, serial, bigint, varchar, text, int, timestamp, json } from "drizzle-orm/mysql-core";
import { products } from "./products";

export const productVariants = mysqlTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  price: int("price").notNull(),
  stock: int("stock").default(0).notNull(),
  attributes: json("attributes").$type<Record<string, string>>(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

