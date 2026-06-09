import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "..", "dist", "server", "server.js");

async function loadServer() {
  const serverModule = await import(serverPath);
  return (serverModule.default ?? serverModule) as { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> };
}

function makeRequest(req: any) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const url = `${protocol}://${host}${req.url}`;
  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers || {})) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => headers.append(name, String(v)));
    } else {
      headers.set(name, String(value));
    }
  }

  return new Request(url, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    duplex: "half" as any,
  });
}

export default async function handler(req: any, res: any) {
  const server = await loadServer();
  const request = makeRequest(req);
  const response = await server.fetch(request, {}, {});

  res.statusCode = response.status;
  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}
