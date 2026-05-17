import { ConsoleView } from '../components/ConsoleView.js';
import { useConsole } from '../hooks/useConsole.js';

export function ConsolePanel({ serverId }: { serverId: string }) {
  const { lines, sending, error, send } = useConsole(serverId);

  return (
    <section className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
      <h2 className="text-lg font-bold text-white mb-4">Consola</h2>
      <ConsoleView
        lines={lines}
        sending={sending}
        error={error}
        onSend={send}
      />
    </section>
  );
}
