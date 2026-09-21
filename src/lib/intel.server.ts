import { guardOutboundUrl, safeFetch } from "./security.server";

/**
 * IP address intelligence: DNS resolution, geolocation, certificate transparency
 * subdomain discovery, redirect chain tracing and leaf certificate details.
 * All lookups are read-only and use public APIs that require no credentials.
 */

const LOOKUP_TIMEOUT_MS = 10_000;

async function jsonFetch<T>(url: string, headers?: Record<string, string>): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", ...headers },
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

interface DnsAnswer {
  name: string;
  type: number;
  TTL?: number;
  data: string;
}

async function resolve(name: string, type: string): Promise<DnsAnswer[]> {
  const result = await jsonFetch<{ Answer?: DnsAnswer[] }>(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { accept: "application/dns-json" },
  );
  return result?.Answer ?? [];
}

export interface IpGeo {
  ip: string;
  type: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  asn: string | null;
  org: string | null;
  isp: string | null;
  timezone: string | null;
}

export interface CertificateInfo {
  issuer: string;
  commonName: string;
  validFrom: string | null;
  validTo: string | null;
  expiresInDays: number | null;
}

export interface IntelReport {
  host: string;
  resolvedAt: string;
  addresses: { ipv4: string[]; ipv6: string[] };
  dns: {
    cname: string[];
    mx: string[];
    ns: string[];
    txt: string[];
    caa: string[];
    dnssec: boolean;
  };
  geo: IpGeo[];
  subdomains: string[];
  subdomainSource: string;
  redirects: { chain: string[]; finalUrl: string; status: number; httpsReachable: boolean };
  certificate: CertificateInfo | null;
  notes: string[];
}

function stripQuotes(value: string): string {
  return value.replace(/^"|"$/g, "").trim();
}

async function geolocate(ip: string): Promise<IpGeo | null> {
  const data = await jsonFetch<{
    success?: boolean;
    ip?: string;
    type?: string;
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    connection?: { asn?: number; org?: string; isp?: string };
    timezone?: { id?: string };
  }>(`https://ipwho.is/${encodeURIComponent(ip)}`);

  if (!data || data.success === false) return null;
  return {
    ip,
    type: data.type ?? null,
    country: data.country ?? null,
    region: data.region ?? null,
    city: data.city ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    asn: data.connection?.asn ? `AS${data.connection.asn}` : null,
    org: data.connection?.org ?? null,
    isp: data.connection?.isp ?? null,
    timezone: data.timezone?.id ?? null,
  };
}

async function certificateTransparency(
  domain: string,
): Promise<{ subdomains: string[]; certificate: CertificateInfo | null }> {
  const rows = await jsonFetch<
    {
      name_value?: string;
      common_name?: string;
      issuer_name?: string;
      not_before?: string;
      not_after?: string;
    }[]
  >(`https://crt.sh/?q=${encodeURIComponent(`%.${domain}`)}&output=json&exclude=expired`);

  if (!Array.isArray(rows) || rows.length === 0) return { subdomains: [], certificate: null };

  const names = new Set<string>();
  for (const row of rows.slice(0, 400)) {
    for (const raw of (row.name_value ?? "").split("\n")) {
      const value = raw.trim().toLowerCase().replace(/^\*\./, "");
      if (value.endsWith(domain) && value !== domain) names.add(value);
    }
  }

  const newest = rows
    .filter((row) => row.not_after)
    .sort((a, b) => Date.parse(b.not_before ?? "") - Date.parse(a.not_before ?? ""))[0];

  let certificate: CertificateInfo | null = null;
  if (newest) {
    const notAfter = newest.not_after ? Date.parse(`${newest.not_after}Z`) : NaN;
    certificate = {
      issuer:
        (newest.issuer_name ?? "").match(/O=([^,]+)/)?.[1]?.trim() ??
        newest.issuer_name ??
        "Unknown",
      commonName: newest.common_name ?? domain,
      validFrom: newest.not_before ?? null,
      validTo: newest.not_after ?? null,
      expiresInDays: Number.isNaN(notAfter)
        ? null
        : Math.round((notAfter - Date.now()) / 86_400_000),
    };
  }

  return { subdomains: [...names].sort().slice(0, 150), certificate };
}

export async function runIntel(rawTarget: string): Promise<IntelReport> {
  const candidate = /^https?:\/\//i.test(rawTarget) ? rawTarget : `https://${rawTarget}`;
  const guard = guardOutboundUrl(candidate);
  if (!guard.ok) throw new Error(guard.reason);

  const host = guard.url.hostname.toLowerCase();
  const notes: string[] = [];

  const [a, aaaa, cname, mx, ns, txt, caa] = await Promise.all([
    resolve(host, "A"),
    resolve(host, "AAAA"),
    resolve(host, "CNAME"),
    resolve(host, "MX"),
    resolve(host, "NS"),
    resolve(host, "TXT"),
    resolve(host, "CAA"),
  ]);

  const ipv4 = a.filter((r) => r.type === 1).map((r) => r.data);
  const ipv6 = aaaa.filter((r) => r.type === 28).map((r) => r.data);

  if (ipv4.length === 0 && ipv6.length === 0) {
    notes.push("No A or AAAA records were returned — the hostname may not resolve publicly.");
  }

  const [geoResults, ct] = await Promise.all([
    Promise.all([...ipv4, ...ipv6].slice(0, 4).map(geolocate)),
    certificateTransparency(host.replace(/^www\./, "")),
  ]);

  let redirects = {
    chain: [] as string[],
    finalUrl: guard.url.toString(),
    status: 0,
    httpsReachable: false,
  };
  try {
    const response = await safeFetch(`https://${guard.url.host}${guard.url.pathname}`);
    redirects = {
      chain: response.redirects,
      finalUrl: response.finalUrl,
      status: response.status,
      httpsReachable: true,
    };
  } catch {
    notes.push("The host did not answer an HTTPS request, so no redirect chain was traced.");
  }

  if (ct.subdomains.length === 0) {
    notes.push("Certificate transparency returned no subdomains for this domain.");
  }

  return {
    host,
    resolvedAt: new Date().toISOString(),
    addresses: { ipv4, ipv6 },
    dns: {
      cname: cname.filter((r) => r.type === 5).map((r) => r.data),
      mx: mx.filter((r) => r.type === 15).map((r) => r.data),
      ns: ns.filter((r) => r.type === 2).map((r) => r.data),
      txt: txt.filter((r) => r.type === 16).map((r) => stripQuotes(r.data)).slice(0, 12),
      caa: caa.filter((r) => r.type === 257).map((r) => r.data),
      dnssec: caa.length > 0 || ns.length > 0 ? ns.some((r) => r.type === 46) : false,
    },
    geo: geoResults.filter((g): g is IpGeo => g !== null),
    subdomains: ct.subdomains,
    subdomainSource: "crt.sh certificate transparency logs",
    redirects,
    certificate: ct.certificate,
    notes,
  };
}
