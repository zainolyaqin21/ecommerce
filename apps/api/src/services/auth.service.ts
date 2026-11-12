import { db, users, sessions } from "@ecommerce/db";
import { eq, and, gt } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Masa berlaku session (7 hari)
const SESSION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  /**
   * Register customer baru (role default selalu customer)
   */
  static async register(dto: RegisterDTO) {
    if (!dto.name || !dto.email || !dto.password) {
      throw new Error("Name, email, and password are required");
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email is already registered");
    }

    const hashedPassword = await Bun.password.hash(dto.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const [insertResult] = await db.insert(users).values({
      name: dto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer", // Role selalu dipaksa menjadi customer
    });

    return {
      id: Number(insertResult.insertId), // Konversi safe number untuk JSON serialization
      name: dto.name.trim(),
      email: normalizedEmail,
      role: "customer" as const,
    };
  }

  /**
   * Autentikasi user & buat session baru
   */
  static async login(dto: LoginDTO) {
    if (!dto.email || !dto.password) {
      throw new Error("Email and password are required");
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    // Pilih hanya kolom yang dibutuhkan dan amankan dari kebocoran yang tidak diinginkan
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await Bun.password.verify(dto.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // Buat session ID acak (32 bytes = 64 karakter hex)
    const sessionId = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_MS);

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    return {
      sessionId,
      expiresAt,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Ambil data user berdasarkan session token yang valid
   */
  static async validateSession(sessionId: string) {
    if (!sessionId) {
      return null;
    }

    const [record] = await db
      .select({
        sessionId: sessions.id,
        expiresAt: sessions.expiresAt,
        userId: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!record) {
      return null;
    }

    return {
      sessionId: record.sessionId,
      expiresAt: record.expiresAt,
      user: {
        id: Number(record.userId),
        name: record.name,
        email: record.email,
        role: record.role,
      },
    };
  }

  /**
   * Hapus session saat logout
   */
  static async logout(sessionId: string) {
    if (!sessionId) {
      return { success: true };
    }

    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return { success: true };
  }
}
