import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, ShieldCheck, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Security Analytics — CyberVault" },
      {
        name: "description",
        content: "Track your security posture over time with detailed analytics and threat trends.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-5 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Security Analytics</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time visibility into your attack surface and security trends.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Average Security Score", value: "84", icon: BarChart3, color: "text-primary" },
          { label: "Threats Blocked", value: "1,284", icon: ShieldCheck, color: "text-emerald-400" },
          { label: "Scan Velocity", value: "12/day", icon: Zap, color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-6">
        <Globe className="mx-auto size-12 text-primary opacity-50" />
        <h2 className="text-2xl font-semibold">Advanced Insights</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Detailed trend analysis and historical data are available for authenticated users.
        </p>
        <Button asChild>
          <Link to="/auth">Sign in to view full analytics</Link>
        </Button>
      </div>
    </div>
  );
}
