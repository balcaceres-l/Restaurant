"use server";

import { db } from "@/db";
import { category } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategorias() {
  return await db.select().from(category).orderBy(desc(category.createdAt));
}

export async function createCategoria(data: { name: string; description?: string; imageBase64?: string; isActive: boolean }) {
  const result = await db.insert(category).values({
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description || "",
    imageBase64: data.imageBase64 || "",
    isActive: data.isActive,
    updatedAt: new Date(),
  });
  revalidatePath("/admin/categorias");
  return result;
}

export async function updateCategoria(id: string, data: Partial<{ name: string; description: string; imageBase64: string; isActive: boolean }>) {
  await db.update(category)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(category.id, id));
  revalidatePath("/admin/categorias");
}

export async function deleteCategoria(id: string) {
  await db.delete(category).where(eq(category.id, id));
  revalidatePath("/admin/categorias");
}