import { Send } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '../../../shared/components/ui/Button.js';
import { fieldClass } from '../../../shared/components/ui/Field.js';
import { cn } from '../../../shared/lib/cn.js';

interface Props {
  lines: string[];
  sending: boolean;
  error: string;
  onSend: (command: string) => void;
  readOnly?: boolean;
}

export function ConsoleView({
  lines,
  sending,
  error,
  onSend,
  readOnly = false,
}: Props) {
  const [command, setCommand] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lines.length === 0) return;
    // Scroll the log box itself, not the page, so new lines don't yank the viewport.
    const box = logRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines.length]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!command.trim()) return;
    onSend(command);
    setCommand('');
  }

  return (
    <div>
      <div
        ref={logRef}
        className="h-72 overflow-y-auto rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-xs leading-relaxed text-zinc-300 shadow-inner"
      >
        {lines.length === 0 ? (
          <span className="text-zinc-600">Sin salida.</span>
        ) : (
          lines.map((line, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: append-only log output may contain duplicate lines
            <div key={index} className="whitespace-pre-wrap break-words">
              {line}
            </div>
          ))
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {readOnly ? (
        <p className="mt-3 text-xs text-zinc-500">
          Los servidores Bedrock no admiten comandos por consola (sin RCON).
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="say hola"
            className={cn(fieldClass, 'flex-1 font-mono')}
          />
          <Button type="submit" disabled={sending}>
            <Send className="h-4 w-4" />
            {sending ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      )}
    </div>
  );
}
