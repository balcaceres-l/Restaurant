import { describe, it, expect } from 'vitest';
import { db } from '../../db/index';
import { sql } from 'drizzle-orm';

describe('Configuración de Base de Datos', () => {
  it('Debe establecer conexión con MariaDB exitosamente', async () => {
    try {
      const result = await db.execute(sql`SELECT 1`);
      expect(result).toBeDefined();
    } catch (error: any) {
      throw new Error(`Fallo la conexión a MariaDB: ${error.message}`);
    }
  });
});