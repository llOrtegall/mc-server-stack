import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackupList } from '../../components/BackupList.js';
import * as BackupMother from '../helpers/BackupMother.js';

describe('BackupList', () => {
  describe('Edge Cases', () => {
    it('shows an empty message when there are no backups', () => {
      render(
        <BackupList
          backups={[]}
          actionLoading={null}
          onRestore={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      expect(screen.getByText('No hay backups todavia.')).toBeInTheDocument();
    });
  });

  describe('Basic Behaviour', () => {
    it('renders restore and delete actions per backup', () => {
      const backups = [BackupMother.create(), BackupMother.create()];
      render(
        <BackupList
          backups={backups}
          actionLoading={null}
          onRestore={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      expect(screen.getAllByRole('button', { name: 'Restaurar' })).toHaveLength(
        2,
      );
      expect(screen.getAllByRole('button', { name: 'Borrar' })).toHaveLength(2);
    });

    it('invokes the callbacks with the backup id', async () => {
      const user = userEvent.setup();
      const backup = BackupMother.create();
      const onRestore = vi.fn();
      const onDelete = vi.fn();
      render(
        <BackupList
          backups={[backup]}
          actionLoading={null}
          onRestore={onRestore}
          onDelete={onDelete}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Restaurar' }));
      await user.click(screen.getByRole('button', { name: 'Borrar' }));

      expect(onRestore).toHaveBeenCalledWith(backup.getId());
      expect(onDelete).toHaveBeenCalledWith(backup.getId());
    });
  });
});
