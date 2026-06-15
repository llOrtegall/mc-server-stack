import { Terminal } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card.js';
import { ConsoleView } from '../components/ConsoleView.js';
import { useConsole } from '../hooks/useConsole.js';

export function ConsolePanel({ serverId }: { serverId: string }) {
  const { lines, sending, error, send } = useConsole(serverId);

  return (
    <Card className="mt-6 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Terminal className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-bold text-white">Consola</h2>
      </div>
      <ConsoleView
        lines={lines}
        sending={sending}
        error={error}
        onSend={send}
      />
    </Card>
  );
}
