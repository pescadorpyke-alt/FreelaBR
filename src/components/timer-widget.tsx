"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Play, Square } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: { name: string };
}

export function TimerWidget({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startTimer() {
    if (!projectId) return;
    startTimeRef.current = new Date();
    setElapsed(0);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(
          Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
        );
      }
    }, 1000);
  }

  async function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setLoading(true);

    const startedAt = startTimeRef.current?.toISOString();
    const stoppedAt = new Date().toISOString();

    await fetch("/api/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        description: description.trim() || null,
        startedAt,
        stoppedAt,
      }),
    });

    setRunning(false);
    setElapsed(0);
    setDescription("");
    startTimeRef.current = null;
    setLoading(false);
    router.refresh();
  }

  function formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-border text-center">
        <p className="text-muted-foreground text-sm">
          Crie um projeto ativo para usar o timer.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={running}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.client.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!running}
            placeholder={running ? "O que você está fazendo?" : "Inicie o timer..."}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-2xl font-bold tabular-nums w-28 text-center">
            {formatElapsed(elapsed)}
          </span>

          {running ? (
            <button
              onClick={stopTimer}
              disabled={loading}
              className="p-3 rounded-full bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50 transition-colors"
            >
              <Square size={20} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={startTimer}
              disabled={!projectId}
              className="p-3 rounded-full bg-success text-white hover:bg-success/90 disabled:opacity-50 transition-colors"
            >
              <Play size={20} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
