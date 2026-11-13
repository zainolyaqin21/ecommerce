import { db, products, categories } from "@ecommerce/db";
import { eq, like, and, desc, sql } from "drizzle-orm";

export interface GetProductsParams {
  categoryId?: number;
  search?: string;
}

export class ProductService {
  /**
   * Mengambil daftar produk (mendukung filter categoryId dan search nama produk)
   */
  static async getProducts(params?: GetProductsParams) {
    const conditions = [];

    if (params?.categoryId) {
      conditions.push(eq(products.categoryId, params.categoryId));
    }

    if (params?.search && params.search.trim() !== "") {
      conditions.push(like(products.name, `%${params.search.trim()}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(products.createdAt));

    return items;
  }

  /**
   * Mengambil detail satu produk berdasarkan slug
   */
  static async getProductBySlug(slug: string) {
    const [item] = await db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug.trim().toLowerCase()))
      .limit(1);

    return item || null;
  }

  /**
   * Menambahkan produk baru (khusus admin)
   */
  static async createProduct(data: {
    categoryId: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
  }) {
    const slug = data.slug.trim().toLowerCase();

    // Verifikasi kategori ada
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1);

    if (!cat) {
      throw new Error(`Category with ID ${data.categoryId} not found`);
    }

    // Verifikasi keunikan slug produk
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existing) {
      throw new Error(`Product with slug '${slug}' already exists`);
    }

    const [result] = await db.insert(products).values({
      categoryId: data.categoryId,
      name: data.name.trim(),
      slug,
      description: data.description || null,
      price: data.price,
      stock: data.stock,
      imageUrl: data.imageUrl || null,
    });

    return {
      id: Number(result.insertId),
      categoryId: data.categoryId,
      name: data.name.trim(),
      slug,
      price: data.price,
      stock: data.stock,
    };
  }

  /**
   * Mengubah sebagian kolom/harga/stok produk (khusus admin)
   */
  static async updateProduct(
    id: number,
    data: {
      categoryId?: number;
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      stock?: number;
      imageUrl?: string;
    }
  ) {
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      throw new Error(`Product with ID ${id} not found`);
    }

    if (data.categoryId) {
      const [cat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);

      if (!cat) {
        throw new Error(`Category with ID ${data.categoryId} not found`);
      }
    }

    if (data.slug && data.slug !== existing.slug) {
      const newSlug = data.slug.trim().toLowerCase();
      const [slugTaken] = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, newSlug))
        .limit(1);

      if (slugTaken) {
        throw new Error(`Product with slug '${newSlug}' already exists`);
      }
      data.slug = newSlug;
    }

    await db
      .update(products)
      .set({
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      })
      .where(eq(products.id, id));

    return {
      id,
      ...data,
    };
  }

  /**
   * Menghapus produk berdasarkan ID (khusus admin)
   */
  static async deleteProduct(id: number) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      throw new Error(`Product with ID ${id} not found`);
    }

    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  }
}
