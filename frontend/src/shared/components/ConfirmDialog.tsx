import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button.js';
import { Card } from './ui/Card.js';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={
              destructive
                ? 'flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400'
                : 'flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400'
            }
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="mb-6 text-sm text-zinc-400">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
