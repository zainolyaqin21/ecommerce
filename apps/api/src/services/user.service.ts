import { db, users } from "@ecommerce/db";

export class UserService {
  static async getAllUsers() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users);
  }
}
