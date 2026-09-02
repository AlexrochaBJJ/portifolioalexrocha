const SESSION_KEY = "pf_session_id";
const VISITOR_KEY = "pf_visitor_id";
const SESSION_TS = "pf_session_ts";
const SESSION_TTL = 30 * 60 * 1000;

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visit`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
};

const getSessionId = () => {
  try {
    const now = Date.now();
    const last = Number(sessionStorage.getItem(SESSION_TS) ?? 0);
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id || now - last > SESSION_TTL) {
      id = uid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    sessionStorage.setItem(SESSION_TS, String(now));
    return id;
  } catch {
    return uid();
  }
};

export type TrackPayload = {
  event_type?: string;
  path?: string;
  page_title?: string;
  label?: string;
  details?: Record<string, unknown>;
  duration_ms?: number;
};

export const track = (payload: TrackPayload) => {
  if (typeof window === "undefined") return;
  if (window.location.hostname === "localhost") return;

  const params = new URLSearchParams(window.location.search);
  const body = JSON.stringify({
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    event_type: payload.event_type ?? "pageview",
    path: payload.path ?? window.location.pathname,
    page_title: payload.page_title ?? document.title,
    label: payload.label ?? "",
    details: payload.details ?? {},
    duration_ms: payload.duration_ms ?? 0,
    referrer: document.referrer ?? "",
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
    screen_size: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language ?? "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    is_admin: window.location.pathname.startsWith("/admin"),
  });

  fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body,
    keepalive: true,
  }).catch(() => {});
};

export const trackEvent = (
  label: string,
  details: Record<string, unknown> = {},
  eventType = "action",
) => track({ event_type: eventType, label, details });
