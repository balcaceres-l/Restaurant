// test/frontend/login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../../components/auth/LoginForm';
 
describe('Módulo de Identidad - Componente LoginForm', () => {
  it('Debe renderizar los inputs y el botón correctamente', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/correo electrónico/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDefined();
  });

  it('Debe mostrar un mensaje de carga al enviar el formulario', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const button = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.change(emailInput, { target: { value: 'cajero@techflavor.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(button);
    expect(screen.getByText(/cargando/i)).toBeDefined();
  });
});