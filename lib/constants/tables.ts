export const TABLE_STATUS = Object.freeze({
  LIBRE: "Libre",
  OCUPADA: "Ocupada",
});

export const PAYMENT_STATUS = Object.freeze({
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
});

export const PAYMENT_METHOD = Object.freeze({
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
});

export const TABLE_STATUS_LIST: string[] = Object.values(TABLE_STATUS);
export const PAYMENT_STATUS_LIST: string[] = Object.values(PAYMENT_STATUS);
export const PAYMENT_METHOD_LIST: string[] = Object.values(PAYMENT_METHOD);
