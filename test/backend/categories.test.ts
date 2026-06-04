import { describe, it, expect } from 'vitest';
import { db } from '../../db/index';
import { category } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { createCategoria, getCategorias, updateCategoria } from '../../actions/categories';

describe('Gestión de Categorías - TDD', () => {
  let createdId = '';

  it('Debe crear una nueva categoría con imagen base64', async () => {
    const newCategory = await createCategoria({
      name: 'Hamburguesas',
      description: 'Las mejores de la ciudad',
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE...',
      isActive: true,
    });

    expect(newCategory).toBeDefined();
    expect(newCategory.success).toBe(true);
    const list = await getCategorias();
    createdId = list[0].id;
  });

  it('Debe actualizar la categoría', async () => {
    await updateCategoria(createdId, {
      name: 'Hamburguesas Premium',
      description: '100% carne de res',
    });

    const updated = await db.select().from(category).where(eq(category.id, createdId));
    expect(updated[0].name).toBe('Hamburguesas Premium');
  });
});