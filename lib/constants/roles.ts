export const ROLES = Object.freeze({
  ADMIN: "Administrador",
  CAJERO: "Cajero",
  COCINA: "Cocina",
});

export const ROLE_HOME_PATHS = Object.freeze({
  [ROLES.ADMIN]: "/admin",
  [ROLES.CAJERO]: "/caja",
  [ROLES.COCINA]: "/cocina",
});