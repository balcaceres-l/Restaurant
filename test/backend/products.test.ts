import { describe, it, expect } from 'vitest';
import { db } from '../../db/index';
import { product, category } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { createProducto, getProductos, updateProducto } from '../../actions/products';
import { createCategoria } from '../../actions/categories';

describe('Gestión de Productos - TDD', () => {
  let catId = '';
  let prodId = '';

  it('Debe crear una categoría de prueba y un producto amarrado a ella', async () => {
    
    await createCategoria({ name: 'Cat Prueba', isActive: true });
    const catList = await db.select().from(category).where(eq(category.name, 'Cat Prueba'));
    catId = catList[0].id;
    const res = await createProducto({
      name: 'Hamburguesa Test',
      description: 'Test prod',
      price: "5.50",
      categoryId: catId,
      isActive: true
    });

    expect(res.success).toBe(true);

    const prodList = await getProductos();
    const createdProd = prodList.find(p => p.name === 'Hamburguesa Test');
    expect(createdProd).toBeDefined();
    prodId = createdProd!.id;
  });

  it('Debe actualizar el precio del producto', async () => {
    await updateProducto(prodId, { price: "6.00" });
    const updated = await db.select().from(product).where(eq(product.id, prodId));
    expect(updated[0].price).toBe("6.00");
  });
});