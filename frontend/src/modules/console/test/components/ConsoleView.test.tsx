import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsoleView } from '../../components/ConsoleView.js';

describe('ConsoleView', () => {
  describe('Basic Behaviour', () => {
    it('renders the log lines', () => {
      render(
        <ConsoleView
          lines={['line one', 'line two']}
          sending={false}
          error=""
          onSend={vi.fn()}
        />,
      );

      expect(screen.getByText('line one')).toBeInTheDocument();
      expect(screen.getByText('line two')).toBeInTheDocument();
    });

    it('shows an empty state when there is no output', () => {
      render(
        <ConsoleView lines={[]} sending={false} error="" onSend={vi.fn()} />,
      );

      expect(screen.getByText('Sin salida.')).toBeInTheDocument();
    });

    it('sends the command and clears the input', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(
        <ConsoleView lines={[]} sending={false} error="" onSend={onSend} />,
      );

      const input = screen.getByPlaceholderText('say hola');
      await user.type(input, 'list');
      await user.click(screen.getByRole('button', { name: 'Enviar' }));

      expect(onSend).toHaveBeenCalledWith('list');
      expect(input).toHaveValue('');
    });
  });
});
