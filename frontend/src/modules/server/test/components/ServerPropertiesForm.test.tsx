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
});
