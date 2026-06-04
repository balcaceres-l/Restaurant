export const ORDER_STATUS = Object.freeze({
  PENDIENTE: "Pendiente",
  PREPARANDO: "Preparando",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
});

export const DELIVERY_TYPE = Object.freeze({
  MESA: "Mesa",
  PARA_LLEVAR: "Para Llevar",
  DOMICILIO: "Domicilio",
});

export const ORDER_STATUS_LIST: string[] = Object.values(ORDER_STATUS);
export const DELIVERY_TYPE_LIST: string[] = Object.values(DELIVERY_TYPE);
