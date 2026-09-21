import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { listWebsites } from "@/lib/websites.functions";
import { startScan } from "@/lib/scans.functions";
import { SeverityBadge } from "@/components/security/severity-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/bulk")({
  head: () => ({
    meta: [
      { title: "Bulk website scanning — CyberVault" },
      {
        name: "description",
        content:
          "Scan several authorized websites in one run, watch live progress and compare their security scores side by side.",
      },
      { property: "og:title", content: "Bulk website scanning — CyberVault" },
      {
        property: "og:description",
        content: "Queue many sites, track progress and compare findings in one table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BulkPage,
});

type RowState = {
  url: string;
  status: "queued" | "running" | "done" | "failed";
  score?: number;
  risk?: string;
  ssl?: string;
  findings?: number;
  error?: string;
};

function BulkPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [extra, setExtra] = useState("");
  const [rows, setRows] = useState<RowState[]>([]);
  const [running, setRunning] = useState(false);
  const queryClient = useQueryClient();
  const listFn = useServerFn(listWebsites);
  const scanFn = useServerFn(startScan);

  const websites = useQuery({ queryKey: ["websites"], queryFn: () => listFn({}) });

  const targets = [
    ...(websites.data ?? []).filter((site) => selected[site.id]).map((site) => site.url),
    ...extra
      .split(/[\n,\s]+/)
      .map((value) => value.trim())
      .filter((value) => value.length > 3),
  ];
  const unique = [...new Set(targets)];

  const completed = rows.filter((row) => row.status === "done" || row.status === "failed").length;
  const progress = rows.length > 0 ? Math.round((completed / rows.length) * 100) : 0;

  async function runBulk() {
    if (unique.length === 0) return;
    setRunning(true);
    setRows(unique.map((url) => ({ url, status: "queued" as const })));

    for (let index = 0; index < unique.length; index += 1) {
      const url = unique[index]!;
      setRows((current) =>
        current.map((row, i) => (i === index ? { ...row, status: "running" } : row)),
      );
      try {
        const result = await scanFn({ data: { url } });
        setRows((current) =>
          current.map((row, i) =>
            i === index
              ? {
                  ...row,
                  status: "done",
                  score: result.securityScore,
                  risk: result.riskLevel,
                  ssl: result.sslStatus,
                  findings: result.findingCount,
                }
              : row,
          ),
        );
      } catch (error) {
        setRows((current) =>
          current.map((row, i) =>
            i === index
              ? {
                  ...row,
                  status: "failed",
                  error: error instanceof Error ? error.message : "Scan failed",
                }
              : row,
          ),
        );
      }
    }

    setRunning(false);
    queryClient.invalidateQueries({ queryKey: ["overview"] });
    queryClient.invalidateQueries({ queryKey: ["scans"] });
    toast.success("Bulk scan finished");
  }

  const done = rows.filter((row) => row.status === "done" && typeof row.score === "number");
  const average =
    done.length > 0 ? Math.round(done.reduce((sum, row) => sum + (row.score ?? 0), 0) / done.length) : null;
  const best = done.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const worst = done.slice().sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bulk website scanning</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Queue several sites you are authorized to test, follow progress and compare the results.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="glass-panel shadow-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Your saved sites</h2>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-2">
            {websites.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {websites.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">No saved sites yet.</p>
            )}
            {websites.data?.map((site) => (
              <label key={site.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30">
                <Checkbox
                  checked={Boolean(selected[site.id])}
                  onCheckedChange={(value) =>
                    setSelected((current) => ({ ...current, [site.id]: value === true }))
                  }
                />
                <span className="text-sm">{site.name}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground">{site.domain}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="glass-panel shadow-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Additional URLs</h2>
          <p className="mt-1 text-xs text-muted-foreground">One per line.</p>
          <Textarea
            value={extra}
            onChange={(event) => setExtra(event.target.value)}
            rows={7}
            placeholder={"example.com\nshop.example.com"}
            className="mt-3"
          />
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={runBulk} disabled={running || unique.length === 0}>
          {running && <Loader2 className="size-4 animate-spin" />}
          {running ? "Scanning…" : `Scan ${unique.length || ""} site${unique.length === 1 ? "" : "s"}`}
        </Button>
        {rows.length > 0 && (
          <div className="min-w-[200px] flex-1">
            <Progress value={progress} />
            <p className="mt-1 text-xs text-muted-foreground">
              {completed} of {rows.length} complete
            </p>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <section className="glass-panel shadow-card overflow-x-auto rounded-2xl p-5">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="text-left">
                <th className="pb-3">Site</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Risk</th>
                <th className="pb-3">Findings</th>
                <th className="pb-3">TLS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.url} className="border-t border-border/50">
                  <td className="py-3 pr-4 break-all">{row.url}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {row.status === "running" ? "Scanning…" : row.status}
                  </td>
                  <td className="py-3 pr-4">{row.score ?? "—"}</td>
                  <td className="py-3 pr-4">{row.risk ? <SeverityBadge value={row.risk} /> : "—"}</td>
                  <td className="py-3 pr-4">{row.findings ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.error ?? row.ssl ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {average !== null && (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Average score</p>
                <p className="text-xl font-semibold">{average}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Strongest</p>
                <p className="truncate text-sm font-semibold">{best?.url}</p>
                <p className="text-xs text-muted-foreground">{best?.score}/100</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Weakest</p>
                <p className="truncate text-sm font-semibold">{worst?.url}</p>
                <p className="text-xs text-muted-foreground">{worst?.score}/100</p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
