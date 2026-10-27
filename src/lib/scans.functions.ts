import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scanRequestSchema } from "@/lib/validation";
import { runScan } from "@/lib/scanner.server";
import { buildRecommendations } from "@/lib/recommendations.server";

export const startScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const validated = scanRequestSchema.parse(data);
    const { supabase, userId } = context;

    const result = await runScan(validated.url);

    const { data: scan, error: scanError } = await supabase
      .from("website_scans")
      .insert({
        user_id: userId,
        saved_website_id: validated.savedWebsiteId ?? null,
        url: result.url,
        domain: result.domain,
        status: "completed" as const,
        security_score: result.securityScore,
        risk_level: result.riskLevel,
        ssl_status: result.sslStatus,
        scan_started_at: new Date().toISOString(),
        scan_completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (scanError || !scan) {
      console.error("Failed to persist scan");
      throw new Error("The scan finished but could not be saved. Please try again.");
    }

    const findingRows = result.findings.map((finding) => ({
      scan_id: scan.id,
      category: finding.category,
      title: finding.title,
      description: finding.description,
      severity: finding.severity,
      evidence: finding.evidence,
      recommendation: finding.recommendation,
    }));
    if (findingRows.length > 0) {
      await supabase.from("security_findings").insert(findingRows);
    }

    const eventRows = result.events.map((event) => ({
      scan_id: scan.id,
      event_type: event.eventType,
      message: event.message,
    }));
    if (eventRows.length > 0) {
      await supabase.from("scan_events").insert(eventRows);
    }

    const recommendations = buildRecommendations(result).map((rec) => ({
      user_id: userId,
      scan_id: scan.id,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
    }));
    if (recommendations.length > 0) {
      await supabase.from("ai_recommendations").insert(recommendations);
    }

    if (validated.savedWebsiteId) {
      await supabase
        .from("saved_websites")
        .update({ last_scan_id: scan.id })
        .eq("id", validated.savedWebsiteId)
        .eq("user_id", userId);
    }

    return {
      scanId: scan.id,
      securityScore: result.securityScore,
      riskLevel: result.riskLevel,
      sslStatus: result.sslStatus,
      simulated: result.simulated,
      findingCount: result.findings.length,
    };
  });
