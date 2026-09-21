import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { lookupIntel } from "@/lib/intel.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/intel")({
  head: () => ({
    meta: [
      { title: "IP address intelligence — CyberVault" },
      {
        name: "description",
        content:
          "Resolve any domain to its IP addresses, locate them, map subdomains, trace redirects and inspect certificates.",
      },
      { property: "og:title", content: "IP address intelligence — CyberVault" },
      {
        property: "og:description",
        content: "Locate IP addresses and analyse subdomains, redirects and certificates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IntelPage,
});

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-panel shadow-card rounded-2xl p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function List({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-xs">{empty}</p>;
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="break-all font-mono text-xs">
          {item}
        </li>
      ))}
    </ul>
  );
}

function IntelPage() {
  const [target, setTarget] = useState("");
  const lookupFn = useServerFn(lookupIntel);

  const intel = useMutation({
    mutationFn: (value: string) => lookupFn({ data: { target: value } }),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Lookup failed"),
  });

  const report = intel.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">IP address intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resolve and locate addresses, map subdomains from certificate logs, trace redirects and
          read certificate details.
        </p>
      </div>

      <form
        className="glass-panel shadow-card flex flex-col gap-3 rounded-2xl p-5 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          intel.mutate(target);
        }}
      >
        <Input
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="example.com"
          maxLength={253}
          className="flex-1"
        />
        <Button type="submit" disabled={intel.isPending || target.trim().length < 3}>
          {intel.isPending && <Loader2 className="size-4 animate-spin" />}
          {intel.isPending ? "Looking up…" : "Run lookup"}
        </Button>
      </form>

      {report && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Addresses">
            <p className="mb-2 text-xs uppercase tracking-wide">IPv4</p>
            <List items={report.addresses.ipv4} empty="No IPv4 records." />
            <p className="mt-4 mb-2 text-xs uppercase tracking-wide">IPv6</p>
            <List items={report.addresses.ipv6} empty="No IPv6 records." />
          </Panel>

          <Panel title="Location & network">
            {report.geo.length === 0 ? (
              <p className="text-xs">No geolocation data available.</p>
            ) : (
              <div className="space-y-4">
                {report.geo.map((geo) => (
                  <div key={geo.ip} className="rounded-lg bg-muted/30 p-3">
                    <p className="font-mono text-xs text-foreground">{geo.ip}</p>
                    <p className="mt-1 text-xs">
                      {[geo.city, geo.region, geo.country].filter(Boolean).join(", ") ||
                        "Unknown location"}
                    </p>
                    <p className="mt-1 text-xs">
                      {[geo.asn, geo.org ?? geo.isp].filter(Boolean).join(" · ") || "Unknown network"}
                    </p>
                    {geo.timezone && <p className="mt-1 text-xs">Timezone: {geo.timezone}</p>}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="DNS records">
            <div className="space-y-3">
              {(
                [
                  ["CNAME", report.dns.cname],
                  ["MX", report.dns.mx],
                  ["NS", report.dns.ns],
                  ["CAA", report.dns.caa],
                  ["TXT", report.dns.txt],
                ] as const
              ).map(([label, values]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wide">{label}</p>
                  <List items={values} empty="None" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Certificate">
            {report.certificate ? (
              <div className="space-y-1 text-xs">
                <p>
                  <span className="text-foreground">Common name:</span>{" "}
                  {report.certificate.commonName}
                </p>
                <p>
                  <span className="text-foreground">Issuer:</span> {report.certificate.issuer}
                </p>
                <p>
                  <span className="text-foreground">Valid from:</span>{" "}
                  {report.certificate.validFrom ?? "—"}
                </p>
                <p>
                  <span className="text-foreground">Valid to:</span>{" "}
                  {report.certificate.validTo ?? "—"}
                </p>
                {report.certificate.expiresInDays !== null && (
                  <p className="pt-2">
                    <Badge variant={report.certificate.expiresInDays < 15 ? "destructive" : "secondary"}>
                      {report.certificate.expiresInDays < 0
                        ? "Expired"
                        : `Expires in ${report.certificate.expiresInDays} days`}
                    </Badge>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs">No certificate found in transparency logs.</p>
            )}
          </Panel>

          <Panel title="Redirect chain">
            <p className="text-xs">
              HTTPS {report.redirects.httpsReachable ? "reachable" : "unreachable"} · status{" "}
              {report.redirects.status || "—"}
            </p>
            <div className="mt-2">
              <List items={report.redirects.chain} empty="No redirects — the first response was final." />
            </div>
            <p className="mt-3 break-all font-mono text-xs text-foreground">
              {report.redirects.finalUrl}
            </p>
          </Panel>

          <Panel title={`Subdomains (${report.subdomains.length})`}>
            <p className="mb-2 text-xs">Source: {report.subdomainSource}</p>
            <div className="max-h-72 overflow-y-auto pr-2">
              <List items={report.subdomains} empty="No subdomains discovered." />
            </div>
          </Panel>

          {report.notes.length > 0 && (
            <div className="lg:col-span-2">
              <Panel title="Notes">
                <ul className="list-disc space-y-1 pl-5 text-xs">
                  {report.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </Panel>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
