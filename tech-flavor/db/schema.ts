import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const usuarios = mysqlTable('usuarios', {
  id: int('id').autoincrement().primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  correo: varchar('correo', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  rol: varchar('rol', { length: 20 }).notNull(), 
});