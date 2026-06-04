"use server";

import { db } from "@/db";
import { product, category } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
export async function getProductos() {
  return await db
    .select({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      categoryName: category.name,
      categoryIsActive: category.isActive, 
      imageBase64: product.imageBase64,
      isActive: product.isActive,
      createdAt: product.createdAt,
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id))
    .orderBy(desc(product.createdAt));
}

export async function createProducto(data: { name: string; description?: string; price: string; categoryId: string; imageBase64?: string; isActive: boolean }) {
  await db.insert(product).values({
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description || "",
    price: data.price, 
    categoryId: data.categoryId,
    imageBase64: data.imageBase64 || "",
    isActive: data.isActive,
    updatedAt: new Date(),
  });
  
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function updateProducto(id: string, data: Partial<{ name: string; description: string; price: string; categoryId: string; imageBase64: string; isActive: boolean }>) {
  await db.update(product)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(product.id, id));
  
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function deleteProducto(id: string) {
  await db.delete(product).where(eq(product.id, id));
  revalidatePath("/admin/productos");
  return { success: true };
}