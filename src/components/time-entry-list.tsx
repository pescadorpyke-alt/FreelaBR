"use client";

interface TimeEntry {
  id: string;
  description: string | null;
  startedAt: Date | string;
  stoppedAt: Date | string | null;
  duration: number | null;
  project: {
    name: string;
    client: { name: string };
  };
}

export function TimeEntryList({ entries }: { entries: TimeEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">
          Nenhum registro ainda. Use o timer acima para começar.
        </p>
      </div>
    );
  }

  function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min`;
  }

  function formatDate(dateStr: Date | string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  }

  function formatTime(dateStr: Date | string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-3">
            <div className="text-center min-w-[3rem]">
              <p className="text-xs text-muted-foreground">
                {formatDate(entry.startedAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">
                {entry.description || entry.project.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.project.client.name} · {entry.project.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono font-medium">
              {entry.duration ? formatDuration(entry.duration) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(entry.startedAt)}
              {entry.stoppedAt && ` — ${formatTime(entry.stoppedAt)}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
