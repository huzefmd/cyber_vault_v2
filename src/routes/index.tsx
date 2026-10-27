import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "CyberVault — AI Website Security & Phishing Detection",
      },
      {
        name: "description",
        content:
          "CyberVault scans websites for security weaknesses, detects phishing URLs with AI, prioritizes remediation, and generates professional security reports.",
      },
      {
        property: "og:title",
        content: "CyberVault — AI Website Security Platform",
      },
      {
        property: "og:description",
        content:
          "Scan websites, detect threats, fix vulnerabilities and monitor your security posture.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  component: Landing,
});
