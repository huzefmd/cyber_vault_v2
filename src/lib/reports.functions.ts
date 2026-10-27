import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("security_reports")
      .select("id, report_name, storage_path, file_size, scan_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("Could not load reports.");
    return data ?? [];
  });

export const recordReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const validated = z
      .object({
        reportName: z.string().trim().min(1).max(160),
        storagePath: z.string().trim().min(1).max(400),
        fileSize: z.number().int().nonnegative(),
        scanId: z.string().uuid().nullable().optional(),
      })
      .parse(data);

    const { error } = await context.supabase.from("security_reports").insert({
      user_id: context.userId,
      report_name: validated.reportName,
      storage_path: validated.storagePath,
      file_size: validated.fileSize,
      scan_id: validated.scanId ?? null,
    });
    if (error) throw new Error("Could not save the report record.");
    return { ok: true };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const validated = z.object({ id: z.string().uuid() }).parse(data);
    const { data: row } = await context.supabase
      .from("security-reports")
      .select("storage_path")
      .eq("id", validated.id)
      .maybeSingle();
    if (row?.storage_path) {
      await context.supabase.storage.from("security-reports").remove([row.storage_path]);
    }
    const { error } = await context.supabase
      .from("security-reports")
      .delete()
      .eq("id", validated.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not delete the report.");
    return { ok: true };
  });
