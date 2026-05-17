import { type FormEvent, useEffect, useRef, useState } from 'react';

interface Props {
  lines: string[];
  sending: boolean;
  error: string;
  onSend: (command: string) => void;
}

export function ConsoleView({ lines, sending, error, onSend }: Props) {
  const [command, setCommand] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lines.length === 0) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!command.trim()) return;
    onSend(command);
    setCommand('');
  }

  return (
    <div>
      <div className="bg-black/60 rounded-md p-3 h-64 overflow-y-auto font-mono text-xs text-gray-200 whitespace-pre-wrap">
        {lines.length === 0 ? (
          <span className="text-gray-600">Sin salida.</span>
        ) : (
          lines.map((line, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: append-only log output may contain duplicate lines
            <div key={index}>{line}</div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="say hola"
          className="flex-1 rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
