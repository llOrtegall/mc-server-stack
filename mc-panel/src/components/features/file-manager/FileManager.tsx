"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Folder,
  File,
  ChevronRight,
  Upload,
  Download,
  Trash2,
  Edit3,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { files as filesApi } from "@/lib/api-client";
import type { FileEntry } from "@/types/api";

export function FileManager({ serverId }: { serverId: string }) {
  const [path, setPath] = useState("/");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFile, setEditingFile] = useState<{
    path: string;
    content: string;
    original: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDir = useCallback(
    async (targetPath: string) => {
      setLoading(true);
      try {
        const data = await filesApi.list(serverId, targetPath);
        setEntries(data);
        setPath(targetPath);
      } catch {
        toast.error("Error al cargar directorio");
      } finally {
        setLoading(false);
      }
    },
    [serverId]
  );

  useEffect(() => {
    loadDir("/");
  }, [loadDir]);

  async function openFile(filePath: string) {
    try {
      const { content } = await filesApi.read(serverId, filePath);
      setEditingFile({ path: filePath, content, original: content });
    } catch {
      toast.error("No se puede leer el archivo");
    }
  }

  async function saveFile() {
    if (!editingFile) return;
    setSaving(true);
    try {
      await filesApi.write(serverId, editingFile.path, editingFile.content);
      setEditingFile((f) => f && { ...f, original: f.content });
      toast.success("Archivo guardado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(entryPath: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await filesApi.delete(serverId, entryPath);
      toast.success("Eliminado");
      loadDir(path);
    } catch {
      toast.error("Error al eliminar");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await filesApi.upload(serverId, path, file);
      toast.success(`${file.name} subido`);
      loadDir(path);
    } catch {
      toast.error("Error al subir archivo");
    }
    e.target.value = "";
  }

  function goUp() {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    loadDir("/" + parts.join("/") || "/");
  }

  // Editor de texto
  if (editingFile) {
    const isDirty = editingFile.content !== editingFile.original;
    return (
      <div className="flex flex-col h-[500px]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card rounded-t-lg">
          <span className="text-xs font-mono text-muted-foreground truncate">
            {editingFile.path}
          </span>
          <div className="flex gap-2 flex-shrink-0">
            {isDirty && (
              <button
                onClick={saveFile}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs
                           bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Save className="h-3 w-3" />
                {saving ? "Guardando..." : "Guardar"}
              </button>
            )}
            <button
              onClick={() => setEditingFile(null)}
              className="p-1 rounded hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <textarea
          value={editingFile.content}
          onChange={(e) =>
            setEditingFile((f) => f && { ...f, content: e.target.value })
          }
          className="flex-1 font-mono text-xs bg-[#0d1117] text-slate-300 p-3
                     focus:outline-none resize-none border border-border border-t-0 rounded-b-lg"
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {path !== "/" && (
          <button
            onClick={goUp}
            className="inline-flex items-center gap-1 rounded-md border border-border
                       px-2 py-1.5 text-xs hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Atrás
          </button>
        )}
        <span className="font-mono text-xs text-muted-foreground flex-1 truncate">
          {path}
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-md border border-border
                     px-2 py-1.5 text-xs hover:bg-secondary transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          Subir
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* File list */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Cargando...</p>
      ) : (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Carpeta vacía
            </p>
          )}
          {entries.map((entry) => (
            <div
              key={entry.path}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors group"
            >
              {entry.type === "directory" ? (
                <Folder className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              ) : (
                <File className="h-4 w-4 text-blue-400 flex-shrink-0" />
              )}
              <button
                onClick={() =>
                  entry.type === "directory"
                    ? loadDir(entry.path)
                    : openFile(entry.path)
                }
                className="flex-1 text-sm text-left truncate hover:text-primary transition-colors"
              >
                {entry.name}
              </button>
              {entry.type === "directory" && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              {entry.type === "file" && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => openFile(entry.path)}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={filesApi.downloadUrl(serverId, entry.path)}
                    download
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Descargar"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => deleteEntry(entry.path, entry.name)}
                    className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
