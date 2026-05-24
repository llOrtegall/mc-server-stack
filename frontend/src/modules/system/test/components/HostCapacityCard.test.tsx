import { render, screen } from '@testing-library/react';
import { HostCapacityCard } from '../../components/HostCapacityCard.js';
import * as HostResourcesMother from '../helpers/HostResourcesMother.js';

describe('HostCapacityCard', () => {
  describe('Basic Behaviour', () => {
    it('shows the host cpu cores and memory', () => {
      const resources = HostResourcesMother.create({
        cpuCores: 4,
        memoryMb: 8192,
      });

      render(<HostCapacityCard resources={resources} />);

      const region = screen.getByRole('region', {
        name: 'Capacidad del host',
      });
      expect(region).toHaveTextContent('4');
      expect(region).toHaveTextContent('cores');
      expect(region).toHaveTextContent('8192');
      expect(region).toHaveTextContent('MB RAM');
    });
  });
});
