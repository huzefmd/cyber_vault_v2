import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw redirect({ to: "/auth", search: { redirect: location.href } });
      }
      return { user: data.user };
    } catch (e) {
      if (e.status && e.status !== 500) throw e;
      console.error("[Auth Route] beforeLoad error:", e);
      throw redirect({ to: "/auth", search: { redirect: location.href, error: "Session expired or invalid" } });
    }
  },
  component: () => (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  ),
});
