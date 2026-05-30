import { prisma } from "@/lib/prisma";
import { TimerWidget } from "@/components/timer-widget";
import { TimeEntryList } from "@/components/time-entry-list";

export const dynamic = "force-dynamic";

export default async function TimerPage() {
  const [projects, recentEntries] = await Promise.all([
    prisma.project.findMany({
      where: { status: "active" },
      include: { client: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.timeEntry.findMany({
      where: { stoppedAt: { not: null } },
      include: {
        project: {
          select: { name: true, client: { select: { name: true } } },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Timer</h1>
        <p className="text-sm text-muted-foreground">
          Registre o tempo trabalhado em cada projeto.
        </p>
      </div>

      <TimerWidget projects={projects} />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Registros recentes</h2>
        <TimeEntryList entries={recentEntries} />
      </div>
    </div>
  );
}
