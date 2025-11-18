"use client";

import { Progress } from "@/components/ui/progress";

interface TodoStatsProps {
  total: number;
  completed: number;
  shared: number;
}

export const TodoStats = ({ total, completed, shared }: TodoStatsProps) => {
  const active = Math.max(total - completed, 0);
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBlock label="Total Tasks" value={total} />
          <StatBlock label="Completed" value={completed} />
          <StatBlock label="Active" value={active} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>Completion rate</span>
            <span>{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        <div className="rounded-lg bg-background/80 p-3 text-sm text-muted-foreground">
          You have shared <span className="font-semibold text-foreground">{shared}</span> task
          {shared === 1 ? "" : "s"} with your friends.
        </div>
      </div>
    </div>
  );
};

const StatBlock = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border bg-background/60 p-3 text-center">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);
