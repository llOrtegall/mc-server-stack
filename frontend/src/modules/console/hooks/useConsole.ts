import { useCallback, useEffect, useState } from 'react';
import { consoleFactory } from '../application/factory.js';

const MAX_LINES = 500;

export function useConsole(serverId: string) {
  const [lines, setLines] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const append = useCallback((text: string) => {
    const parts = text.split(/\r?\n/).filter((line) => line.length > 0);
    if (parts.length === 0) return;
    setLines((prev) => [...prev, ...parts].slice(-MAX_LINES));
  }, []);

  // Seed with the recent tail, then attach the live stream.
  useEffect(() => {
    if (!serverId) return;
    let cancelled = false;
    let stream: { close: () => void } | null = null;

    consoleFactory
      .getLogs(serverId, 100)
      .then((logs) => {
        if (!cancelled) append(logs);
      })
      .catch(() => {
        // no logs available yet — ignore
      })
      .finally(() => {
        if (!cancelled) stream = consoleFactory.openStream(serverId, append);
      });

    return () => {
      cancelled = true;
      stream?.close();
    };
  }, [serverId, append]);

  const send = useCallback(
    async (command: string) => {
      if (!command.trim()) return;
      setSending(true);
      try {
        const response = await consoleFactory.sendCommand(serverId, command);
        append(`> ${command}`);
        if (response) append(response);
        setError('');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al enviar comando',
        );
      } finally {
        setSending(false);
      }
    },
    [serverId, append],
  );

  return { lines, sending, error, send };
}
