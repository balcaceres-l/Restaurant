"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { order, orderDetail, product, restaurantTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ORDER_STATUS, ORDER_STATUS_LIST, DELIVERY_TYPE, DELIVERY_TYPE_LIST } from "@/lib/constants/orders";
import { ROLES } from "@/lib/constants/roles";
import { PAYMENT_METHOD_LIST, PAYMENT_STATUS, TABLE_STATUS } from "@/lib/constants/tables";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
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

export async function createOrder(data: {
  deliveryType: string;
  items: { productId: string; quantity: number }[];
  tableId?: string | null;
}) {
  const session = await requireSession([ROLES.CAJERO, ROLES.ADMIN]);

  if (!DELIVERY_TYPE_LIST.includes(data.deliveryType)) {
    return { success: false, error: "Tipo de entrega inválido" };
  }
  if (!data.items?.length) {
    return { success: false, error: "El pedido no tiene productos" };
  }

  let tableId: string | null = null;
  if (data.deliveryType === DELIVERY_TYPE.MESA) {
    if (!data.tableId) {
      return { success: false, error: "Debes seleccionar una mesa" };
    }
    const [mesa] = await db
      .select()
      .from(restaurantTable)
      .where(eq(restaurantTable.id, data.tableId));

    if (!mesa || !mesa.isActive) {
      return { success: false, error: "Mesa no disponible" };
    }
    if (mesa.status === TABLE_STATUS.OCUPADA) {
      return { success: false, error: `La mesa ${mesa.number} ya está ocupada` };
    }
    tableId = mesa.id;
  }

  const productIds = data.items.map((i) => i.productId);
  const dbProducts = await db
    .select()
    .from(product)
    .where(and(inArray(product.id, productIds), eq(product.isActive, true)));

  const priceMap = new Map(dbProducts.map((p) => [p.id, p]));

  const lines = data.items.map((item) => {
    const prod = priceMap.get(item.productId);
    if (!prod) {
      throw new Error("Producto no disponible");
    }
    const quantity = Math.max(1, Math.floor(item.quantity));
    return {
      productId: prod.id,
      productName: prod.name,
      quantity,
      unitPrice: prod.price,
      subtotal: Number(prod.price) * quantity,
    };
  });

  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const orderId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(order).values({
      id: orderId,
      userId: session.user.id,
      tableId,
      deliveryType: data.deliveryType,
      status: ORDER_STATUS.PENDIENTE,
      total: total.toFixed(2),
      updatedAt: new Date(),
    });

    await tx.insert(orderDetail).values(
      lines.map((l) => ({
        id: crypto.randomUUID(),
        orderId,
        productId: l.productId,
        productName: l.productName,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      }))
    );

    if (tableId) {
      await tx
        .update(restaurantTable)
        .set({ status: TABLE_STATUS.OCUPADA, updatedAt: new Date() })
        .where(eq(restaurantTable.id, tableId));
    }
  });

  revalidatePath("/cocina");
  revalidatePath("/caja");
  revalidatePath("/admin");
  revalidatePath("/admin/ventas");
  return { success: true, orderId, total };
}

export async function getActiveOrders() {
  await requireSession([ROLES.COCINA, ROLES.ADMIN]);

  const orders = await db
    .select()
    .from(order)
    .where(inArray(order.status, [ORDER_STATUS.PENDIENTE, ORDER_STATUS.PREPARANDO]))
    .orderBy(order.createdAt);

  if (orders.length === 0) return [];

  const details = await db
    .select()
    .from(orderDetail)
    .where(inArray(orderDetail.orderId, orders.map((o) => o.id)));

  return orders.map((o) => ({
    ...o,
    items: details.filter((d) => d.orderId === o.id),
  }));
}

export async function updateOrderStatus(id: string, status: string) {
  await requireSession([ROLES.COCINA, ROLES.ADMIN]);

  if (!ORDER_STATUS_LIST.includes(status)) {
    return { success: false, error: "Estado inválido" };
  }

  await db
    .update(order)
    .set({ status, updatedAt: new Date() })
    .where(eq(order.id, id));

  revalidatePath("/cocina");
  revalidatePath("/admin");
  revalidatePath("/admin/ventas");
  return { success: true };
}

