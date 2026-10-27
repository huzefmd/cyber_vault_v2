import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  FileText,
  Globe,
  Lock,
  Radar,
  ScanLine,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const FEATURES = [
  {
    number: "01",
    icon: Radar,
    title: "Website Security",
    description:
      "Discover weaknesses across TLS, security headers, cookies, redirects and exposed technologies.",
    checks: [
      "TLS & SSL analysis",
      "Security headers",
      "Cookie configuration",
      "Technology exposure",
    ],
  },
  {
    number: "02",
    icon: ShieldAlert,
    title: "AI Phishing Detection",
    description:
      "Analyze suspicious URLs and classify them as Safe, Suspicious or Malicious with confidence scoring.",
    checks: [
      "URL intelligence",
      "Threat indicators",
      "AI classification",
      "Confidence scoring",
    ],
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Automated Remediation",
    description:
      "Turn technical findings into a prioritized action plan your team can actually follow.",
    checks: [
      "Risk prioritization",
      "Fix recommendations",
      "Issue tracking",
      "Security score",
    ],
  },
];

const SECURITY_CHECKS = [
  "TLS / SSL",
  "Security Headers",
  "HSTS",
  "Cookies",
  "Redirect Chains",
  "Technology Exposure",
];

const STATS = [
  { value: "100", label: "Security score" },
  { value: "24/7", label: "Threat visibility" },
  { value: "AI", label: "Phishing analysis" },
  { value: "PDF", label: "Client-ready reports" },
];

function ScanPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Ambient glow */}
      <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-[#080d13] shadow-2xl"
      >
        {/* Browser header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-yellow-400/70" />
            <span className="size-2.5 rounded-full bg-green-400/70" />
          </div>

          <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-white/40 sm:flex">
            <Lock className="size-3" />
            app.cybervault.security
          </div>

          <div className="w-10" />
        </div>

        {/* Dashboard */}
        <div className="grid lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <div className="hidden border-r border-white/10 p-4 lg:block">
            <div className="mb-7 text-xs font-medium uppercase tracking-widest text-white/30">
              Security
            </div>

            <div className="space-y-1">
              {[
                { icon: BarChart3, text: "Overview", active: true },
                { icon: Globe, text: "Websites" },
                { icon: ScanLine, text: "Scans" },
                { icon: ShieldAlert, text: "Phishing" },
                { icon: FileText, text: "Reports" },
              ].map((item) => (
                <div
                  key={item.text}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs ${item.active
                    ? "bg-primary/10 text-primary"
                    : "text-white/40"
                    }`}
                >
                  <item.icon className="size-4" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  Security Overview
                </p>
                <h3 className="mt-1 text-lg font-medium text-white">
                  example.com
                </h3>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Scan complete
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {/* Score */}
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:col-span-1">
                <p className="text-xs text-white/40">Security Score</p>

                <div className="mt-5 flex items-center justify-center">
                  <div className="relative flex size-32 items-center justify-center rounded-full border-[10px] border-primary/20">
                    <div className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-t-primary border-r-primary" />

                    <div className="text-center">
                      <div className="text-4xl font-semibold text-white">
                        87
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-white/30">
                        / 100
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Good posture
                  </span>
                </div>
              </div>

              {/* Checks */}
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40">Security checks</p>
                  <span className="text-xs text-white/30">6 checks</span>
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    ["TLS / SSL", "Secure", "success"],
                    ["Security Headers", "Secure", "success"],
                    ["HSTS", "Secure", "success"],
                    ["Cookies", "Needs attention", "warning"],
                    ["Redirect Chain", "Secure", "success"],
                    ["Technology Exposure", "Secure", "success"],
                  ].map(([name, status, type]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex size-5 items-center justify-center rounded-full ${type === "success"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-yellow-400/10 text-yellow-400"
                            }`}
                        >
                          {type === "success" ? (
                            <Check className="size-3" />
                          ) : (
                            <ShieldAlert className="size-3" />
                          )}
                        </span>

                        <span className="text-xs text-white/70">
                          {name}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] ${type === "success"
                          ? "text-emerald-400"
                          : "text-yellow-400"
                          }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom metrics */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Critical", "0"],
                ["High", "2"],
                ["Medium", "4"],
                ["Low", "3"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-medium text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#05080c] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,200,255,0.10),transparent_35%)]" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:50px_50px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05080c]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5">
          <Link to="/">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <Link
              to="/scanner"
              className="text-sm text-white/55 transition hover:text-white"
            >
              Scanner
            </Link>

            <Link
              to="/phishing"
              className="text-sm text-white/55 transition hover:text-white"
            >
              Phishing
            </Link>

            <Link
              to="/reports"
              className="text-sm text-white/55 transition hover:text-white"
            >
              Reports
            </Link>

            <Link
              to="/analytics"
              className="text-sm text-white/55 transition hover:text-white"
            >
              Analytics
            </Link>

            <Link
              to="/pricing"
              className="text-sm text-white/55 transition hover:text-white"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-white text-black hover:bg-white/90"
            >
              <Link to="/auth" search={{ mode: "register" }}>
                Get started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 sm:pb-32 sm:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-xs text-primary">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                AI-powered website security
                <ChevronRight className="size-3" />
              </div>

              <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[84px]">
                Find vulnerabilities
                <br />
                <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                  before attackers do.
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
                CyberVault continuously analyzes your web surface,
                detects phishing threats with AI, and transforms security
                findings into clear actions your team can take.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="group bg-primary px-6 text-primary-foreground shadow-[0_0_35px_rgba(0,180,255,0.18)] hover:bg-primary/90"
                >
                  <Link to="/auth" search={{ mode: "register" }}>
                    Start scanning free
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/10 bg-white/[0.03] px-6 text-white hover:bg-white/[0.07]"
                >
                  <Link to="/scanner">
                    Explore scanner
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Terminal strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mx-auto mt-16 flex max-w-xl items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white/35"
            >
              <Terminal className="size-3.5 text-primary" />
              <span className="text-primary">$</span>
              <span>cybervault scan https://yourwebsite.com</span>
              <span className="ml-auto hidden text-emerald-400 sm:block">
                ready
              </span>
            </motion.div>

            {/* Dashboard preview */}
            <div className="mt-12">
              <ScanPreview />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/[0.06] sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="px-5 py-8 text-center sm:py-10"
              >
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-white/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* INTRO */}
        <section className="mx-auto max-w-7xl px-5 py-28 sm:py-36">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                One security platform
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Security visibility without the complexity.
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-white/40 lg:ml-auto">
              From the first scan to the final remediation report,
              CyberVault gives developers, security teams and businesses
              a clear picture of their security posture.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group bg-[#080d13] p-7 transition hover:bg-[#0b1118] sm:p-9"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06] text-primary">
                    <feature.icon className="size-5" />
                  </div>

                  <span className="font-mono text-xs text-white/20">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-medium">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  {feature.description}
                </p>

                <div className="mt-7 space-y-2.5">
                  {feature.checks.map((check) => (
                    <div
                      key={check}
                      className="flex items-center gap-2 text-xs text-white/55"
                    >
                      <Check className="size-3.5 text-primary" />
                      {check}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-1 text-xs text-primary opacity-70 transition group-hover:opacity-100">
                  Learn more
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* SCANNING */}
        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid max-w-7xl gap-16 px-5 py-28 lg:grid-cols-2 lg:items-center lg:py-36">
            <div>
              <div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary">
                <ScanLine className="size-5" />
              </div>

              <p className="mt-7 text-xs uppercase tracking-[0.2em] text-primary">
                Automated scanning
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                See your entire web surface at a glance.
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/40">
                CyberVault performs read-only security probes against
                your authorized websites and converts technical signals
                into an easy-to-understand security score.
              </p>

              <Button
                asChild
                className="mt-8 bg-white text-black hover:bg-white/90"
              >
                <Link to="/scanner">
                  Explore security scanner
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative rounded-2xl border border-white/10 bg-[#080d13] p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Globe className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm">yourwebsite.com</p>
                      <p className="text-[10px] text-white/30">
                        Last scanned 2 minutes ago
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-400">
                    Healthy
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  {SECURITY_CHECKS.map((check, index) => (
                    <div key={check}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-white/60">{check}</span>
                        <span className="text-emerald-400">
                          {index === 3 ? "72%" : "100%"}
                        </span>
                      </div>

                      <div className="h-1 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: index === 3 ? "72%" : "100%",
                          }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.8,
                            delay: index * 0.08,
                          }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PHISHING */}
        <section className="mx-auto max-w-7xl px-5 py-28 sm:py-36">
          <div className="rounded-3xl border border-white/[0.08] bg-[#080d13] p-7 sm:p-12 lg:p-16">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="flex size-11 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.05] text-red-400">
                  <ShieldAlert className="size-5" />
                </div>

                <p className="mt-7 text-xs uppercase tracking-[0.2em] text-red-400">
                  AI threat intelligence
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Is that URL really safe?
                </h2>

                <p className="mt-5 text-base leading-7 text-white/40">
                  Analyze suspicious links before they become a problem.
                  CyberVault evaluates URL characteristics and threat
                  indicators to provide a clear risk classification.
                </p>

                <Link
                  to="/phishing"
                  className="mt-8 inline-flex items-center gap-2 text-sm text-primary"
                >
                  Explore phishing detection
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* Phishing result */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-7">
                <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                  <Search className="size-4 text-white/30" />
                  <span className="truncate font-mono text-xs text-white/40">
                    https://secure-login-example.com
                  </span>
                </div>

                <div className="py-8 text-center">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/5">
                    <ShieldAlert className="size-8 text-yellow-400" />
                  </div>

                  <p className="mt-5 text-xs uppercase tracking-[0.2em] text-yellow-400">
                    Suspicious
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    94%
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    confidence score
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    "Suspicious domain structure",
                    "Potential impersonation pattern",
                    "Unusual URL characteristics",
                  ].map((indicator) => (
                    <div
                      key={indicator}
                      className="flex items-center gap-3 rounded-lg border border-yellow-400/10 bg-yellow-400/[0.03] p-3 text-xs text-white/50"
                    >
                      <ShieldAlert className="size-3.5 text-yellow-400" />
                      {indicator}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-5 py-28 sm:py-36">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                How it works
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                From scan to solution.
              </h2>
            </div>

            <div className="mt-16 grid gap-5 md:grid-cols-4">
              {[
                {
                  number: "01",
                  icon: Globe,
                  title: "Enter URL",
                  text: "Add a website you own or are authorized to test.",
                },
                {
                  number: "02",
                  icon: Radar,
                  title: "Scan",
                  text: "CyberVault performs read-only security probes.",
                },
                {
                  number: "03",
                  icon: ShieldCheck,
                  title: "Analyze",
                  text: "Findings are scored and prioritized by risk.",
                },
                {
                  number: "04",
                  icon: Zap,
                  title: "Fix",
                  text: "Follow clear remediation steps and generate reports.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-white/[0.08] bg-[#080d13] p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <step.icon className="size-4" />
                    </div>

                    <span className="font-mono text-xs text-white/20">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 font-medium">{step.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-white/35">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REPORTS */}
        <section className="mx-auto max-w-7xl px-5 py-28 sm:py-36">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl border border-white/10 bg-[#080d13] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs text-white/30">SECURITY REPORT</p>
                    <p className="mt-1 font-medium">
                      example.com
                    </p>
                  </div>

                  <FileText className="size-5 text-primary" />
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    ["Score", "87"],
                    ["Issues", "9"],
                    ["Critical", "0"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center"
                    >
                      <p className="text-xl font-semibold">{value}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-wider text-white/30">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg bg-white/[0.025] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="size-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-28 rounded bg-white/10" />
                      </div>

                      <div className="h-2 w-12 rounded bg-white/5" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-lg bg-primary/[0.05] p-4">
                  <span className="text-xs text-white/50">
                    Generated security report
                  </span>
                  <span className="text-xs text-primary">
                    PDF
                  </span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.05] text-primary">
                <FileText className="size-5" />
              </div>

              <p className="mt-7 text-xs uppercase tracking-[0.2em] text-primary">
                Professional reporting
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Turn technical findings into reports people understand.
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/40">
                Generate branded PDF security reports with scores,
                vulnerabilities, risk levels and remediation guidance.
                Perfect for audits, internal reviews and client delivery.
              </p>

              <Button
                asChild
                variant="outline"
                className="mt-8 border-white/10 bg-white/[0.03]"
              >
                <Link to="/reports">
                  Explore reporting
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative border-t border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,255,0.10),transparent_55%)]" />

          <div className="relative mx-auto max-w-4xl px-5 py-28 text-center sm:py-36">
            <Shield className="mx-auto size-10 text-primary" />

            <h2 className="mt-7 text-4xl font-semibold tracking-tight sm:text-6xl">
              Your website is already
              <br />
              part of the attack surface.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/40">
              Don't wait for an incident to discover what's exposed.
              Scan your website and understand your security posture today.
            </p>

            <Button
              asChild
              size="lg"
              className="mt-9 bg-white px-7 text-black hover:bg-white/90"
            >
              <Link to="/auth" search={{ mode: "register" }}>
                Start scanning free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>

            <p className="mt-5 text-xs text-white/25">
              Read-only scans · Scan only properties you are authorized to test
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo />

              <p className="mt-4 max-w-xs text-sm leading-6 text-white/30">
                AI-powered website security and phishing intelligence
                for modern teams.
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                Product
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  to="/scanner"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Security Scanner
                </Link>

                <Link
                  to="/phishing"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Phishing Detection
                </Link>

                <Link
                  to="/reports"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Reports
                </Link>

                <Link
                  to="/analytics"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Analytics
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                Resources
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  to="/resources"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Resources
                </Link>

                <Link
                  to="/docs"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Documentation
                </Link>

                <Link
                  to="/pricing"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Pricing
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                Company
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  to="/about"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  About
                </Link>

                <Link
                  to="/contact"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Contact
                </Link>

                <Link
                  to="/auth"
                  className="block text-sm text-white/30 hover:text-white"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-7 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} CyberVault. All rights reserved.
            </p>

            <p>
              Only scan websites and systems you are authorized to test.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
