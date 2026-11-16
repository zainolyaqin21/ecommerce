import { Elysia, t } from "elysia";
import { ProductService } from "../services/product.service";
import { requireAdmin } from "../middlewares/auth.middleware";

const variantSchema = t.Object({
  id: t.Optional(t.Numeric()),
  sku: t.String({ minLength: 1, description: "Unique variant SKU" }),
  name: t.String({ minLength: 1, description: "Variant name (e.g. Red - XL)" }),
  price: t.Numeric({ minimum: 0, description: "Variant price" }),
  stock: t.Numeric({ minimum: 0, description: "Variant stock" }),
  attributes: t.Optional(t.Record(t.String(), t.String())),
  imageUrl: t.Optional(t.String()),
});

export const productRoutes = new Elysia({ prefix: "/products" })
  /**
   * GET /products
   * Publik: Ambil daftar produk dengan query filter opsional categoryId dan search
   */
  .get(
    "",
    async ({ query }) => {
      const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
      const search = query.search;

      const items = await ProductService.getProducts({
        categoryId,
        search,
      });

      return {
        success: true,
        data: items,
      };
    },
    {
      query: t.Object({
        categoryId: t.Optional(t.Numeric({ description: "Filter by category ID" })),
        search: t.Optional(t.String({ description: "Search by product name" })),
      }),
      detail: {
        tags: ["Products"],
        summary: "Get products list with optional category and search filters (Public)",
      },
    }
  )

  /**
   * POST /products
   * Khusus Admin: Tambah produk baru beserta varian
   */
  .post(
    "",
    async ({ body, cookie: { sessionId }, headers, set }) => {
      const auth = await requireAdmin(sessionId.value, headers.authorization);
      if (!auth.isAdmin) {
        set.status = auth.status;
        return {
          success: false,
          error: auth.error,
        };
      }

      try {
        const newProduct = await ProductService.createProduct({
          categoryId: Number(body.categoryId),
          name: body.name,
          slug: body.slug,
          description: body.description,
          price: Number(body.price),
          stock: Number(body.stock ?? 0),
          imageUrl: body.imageUrl,
          variants: body.variants ? body.variants.map((v) => ({
            ...v,
            price: Number(v.price),
            stock: Number(v.stock),
          })) : undefined,
        });

        set.status = 201;
        return {
          success: true,
          message: "Product created successfully",
          data: newProduct,
        };
      } catch (err: any) {
        set.status = 400;
        return {
          success: false,
          error: err?.message || "Failed to create product",
        };
      }
    },
    {
      body: t.Object({
        categoryId: t.Numeric({ description: "Category ID" }),
        name: t.String({ minLength: 2, description: "Product name" }),
        slug: t.String({ minLength: 2, description: "URL-friendly slug" }),
        description: t.Optional(t.String({ description: "Product description" })),
        price: t.Numeric({ minimum: 0, description: "Product price in integer/cents" }),
        stock: t.Optional(t.Numeric({ minimum: 0, description: "Initial stock count" })),
        imageUrl: t.Optional(t.String({ description: "Product image URL" })),
        variants: t.Optional(t.Array(variantSchema)),
      }),
      detail: {
        tags: ["Products"],
        summary: "Create a new product with optional variants (Admin only)",
      },
    }
  )

  /**
   * GET /products/id/:id
   */
  .get(
    "/id/:id",
    async ({ params: { id }, set }) => {
      const product = await ProductService.getProductById(Number(id));

      if (!product) {
        set.status = 404;
        return {
          success: false,
          error: `Product with ID '${id}' not found`,
        };
      }

      return {
        success: true,
        data: product,
      };
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Product numeric ID" }),
      }),
      detail: {
        tags: ["Products"],
        summary: "Get single product by ID (Public/Admin)",
      },
    }
  )

  /**
   * PATCH /products/id/:id
   */
  .patch(
    "/id/:id",
    async ({ params: { id }, body, cookie: { sessionId }, headers, set }) => {
      const auth = await requireAdmin(sessionId.value, headers.authorization);
      if (!auth.isAdmin) {
        set.status = auth.status;
        return {
          success: false,
          error: auth.error,
        };
      }

      try {
        const updated = await ProductService.updateProduct(Number(id), {
          categoryId: body.categoryId !== undefined ? Number(body.categoryId) : undefined,
          name: body.name,
          slug: body.slug,
          description: body.description,
          price: body.price !== undefined ? Number(body.price) : undefined,
          stock: body.stock !== undefined ? Number(body.stock) : undefined,
          imageUrl: body.imageUrl,
          variants: body.variants ? body.variants.map((v) => ({
            ...v,
            price: Number(v.price),
            stock: Number(v.stock),
          })) : undefined,
        });

        return {
          success: true,
          message: "Product updated successfully",
          data: updated,
        };
      } catch (err: any) {
        set.status = 400;
        return {
          success: false,
          error: err?.message || "Failed to update product",
        };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Product ID" }),
      }),
      body: t.Object({
        categoryId: t.Optional(t.Numeric({ description: "Category ID" })),
        name: t.Optional(t.String({ minLength: 2, description: "Product name" })),
        slug: t.Optional(t.String({ minLength: 2, description: "URL-friendly slug" })),
        description: t.Optional(t.String({ description: "Product description" })),
        price: t.Optional(t.Numeric({ minimum: 0, description: "Product price" })),
        stock: t.Optional(t.Numeric({ minimum: 0, description: "Stock count" })),
        imageUrl: t.Optional(t.String({ description: "Product image URL" })),
        variants: t.Optional(t.Array(variantSchema)),
      }),
      detail: {
        tags: ["Products"],
        summary: "Update product and variants by ID (Admin only)",
      },
    }
  )

  /**
   * DELETE /products/id/:id
   */
  .delete(
    "/id/:id",
    async ({ params: { id }, cookie: { sessionId }, headers, set }) => {
      const auth = await requireAdmin(sessionId.value, headers.authorization);
      if (!auth.isAdmin) {
        set.status = auth.status;
        return {
          success: false,
          error: auth.error,
        };
      }

      try {
        await ProductService.deleteProduct(Number(id));
        return {
          success: true,
          message: "Product deleted successfully",
        };
      } catch (err: any) {
        set.status = 400;
        return {
          success: false,
          error: err?.message || "Failed to delete product",
        };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Product ID" }),
      }),
      detail: {
        tags: ["Products"],
        summary: "Delete product by ID (Admin only)",
      },
    }
  )

  /**
   * GET /products/slug/:slug
   * Publik: Ambil detail satu produk berdasarkan slug (termasuk varian)
   */
  .get(
    "/slug/:slug",
    async ({ params: { slug }, set }) => {
      const product = await ProductService.getProductBySlug(slug);

      if (!product) {
        set.status = 404;
        return {
          success: false,
          error: `Product with slug '${slug}' not found`,
        };
      }

      return {
        success: true,
        data: product,
      };
    },
    {
      params: t.Object({
        slug: t.String({ description: "Product slug" }),
      }),
      detail: {
        tags: ["Products"],
        summary: "Get single product by slug (Public)",
      },
    }
  );
