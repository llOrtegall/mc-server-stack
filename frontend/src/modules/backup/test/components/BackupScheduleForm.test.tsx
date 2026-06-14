import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackupScheduleForm } from '../../components/BackupScheduleForm.js';
import * as BackupScheduleMother from '../helpers/BackupScheduleMother.js';

describe('BackupScheduleForm', () => {
  describe('Basic Behaviour', () => {
    it('saves the configured schedule', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      const schedule = BackupScheduleMother.create({
        enabled: false,
        frequency: 'daily',
        retention: 7,
        location: 'local',
      });

      render(
        <BackupScheduleForm
          schedule={schedule}
          cloudEnabled={false}
          saving={false}
          error=""
          message=""
          onSave={onSave}
        />,
      );

      await user.click(screen.getByLabelText('Activar backups automáticos'));
      await user.click(screen.getByRole('button', { name: 'Guardar plan' }));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
          frequency: 'daily',
          retention: 7,
          location: 'local',
        }),
      );
    });
  });
});
