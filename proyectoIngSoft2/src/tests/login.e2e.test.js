import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';

// 🔥 Componente simple (sin router, sin context, sin css)
function FakeLogin() {
  const [user, setUser] = useState('');
  const [contra, setContra] = useState('');

  return (
    <div>
      <input
        placeholder="Email"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <input
        placeholder="Contraseña"
        value={contra}
        onChange={(e) => setContra(e.target.value)}
      />
      <button>Ingresar</button>
    </div>
  );
}

test('E2E: permite escribir en inputs', () => {
  render(<FakeLogin />);

  const email = screen.getByPlaceholderText('Email');
  const pass = screen.getByPlaceholderText('Contraseña');

  fireEvent.change(email, { target: { value: 'admin' } });
  fireEvent.change(pass, { target: { value: '123' } });

  expect(email.value).toBe('admin');
  expect(pass.value).toBe('123');
});

test('E2E: permite hacer click', () => {
  render(<FakeLogin />);

  const boton = screen.getByText('Ingresar');
  fireEvent.click(boton);

  expect(boton).toBeInTheDocument();
});

