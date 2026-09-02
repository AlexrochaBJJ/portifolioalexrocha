import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");

const parseUa = (ua: string) => {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : /Firefox\//.test(ua)
            ? "Firefox"
            : "Outro";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Outro";
  const device = /iPad|Tablet/.test(ua)
    ? "Tablet"
    : /Mobi|Android|iPhone/.test(ua)
      ? "Celular"
      : "Computador";
  return { browser, os, device };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const ua = req.headers.get("user-agent") ?? "";
    const { browser, os, device } = parseUa(ua);
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    const ipHint = ip ? ip.split(".").slice(0, 2).join(".") + ".x.x" : "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { error } = await supabase.from("analytics_events").insert({
      session_id: str(body.session_id, 80) || crypto.randomUUID(),
      visitor_id: str(body.visitor_id, 80),
      event_type: str(body.event_type, 40) || "pageview",
      path: str(body.path, 300) || "/",
      page_title: str(body.page_title, 200),
      label: str(body.label, 200),
      details: typeof body.details === "object" && body.details ? body.details : {},
      referrer: str(body.referrer, 400),
      utm_source: str(body.utm_source, 120) || null,
      utm_medium: str(body.utm_medium, 120) || null,
      utm_campaign: str(body.utm_campaign, 120) || null,
      user_agent: ua.slice(0, 500),
      browser,
      os,
      device_type: device,
      screen_size: str(body.screen_size, 40),
      language: str(body.language, 40) || req.headers.get("accept-language")?.slice(0, 40) || "",
      timezone: str(body.timezone, 80),
      country: req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "",
      region: req.headers.get("x-vercel-ip-country-region") ?? "",
      city: req.headers.get("x-vercel-ip-city") ?? "",
      ip_hint: ipHint,
      duration_ms: Number.isFinite(body.duration_ms) ? Math.max(0, Math.min(86400000, Math.round(body.duration_ms))) : 0,
      is_admin: body.is_admin === true,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
