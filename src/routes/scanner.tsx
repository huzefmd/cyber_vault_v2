import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck, FileText } from "lucide-react";
import { startScan } from "@/lib/scans.functions";
import { getScanDetail } from "@/lib/dashboard.functions";
import { recordReport } from "@/lib/reports.functions";
import { supabase } from "@/integrations/supabase/client";
import { buildReportPdf } from "@/lib/pdf";
import { ScoreRing } from "@/components/security/score-ring";
import { SeverityBadge } from "@/components/security/severity-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Website scanner — CyberVault" },
      {
        name: "description",
        content: "Run a live, read-only security scan of any website: TLS, headers, cookies and exposure.",
      },
      { property: "og:title", content: "Website scanner — CyberVault" },
      { property: "og:description", content: "Scan a site and get a 0-100 security score with fixes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScannerPage,
});

function ScannerPage() {
  const [url, setUrl] = useState("");
  const [scanId, setScanId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const runScanFn = useServerFn(startScan);
  const detailFn = useServerFn(getScanDetail);
  const recordFn = useServerFn(recordReport);

  const scan = useMutation({
    mutationFn: (target: string) => runScanFn({ data: { url: target } }),
    onSuccess: (result) => {
      setScanId(result.scanId);
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      if (result.simulated) toast.warning("Target unreachable — simulated placeholder returned.");
      else toast.success(`Scan complete · score ${result.securityScore}/100`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Scan failed"),
  });

  const detail = useQuery({
    queryKey: ["scan", scanId],
    enabled: Boolean(scanId),
    queryFn: () => detailFn({ data: { id: scanId! } }),
  });

  async function handleExport() {
    if (!detail.data) return;
    const { scan: row, findings } = detail.data;
    const blob = buildReportPdf({
      domain: row.domain,
      url: row.url,
      securityScore: row.security_score,
      riskLevel: row.risk_level,
      sslStatus: row.ssl_status,
      scannedAt: row.created_at,
      findings,
    });

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast.error("Please sign in to save reports to your account.");
      return;
    }

    const path = `${userId}/${row.id}-${Date.now()}.pdf`;
    const { error } = await supabase.storage
      .from("security-reports")
      .upload(path, blob, { contentType: "application/pdf" });

    if (error) {
      toast.error("Could not store the report.");
      return;
    }

    await recordFn({
      data: {
        reportName: `${row.domain} security report`,
        storagePath: path,
        fileSize: blob.size,
        scanId: row.id,
      },
    });

    queryClient.invalidateQueries({ queryKey: ["reports"] });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `cybervault-${row.domain}.pdf`;
    link.click();
    URL.revokeObjectURL(href);
    toast.success("Report generated and saved");
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Website Security Scanner</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
          In an era of constant cyber threats, a single misconfigured header or an expired
          SSL certificate can be the entry point for an attacker. Our scanner provides
          instant visibility into your security posture, allowing you to find and fix
          vulnerabilities before they are exploited.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {[
            { label: "Prevent Data Leaks", icon: Lock },
            { label: "Build User Trust", icon: ShieldCheck },
            { label: "Audit Compliance", icon: FileText },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <item.icon className="size-3" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <form
        className="glass-panel shadow-card flex flex-col gap-3 rounded-2xl p-5 sm:flex-row max-w-3xl mx-auto"
        onSubmit={(event) => {
          event.preventDefault();
          scan.mutate(url);
        }}
      >
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="example.com"
          maxLength={2048}
          className="flex-1"
        />
        <Button type="submit" disabled={scan.isPending || url.trim().length < 4}>
          {scan.isPending && <Loader2 className="size-4 animate-spin" />}
          {scan.isPending ? "Scanning…" : "Scan website"}
        </Button>
      </form>

      {detail.data && (
        <div className="space-y-6 max-w-5xl mx-auto">
          <section className="glass-panel shadow-card flex flex-wrap items-center gap-8 rounded-2xl p-6">
            <ScoreRing score={detail.data.scan.security_score ?? 0} />
            <div className="min-w-[220px] flex-1 space-y-2 text-sm">
              <p className="text-lg font-semibold">{detail.data.scan.domain}</p>
              <p className="text-muted-foreground">TLS: {detail.data.scan.ssl_status ?? "—"}</p>
              <p className="text-muted-foreground">
                {detail.data.findings.length} findings ·{" "}
                {new Date(detail.data.scan.created_at).toLocaleString()}
              </p>
              {detail.data.scan.risk_level && (
                <SeverityBadge value={detail.data.scan.risk_level} />
              )}
              <div className="pt-2">
                <Button size="sm" variant="secondary" onClick={handleExport}>
                  Export PDF report
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {detail.data.findings.map((finding) => (
              <article key={finding.id} className="glass-panel rounded-2xl p-5 border border-white/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{finding.title}</p>
                    <p className="text-xs text-muted-foreground">{finding.category}</p>
                  </div>
                  <SeverityBadge value={finding.severity} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {finding.description}
                </p>
                {finding.evidence && (
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                    {finding.evidence}
                  </pre>
                )}
                {finding.recommendation && (
                  <p className="mt-3 text-sm">
                    <span className="text-primary">Fix: </span>
                    {finding.recommendation}
                  </p>
                )}
              </article>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
