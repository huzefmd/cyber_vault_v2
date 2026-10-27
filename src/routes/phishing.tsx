import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, ShieldAlert, Lock, Globe } from "lucide-react";
import { analyzePhishing } from "@/lib/phishing.functions";
import { listPhishingScans } from "@/lib/dashboard.functions";
import { SeverityBadge } from "@/components/security/severity-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/phishing")({
  head: () => ({
    meta: [
      { title: "Phishing detector — CyberVault" },
      {
        name: "description",
        content: "Classify any URL as Safe, Suspicious or Malicious with AI-backed confidence scoring.",
      },
      { property: "og:title", content: "Phishing detector — CyberVault" },
      { property: "og:description", content: "AI URL analysis with threat indicators and guidance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PhishingPage,
});

function PhishingPage() {
  const [url, setUrl] = useState("");
  const queryClient = useQueryClient();
  const analyzeFn = useServerFn(analyzePhishing);
  const listFn = useServerFn(listPhishingScans);

  const history = useQuery({ queryKey: ["phishing"], queryFn: () => listFn() });

  const analyze = useMutation({
    mutationFn: (target: string) => analyzeFn({ data: { url: target } }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["phishing"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      toast.success(`Classified as ${result.classification}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Analysis failed"),
  });

  const result = analyze.data;

  return (
    <div className="space-y-8 py-10">
      <div className="text-center space-y-4 py-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-red-400/10 text-red-400">
            <ShieldAlert className="size-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI Phishing Detector</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
          Phishing is the #1 vector for credential theft and ransomware. A single
          clicked link can compromise an entire organization. Our AI-powered detector
          acts as your first line of defense, neutralizing threats by identifying
          malicious patterns in milliseconds.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {[
            { label: "Stop Credential Theft", icon: Lock },
            { label: "Avoid Ransomware", icon: ShieldAlert },
            { label: "Verify URL Integrity", icon: Globe },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-400/10 text-red-400 text-xs font-medium border border-red-400/20">
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
          analyze.mutate(url);
        }}
      >
        <Input
          value={url}
          maxLength={2048}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://secure-login.example-verify.top/account"
          className="flex-1"
        />
        <Button type="submit" disabled={analyze.isPending || url.trim().length < 4}>
          {analyze.isPending && <Loader2 className="size-4 animate-spin" />}
          {analyze.isPending ? "Analyzing…" : "Analyze URL"}
        </Button>
      </form>

      {result && (
        <section className="glass-panel shadow-card space-y-4 rounded-2xl p-6 max-w-4xl mx-auto border border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge value={result.classification} />
            <span className="text-sm text-muted-foreground">
              {Math.round(result.confidenceScore)}% confidence · {result.provider}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{result.explanation}</p>
          {result.threatIndicators.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-white">Threat indicators</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.threatIndicators.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-white">Recommended actions</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="glass-panel shadow-card rounded-2xl p-6 max-w-4xl mx-auto border border-white/10">
        <h2 className="text-sm font-semibold mb-4">Recent Public Analyses</h2>
        <ul className="space-y-3">
          {(history.data ?? []).length === 0 && (
            <li className="text-sm text-muted-foreground">No URLs analyzed yet.</li>
          )}
          {(history.data ?? []).map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="truncate text-sm">{row.url}</span>
              <SeverityBadge value={row.classification} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
