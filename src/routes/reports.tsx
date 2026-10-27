import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, Trash2, FileText, ShieldCheck, Check } from "lucide-react";
import { deleteReport, listReports } from "@/lib/reports.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — CyberVault" },
      { name: "description", content: "Download branded PDF security reports generated from your scans." },
      { property: "og:title", content: "Reports — CyberVault" },
      { property: "og:description", content: "Your saved CyberVault PDF security reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listReports);
  const deleteFn = useServerFn(deleteReport);
  const reports = useQuery({ queryKey: ["reports"], queryFn: () => listFn() });

  async function download(path: string) {
    const { data, error } = await supabase.storage
      .from("security-reports")
      .createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Could not create a download link.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div className="container mx-auto max-w-5xl px-5 py-12 space-y-8">
      <div className="text-center space-y-4 pb-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <FileText className="size-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Security Reports</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
          Security is not a one-time event, but a continuous process. Professional
          reporting transforms raw data into actionable intelligence, providing the
          evidence needed for compliance audits and the roadmap needed for technical
          remediation.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {[
            { label: "Audit Ready", icon: ShieldCheck },
            { label: "Client Delivery", icon: Download },
            { label: "Compliance Proof", icon: Check },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <item.icon className="size-3" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-3">
        {(reports.data ?? []).length === 0 && (
          <li className="text-center py-12 glass-panel rounded-3xl border border-dashed border-white/20">
            <p className="text-sm text-muted-foreground">No reports generated yet. Run a scan to create one!</p>
          </li>
        )}
        {(reports.data ?? []).map((report) => (
          <li key={report.id} className="glass-panel flex items-center gap-4 rounded-2xl p-4 border border-white/5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{report.report_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(report.created_at).toLocaleString()} ·{" "}
                {Math.max(1, Math.round((report.file_size ?? 0) / 1024))} KB
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => download(report.storage_path)}>
              <Download className="size-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete report"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                const { data: userData } = supabase.auth.getUser();
                // We don't have userId here easily without a hook,
                // but the deleteFn is handled on the server side via session.
                deleteFn({ data: { id: report.id } }).then(() =>
                  queryClient.invalidateQueries({ queryKey: ["reports"] }),
                )
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
