"use server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
export async function getUsuarios() {
  return await db.select().from(user).orderBy(desc(user.createdAt));
}
export async function toggleUserStatus(id: string, isBanned: boolean) {
  await db.update(user).set({ banned: isBanned }).where(eq(user.id, id));
  revalidatePath("/admin/usuarios");
}

export async function updateUsuario(id: string, data: { name: string; role: string }) {
  await db.update(user)
    .set({ 
      name: data.name, 
      role: data.role, 
      updatedAt: new Date() 
    })
    .where(eq(user.id, id));
    
  revalidatePath("/admin/usuarios");
}