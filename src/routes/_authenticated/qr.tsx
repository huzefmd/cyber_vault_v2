import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, QrCode, Upload } from "lucide-react";
import jsQR from "jsqr";
import { analyzePhishing } from "@/lib/phishing.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/qr")({
  head: () => ({
    meta: [
      { title: "QR code security scanner — CyberVault" },
      {
        name: "description",
        content:
          "Decode a QR code image, reveal its hidden destination and check the link for phishing before you open it.",
      },
      { property: "og:title", content: "QR code security scanner — CyberVault" },
      {
        property: "og:description",
        content: "Reveal where a QR code really points and check it for phishing first.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QrPage,
});

async function decodeQr(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, width, height);
  const image = ctx.getImageData(0, 0, width, height);
  bitmap.close();
  return jsQR(image.data, width, height)?.data ?? null;
}

function toneFor(classification: string) {
  if (classification === "Malicious") return "destructive" as const;
  if (classification === "Suspicious") return "secondary" as const;
  return "default" as const;
}

function QrPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [payload, setPayload] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);
  const analyzeFn = useServerFn(analyzePhishing);

  const analysis = useMutation({
    mutationFn: (url: string) => analyzeFn({ data: { url } }),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Check failed"),
  });

  async function handleFile(file: File) {
    setDecoding(true);
    analysis.reset();
    setPayload(null);
    setPreview(URL.createObjectURL(file));
    try {
      const text = await decodeQr(file);
      if (!text) {
        toast.error("No QR code could be read from that image.");
        return;
      }
      setPayload(text);
      if (/^https?:\/\//i.test(text) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(text)) {
        analysis.mutate(text);
      } else {
        toast.info("The QR code does not contain a web link, so no phishing check was run.");
      }
    } catch {
      toast.error("That file could not be read as an image.");
    } finally {
      setDecoding(false);
    }
  }

  const result = analysis.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">QR code security scanner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a QR code image to reveal its destination and check it for phishing before opening
          it.
        </p>
      </div>

      <div
        className="glass-panel shadow-card flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 p-10 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
      >
        <QrCode className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          Drop a screenshot or photo of a QR code here, or choose a file.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={decoding}>
          {decoding ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {decoding ? "Decoding…" : "Choose image"}
        </Button>
      </div>

      {(preview || payload) && (
        <section className="glass-panel shadow-card flex flex-wrap items-start gap-6 rounded-2xl p-6">
          {preview && (
            <img
              src={preview}
              alt="Uploaded QR code"
              className="size-32 rounded-xl border border-border/60 object-contain"
            />
          )}
          <div className="min-w-[240px] flex-1 space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Decoded content</p>
            <p className="break-all font-mono text-sm">{payload ?? "—"}</p>
            {payload && /^https?:\/\//i.test(payload) && (
              <p className="text-xs text-muted-foreground">
                Destination host: {(() => {
                  try {
                    return new URL(payload).hostname;
                  } catch {
                    return "unknown";
                  }
                })()}
              </p>
            )}
          </div>
        </section>
      )}

      {analysis.isPending && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Checking the destination…
        </p>
      )}

      {result && (
        <section className="glass-panel shadow-card space-y-4 rounded-2xl p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={toneFor(result.classification)}>{result.classification}</Badge>
            <span className="text-sm text-muted-foreground">
              Confidence {Math.round(result.confidenceScore)}%
            </span>
            {result.simulated && (
              <span className="text-xs text-muted-foreground">Heuristic analysis</span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{result.explanation}</p>
          {result.threatIndicators.length > 0 && (
            <div>
              <p className="text-sm font-semibold">Threat indicators</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.threatIndicators.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.recommendations.length > 0 && (
            <div>
              <p className="text-sm font-semibold">What to do</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
