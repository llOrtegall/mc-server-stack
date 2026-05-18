import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../components/LoginForm.js';

describe('LoginForm', () => {
  describe('Basic Behaviour', () => {
    it('submits the typed credentials', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn(async () => {});
      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('Email'), 'admin@mc.local');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }));

      expect(onSubmit).toHaveBeenCalledWith('admin@mc.local', 'secret');
    });
  });

  describe('Error Scenarios', () => {
    it('shows the error message when login fails', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn(async () => {
        throw new Error('Credenciales invalidas');
      });
      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('Email'), 'a@b.co');
      await user.type(screen.getByLabelText('Password'), 'x');
      await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }));

      expect(
        await screen.findByText('Credenciales invalidas'),
      ).toBeInTheDocument();
    });
  });
});
