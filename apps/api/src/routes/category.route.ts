import { Elysia, t } from "elysia";
import { CategoryService } from "../services/category.service";
import { requireAdmin } from "../middlewares/auth.middleware";

export const categoryRoutes = new Elysia({ prefix: "/categories" })
  /**
   * GET /categories
   * Publik: Ambil semua kategori
   */
  .get(
    "",
    async () => {
      const items = await CategoryService.getAllCategories();
      return {
        success: true,
        data: items,
      };
    },
    {
      detail: {
        tags: ["Categories"],
        summary: "Get all categories (Public)",
      },
    }
  )

  /**
   * POST /categories
   * Khusus Admin: Tambah kategori baru
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
        const newCategory = await CategoryService.createCategory({
          name: body.name,
          slug: body.slug,
        });

        set.status = 201;
        return {
          success: true,
          message: "Category created successfully",
          data: newCategory,
        };
      } catch (err: any) {
        set.status = 400;
        return {
          success: false,
          error: err?.message || "Failed to create category",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2, description: "Category name" }),
        slug: t.String({ minLength: 2, description: "URL-friendly slug" }),
      }),
      detail: {
        tags: ["Categories"],
        summary: "Create a new category (Admin only)",
      },
    }
  )

  /**
   * DELETE /categories/:id
   * Khusus Admin: Hapus kategori
   */
  .delete(
    "/:id",
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
        await CategoryService.deleteCategory(Number(id));
        return {
          success: true,
          message: "Category deleted successfully",
        };
      } catch (err: any) {
        set.status = 400;
        return {
          success: false,
          error: err?.message || "Failed to delete category",
        };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "Category ID" }),
      }),
      detail: {
        tags: ["Categories"],
        summary: "Delete category by ID (Admin only)",
      },
    }
  );