export async function getSalesSummary() {
  await requireSession([ROLES.ADMIN]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayRow] = await db
    .select({
      revenue: sql<string>`COALESCE(SUM(${order.total}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(order)
    .where(and(eq(order.paymentStatus, PAYMENT_STATUS.PAGADO), gte(order.paidAt, startOfDay)));

  const [activeRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(order)
    .where(inArray(order.status, [ORDER_STATUS.PENDIENTE, ORDER_STATUS.PREPARANDO]));

  const revenue = Number(todayRow?.revenue ?? 0);
  const completed = Number(todayRow?.count ?? 0);

  return {
    revenueToday: revenue,
    completedToday: completed,
    activeOrders: Number(activeRow?.count ?? 0),
    averageTicket: completed > 0 ? revenue / completed : 0,
  };
}

export async function getSales() {
  await requireSession([ROLES.ADMIN]);

  return await db
    .select()
    .from(order)
    .orderBy(desc(order.createdAt))
    .limit(100);
}

export async function getUnpaidOrders() {
  await requireSession([ROLES.CAJERO, ROLES.ADMIN]);

  return await db
    .select()
    .from(order)
    .where(
      and(
        eq(order.paymentStatus, PAYMENT_STATUS.PENDIENTE),
        sql`${order.status} <> ${ORDER_STATUS.CANCELADO}`
      )
    )
    .orderBy(desc(order.createdAt));
}

export async function registerPayment(id: string, paymentMethod: string) {
  await requireSession([ROLES.CAJERO, ROLES.ADMIN]);

  if (!PAYMENT_METHOD_LIST.includes(paymentMethod)) {
    return { success: false, error: "Método de pago inválido" };
  }

  const [current] = await db.select().from(order).where(eq(order.id, id));
  if (!current) {
    return { success: false, error: "Pedido no encontrado" };
  }
  if (current.paymentStatus === PAYMENT_STATUS.PAGADO) {
    return { success: false, error: "El pedido ya fue pagado" };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(order)
      .set({
        paymentStatus: PAYMENT_STATUS.PAGADO,
        paymentMethod,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(order.id, id));

    if (current.tableId) {
      await tx
        .update(restaurantTable)
        .set({ status: TABLE_STATUS.LIBRE, updatedAt: new Date() })
        .where(eq(restaurantTable.id, current.tableId));
    }
  });

  revalidatePath("/caja");
  revalidatePath("/admin");
  revalidatePath("/admin/ventas");
  return { success: true };
}

export async function cancelOrder(id: string) {
  await requireSession([ROLES.CAJERO, ROLES.ADMIN]);

  const [current] = await db.select().from(order).where(eq(order.id, id));
  if (!current) {
    return { success: false, error: "Pedido no encontrado" };
  }
  if (current.paymentStatus === PAYMENT_STATUS.PAGADO) {
    return { success: false, error: "No se puede cancelar un pedido ya pagado" };
  }
  if (current.status === ORDER_STATUS.CANCELADO) {
    return { success: false, error: "El pedido ya está cancelado" };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(order)
      .set({ status: ORDER_STATUS.CANCELADO, updatedAt: new Date() })
      .where(eq(order.id, id));

    if (current.tableId) {
      await tx
        .update(restaurantTable)
        .set({ status: TABLE_STATUS.LIBRE, updatedAt: new Date() })
        .where(eq(restaurantTable.id, current.tableId));
    }
  });

  revalidatePath("/caja");
  revalidatePath("/cocina");
  revalidatePath("/admin");
  revalidatePath("/admin/ventas");
  return { success: true };
}

export async function getOrderDetails(id: string) {
  await requireSession([ROLES.ADMIN, ROLES.CAJERO]);

  const [found] = await db.select().from(order).where(eq(order.id, id));
  if (!found) return null;

  const items = await db
    .select()
    .from(orderDetail)
    .where(eq(orderDetail.orderId, id));

  return { ...found, items };
}

export async function getTopProductsToday() {
  await requireSession([ROLES.ADMIN]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return await db
    .select({
      productName: orderDetail.productName,
      quantity: sql<number>`CAST(SUM(${orderDetail.quantity}) AS UNSIGNED)`,
      revenue: sql<string>`SUM(${orderDetail.quantity} * ${orderDetail.unitPrice})`,
    })
    .from(orderDetail)
    .innerJoin(order, eq(orderDetail.orderId, order.id))
    .where(and(eq(order.paymentStatus, PAYMENT_STATUS.PAGADO), gte(order.paidAt, startOfDay)))
    .groupBy(orderDetail.productName)
    .orderBy(desc(sql`SUM(${orderDetail.quantity})`))
    .limit(5);
}

export async function getCashierDaySummary() {
  await requireSession([ROLES.CAJERO, ROLES.ADMIN]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [paidRow] = await db
    .select({
      collected: sql<string>`COALESCE(SUM(${order.total}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(order)
    .where(and(eq(order.paymentStatus, PAYMENT_STATUS.PAGADO), gte(order.paidAt, startOfDay)));

  return {
    collectedToday: Number(paidRow?.collected ?? 0),
    paidCount: Number(paidRow?.count ?? 0),
  };
}
