import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginForm from '../../components/auth/LoginForm';

describe('Módulo de Identidad - Componente LoginForm', () => {
  it('Debe renderizar los inputs y el botón correctamente', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeDefined();
    expect(screen.getByLabelText(/contraseña/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /entrar al panel/i })).toBeDefined();
  });

  it('Debe mostrar un mensaje de carga al enviar el formulario', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const button = screen.getByRole('button', { name: /entrar al panel/i });

    fireEvent.change(emailInput, { target: { value: 'cajero@techflavor.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(button);

    expect(screen.getByText(/ingresando/i)).toBeDefined();
  });
});
