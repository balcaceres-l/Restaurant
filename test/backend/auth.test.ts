// test/backend/auth.test.ts
import { describe, it, expect } from 'vitest';
import { db } from '../../db/index';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';

describe('Integración - Autenticación y Seeders', () => {
  
  it('Debe existir el usuario Administrador en la base de datos con su rol correcto', async () => {
    const result = await db.select().from(user).where(eq(user.email, 'admin@techflavor.com'));
    
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Admin General');
    expect(result[0].role).toBe('Administrador');
  });

  it('Debe permitir el inicio de sesión (sign-in) con las credenciales del seed', async () => {
    const res = await fetch('http://localhost:3000/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'User-Agent': 'Vitest-Test-Runner'
      },
      body: JSON.stringify({
        email: 'cajero@techflavor.com',
        password: 'password123'
      })
    });

    const data = await res.json();
    
    expect(res.ok).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('cajero@techflavor.com');
  });
});