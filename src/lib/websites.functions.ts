import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { savedWebsiteSchema, toDomain } from "@/lib/validation";
import { z } from "zod";

const idSchema = z.object({ id: z.string().uuid() });

export const listWebsites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_websites")
      .select("id, name, url, domain, monitoring_enabled, last_scan_id, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your websites.");
    return data ?? [];
  });

export const addWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const validated = savedWebsiteSchema.parse(data);
    const { error } = await context.supabase.from("saved_websites").insert({
      user_id: context.userId,
      name: validated.name,
      url: validated.url,
      domain: toDomain(validated.url),
      monitoring_enabled: validated.monitoringEnabled,
    });
    if (error) throw new Error("Could not save this website.");
    return { ok: true };
  });

export const removeWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const validated = idSchema.parse(data);
    const { error } = await context.supabase
      .from("saved_websites")
      .delete()
      .eq("id", validated.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not remove this website.");
    return { ok: true };
  });

export const toggleMonitoring = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const validated = idSchema.extend({ enabled: z.boolean() }).parse(data);
    const { error } = await context.supabase
      .from("saved_websites")
      .update({ monitoring_enabled: validated.enabled })
      .eq("id", validated.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not update monitoring.");
    return { ok: true };
  });
