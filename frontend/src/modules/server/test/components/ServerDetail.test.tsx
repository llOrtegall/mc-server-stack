import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ServerDetail } from '../../components/ServerDetail.js';
import type { ServerStatusValue } from '../../domain/ServerStatus.js';
import * as ServerMother from '../helpers/ServerMother.js';

function renderDetail(
  status: ServerStatusValue,
  port = 25565,
  edition = 'java',
) {
  const server = ServerMother.create({
    name: 'Survival',
    status,
    port,
    edition,
  });
  const onAction = vi.fn();
  const onRequestDelete = vi.fn();
  render(
    <MemoryRouter>
      <ServerDetail
        server={server}
        error=""
        actionLoading={null}
        onAction={onAction}
        onRequestDelete={onRequestDelete}
      />
    </MemoryRouter>,
  );
  return { onAction, onRequestDelete };
}

describe('ServerDetail', () => {
  describe('Basic Behaviour', () => {
    it('renders the server name and port', () => {
      renderDetail('running', 25570);

      expect(
        screen.getByRole('heading', { name: 'Survival' }),
      ).toBeInTheDocument();
      expect(screen.getByText('25570')).toBeInTheDocument();
    });

    it('disables start and enables stop while running', () => {
      renderDetail('running');

      expect(screen.getByRole('button', { name: 'Iniciar' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Detener' })).toBeEnabled();
    });

    it('enables start while stopped', () => {
      renderDetail('stopped');

      expect(screen.getByRole('button', { name: 'Iniciar' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Detener' })).toBeDisabled();
    });

    it('shows the Java edition and its RCON port', () => {
      renderDetail('running');

      expect(screen.getByText('Java')).toBeInTheDocument();
      expect(screen.getByText('Puerto RCON')).toBeInTheDocument();
    });

    it('shows Bedrock as a UDP port and hides RCON', () => {
      renderDetail('running', 19132, 'bedrock');

      expect(screen.getByText('Bedrock')).toBeInTheDocument();
      expect(screen.getByText('Puerto (UDP)')).toBeInTheDocument();
      expect(screen.queryByText('Puerto RCON')).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onAction with stop when stopping a running server', async () => {
      const user = userEvent.setup();
      const { onAction } = renderDetail('running');

      await user.click(screen.getByRole('button', { name: 'Detener' }));

      expect(onAction).toHaveBeenCalledWith('stop');
    });

    it('requests delete confirmation', async () => {
      const user = userEvent.setup();
      const { onRequestDelete } = renderDetail('stopped');

      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      expect(onRequestDelete).toHaveBeenCalledTimes(1);
    });
  });
});
