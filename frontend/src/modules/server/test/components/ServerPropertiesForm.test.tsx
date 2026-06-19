import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerPropertiesForm } from '../../components/ServerPropertiesForm.js';
import { DEFAULT_PROPERTIES } from '../../domain/ServerProperties.js';

describe('ServerPropertiesForm', () => {
  describe('Basic Behaviour', () => {
    it('renders the current values', () => {
      render(
        <ServerPropertiesForm
          value={{ ...DEFAULT_PROPERTIES, difficulty: 'hard', maxPlayers: 8 }}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByLabelText('Dificultad')).toHaveValue('hard');
      expect(screen.getByLabelText('Máx. jugadores')).toHaveValue(8);
      expect(screen.getByLabelText('PvP')).toBeChecked();
    });

    it('emits a change when the difficulty changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ServerPropertiesForm value={DEFAULT_PROPERTIES} onChange={onChange} />,
      );

      await user.selectOptions(screen.getByLabelText('Dificultad'), 'hard');

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 'hard' }),
      );
    });

    it('toggles a boolean property', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ServerPropertiesForm value={DEFAULT_PROPERTIES} onChange={onChange} />,
      );

      await user.click(screen.getByLabelText('Hardcore'));

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hardcore: true }),
      );
    });
  });

  describe('Bedrock edition', () => {
    it('hides PvP, Hardcore and the per-name whitelist', () => {
      render(
        <ServerPropertiesForm
          value={DEFAULT_PROPERTIES}
          onChange={vi.fn()}
          edition="bedrock"
        />,
      );

      expect(screen.queryByLabelText('PvP')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Hardcore')).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Whitelist (un usuario por línea)'),
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText('Nombre del servidor')).toBeInTheDocument();
      expect(screen.getByLabelText('Allow list activa')).toBeInTheDocument();
    });
  });
});
