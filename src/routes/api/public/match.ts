import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Candidate = { i: number; name: string; artists: string; album: string; year?: string; ms?: number };

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/public/match")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: { title?: string; artist?: string; candidates?: Candidate[] };
        try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
        const title = String(body.title ?? "").slice(0, 300);
        const artist = String(body.artist ?? "").slice(0, 200);
        const candidates = (Array.isArray(body.candidates) ? body.candidates : []).slice(0, 15);
        if (!title || !candidates.length) return json({ error: "title and candidates required" }, 400);

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return json({ error: "AI is not configured" }, 500);

        const list = candidates
          .map((c, idx) => `${idx}. "${String(c.name).slice(0, 150)}" — ${String(c.artists).slice(0, 150)} | album: ${String(c.album).slice(0, 150)}${c.year ? ` (${c.year})` : ""}${c.ms ? ` | ${Math.round(c.ms / 1000)}s` : ""}`)
          .join("\n");

        const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            stream: true,
            store: false,
            reasoning: { effort: "low" },
            instructions:
              "You match a YouTube/SoundCloud video to the correct Spotify track. Pick the candidate that is the same song AND the same version: if the video is a remix, live, acoustic, sped up, slowed, cover or remaster, prefer that exact version; otherwise prefer the original studio version by the original artist over covers, karaoke, tributes or remixes. Channel names like 'XVEVO' or 'X - Topic' indicate artist X. Return index -1 if none is the same song.",
            input: `Video title: ${title}\nChannel/artist: ${artist || "unknown"}\n\nSpotify candidates:\n${list}`,
            text: {
              format: {
                type: "json_schema",
                name: "match",
                strict: true,
                schema: {
                  type: "object",
                  additionalProperties: false,
                  required: ["index", "confidence", "reason"],
                  properties: {
                    index: { type: "integer" },
                    confidence: { type: "string", enum: ["high", "medium", "low"] },
                    reason: { type: "string" },
                  },
                },
              },
            },
          }),
          signal: request.signal,
        });
        if (!r.ok || !r.body) {
          const t = await r.text().catch(() => "");
          let msg = "AI request failed";
          try { msg = JSON.parse(t).error?.message || JSON.parse(t).message || msg; } catch {}
          return json({ error: msg }, r.status);
        }

        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = "", out = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const l of lines) {
            if (!l.startsWith("data:")) continue;
            const d = l.slice(5).trim();
            if (!d || d === "[DONE]") continue;
            try {
              const ev = JSON.parse(d);
              if (ev.type === "response.output_text.delta") out += ev.delta;
              if (ev.type === "error" || ev.type === "response.failed") return json({ error: ev.error?.message || ev.response?.error?.message || "AI failed" }, 502);
            } catch {}
          }
        }
        try {
          const m = JSON.parse(out);
          const index = Number.isInteger(m.index) && m.index < candidates.length ? m.index : -1;
          return json({ index, confidence: m.confidence, reason: m.reason });
        } catch {
          return json({ error: "AI gave no answer" }, 502);
        }
      },
    },
  },
});
