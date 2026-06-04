// db/schema.ts
import { mysqlTable, varchar, timestamp, boolean, text, int, bigint, decimal  } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
export const user = mysqlTable("user", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    role: varchar("role", { length: 20 }), 
    banned: boolean("banned"),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires"),
});

export const session = mysqlTable("session", {
    id: varchar("id", { length: 36 }).primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: varchar("userId", { length: 36 }).notNull().references(() => user.id),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

export const account = mysqlTable("account", {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: varchar("userId", { length: 36 }).notNull().references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    expiresAt: timestamp("expiresAt"),
    password: text("password"),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

export const verification = mysqlTable("verification", {
    id: varchar("id", { length: 36 }).primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

export const rateLimit = mysqlTable("rateLimit", {
    id: varchar("id", { length: 36 }).primaryKey(),
    key: text("key").notNull(),
    count: int("count").notNull(),
    lastRequest: bigint("lastRequest", { mode: "number" }).notNull(),
});
export const category = mysqlTable("category", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    imageBase64: text("imageBase64"), 
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
export const product = mysqlTable("product", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    categoryId: varchar("categoryId", { length: 36 }).notNull().references(() => category.id, { onDelete: "cascade" }),
    imageBase64: text("imageBase64"), 
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});