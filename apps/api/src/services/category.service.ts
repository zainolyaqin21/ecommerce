import { db, categories } from "@ecommerce/db";
import { eq, desc } from "drizzle-orm";

export class CategoryService {
  /**
   * Mengambil semua kategori
   */
  static async getAllCategories() {
    return db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        createdAt: categories.createdAt,
      })
      .from(categories)
      .orderBy(desc(categories.createdAt));
  }

  /**
   * Mengambil kategori berdasarkan ID
   */
  static async getCategoryById(id: number) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return category || null;
  }

  /**
   * Menambahkan kategori baru (validasi keunikan slug)
   */
  static async createCategory(data: { name: string; slug: string }) {
    const slug = data.slug.trim().toLowerCase();
    const name = data.name.trim();

    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existing) {
      throw new Error(`Category with slug '${slug}' already exists`);
    }

    const [result] = await db.insert(categories).values({
      name,
      slug,
    });

    return {
      id: Number(result.insertId),
      name,
      slug,
    };
  }

  /**
   * Menghapus kategori berdasarkan ID
   */
  static async deleteCategory(id: number) {
    const category = await this.getCategoryById(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }

    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  }
}
