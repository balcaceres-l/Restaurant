"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { restaurantTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants/roles";
import { TABLE_STATUS, TABLE_STATUS_LIST } from "@/lib/constants/tables";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireSession(allowedRoles?: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("No autorizado");
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role ?? "")) {
    throw new Error("Acceso denegado para tu rol");
  }
  return session;
}

export async function getMesas() {
  await requireSession([ROLES.ADMIN, ROLES.CAJERO]);
  return await db.select().from(restaurantTable).orderBy(asc(restaurantTable.number));
}

export async function getMesasDisponibles() {
  await requireSession([ROLES.ADMIN, ROLES.CAJERO]);
  return await db
    .select()
    .from(restaurantTable)
    .where(eq(restaurantTable.isActive, true))
    .orderBy(asc(restaurantTable.number));
}

export async function createMesa(data: { number: number; capacity: number }) {
  await requireSession([ROLES.ADMIN]);

  if (!data.number || data.number < 1) {
    return { success: false, error: "Número de mesa inválido" };
  }

  const existing = await db
    .select()
    .from(restaurantTable)
    .where(eq(restaurantTable.number, data.number));

  if (existing.length > 0) {
    return { success: false, error: `La mesa ${data.number} ya existe` };
  }

  await db.insert(restaurantTable).values({
    id: crypto.randomUUID(),
    number: data.number,
    capacity: Math.max(1, data.capacity),
    status: TABLE_STATUS.LIBRE,
    isActive: true,
    updatedAt: new Date(),
  });

  revalidatePath("/admin/mesas");
  return { success: true };
}

export async function updateMesa(
  id: string,
  data: Partial<{ number: number; capacity: number; isActive: boolean }>
) {
  await requireSession([ROLES.ADMIN]);

  await db
    .update(restaurantTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(restaurantTable.id, id));

  revalidatePath("/admin/mesas");
  return { success: true };
}

export async function deleteMesa(id: string) {
  await requireSession([ROLES.ADMIN]);
  await db.delete(restaurantTable).where(eq(restaurantTable.id, id));
  revalidatePath("/admin/mesas");
  return { success: true };
}

export async function setMesaStatus(id: string, status: string) {
  await requireSession([ROLES.ADMIN, ROLES.CAJERO]);

  if (!TABLE_STATUS_LIST.includes(status)) {
    return { success: false, error: "Estado de mesa inválido" };
  }

  await db
    .update(restaurantTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(restaurantTable.id, id));

  revalidatePath("/admin/mesas");
  revalidatePath("/caja");
  return { success: true };
}
