import { describe, it, expect } from 'vitest';
import { db } from '../../db/index';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { toggleUserStatus, updateUsuario } from '../../actions/users';

describe('Gestión de Usuarios - TDD', () => {
  it('Debe realizar un soft-delete (inactivar) a un usuario existente', async () => {
    const targetUser = await db.select().from(user).where(eq(user.email, 'cajero@techflavor.com'));
    expect(targetUser.length).toBe(1);
    const userId = targetUser[0].id;
    await toggleUserStatus(userId, true);
    const updatedUser = await db.select().from(user).where(eq(user.id, userId));
    expect(updatedUser[0].banned).toBe(true);
    await toggleUserStatus(userId, false);
  });

  it('Debe actualizar la información (nombre y rol) de un usuario', async () => {
    const targetUser = await db.select().from(user).where(eq(user.email, 'cocina@techflavor.com'));
    const userId = targetUser[0].id;
    await updateUsuario(userId, { name: 'Chef Principal', role: 'Cocina' });
    const updatedUser = await db.select().from(user).where(eq(user.id, userId));
    expect(updatedUser[0].name).toBe('Chef Principal');
  });
});