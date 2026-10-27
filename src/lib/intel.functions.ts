import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runIntel } from "@/lib/intel.server";

const intelSchema = z.object({
  target: z.string().trim().min(3).max(253),
});

export const lookupIntel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const validated = intelSchema.parse(data);
    return runIntel(validated.target);
  });
