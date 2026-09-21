import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runIntel } from "@/lib/intel.server";

const intelSchema = z.object({
  target: z.string().trim().min(3).max(253),
});

export const lookupIntel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => intelSchema.parse(input))
  .handler(async ({ data }) => runIntel(data.target));
