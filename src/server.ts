import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.message.includes('Missing Supabase environment variable')) {
        return new Response(`
          <!doctype html>
          <html>
            <body style="font-family: sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; text-align: center; padding: 2rem;">
              <div style="max-width: 600px; border: 1px solid #ddd; padding: 2rem; border-radius: 1rem; background: #fff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                <h1 style="color: #e11d48; margin-top: 0;">Configuration Error</h1>
                <p style="color: #4b5563; line-height: 1.5;">The server is missing required Supabase environment variables.</p>
                <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; text-align: left; font-family: monospace; font-size: 0.875rem; color: #1f2937; margin: 1.5rem 0;">
                  ${error.message}
                </div>
                <p style="font-size: 0.875rem; color: #6b7280;">Check your <b>.env</b> file and ensure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are set correctly.</p>
              </div>
            </body>
          </html>
        `, {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
