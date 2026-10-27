import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CyberVault" },
      {
        name: "description",
        content: "Choose the right plan for your security needs.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for individual developers and hobbyists.",
      features: ["5 scans per month", "Basic security checks", "PDF report export", "Community support"],
      cta: "Current Plan",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$29",
      description: "Ideal for small teams and startups.",
      features: ["Unlimited scans", "Advanced AI phishing detection", "Priority support", "API access", "Historical trends"],
      cta: "Get Pro",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored security for large organizations.",
      features: ["Dedicated account manager", "Custom SLAs", "SSO & SAML", "On-premise deployment options", "Advanced auditing"],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-5 py-24 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional security tools for every stage of growth.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-8 rounded-3xl border transition-all hover:scale-[1.02] ${
              plan.highlight
                ? "bg-primary/5 border-primary shadow-[0_0_40px_rgba(0,180,255,0.1)]"
                : "bg-[#080d13] border-white/10"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                Most Popular
              </div>
            )}
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground text-sm">/mo</span>}
              </div>
              <p className="text-sm text-muted-foreground pt-2">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                  <Check className="size-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              asChild
              className={`w-full py-6 ${
                plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <Link to="/auth" search={{ mode: "register" }}>
                {plan.cta}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
