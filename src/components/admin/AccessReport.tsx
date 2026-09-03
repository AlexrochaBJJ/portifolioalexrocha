import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  Download,
  Eye,
  Globe2,
  Loader2,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type EventRow = {
  id: string;
  session_id: string;
  visitor_id: string;
  event_type: string;
  path: string;
  page_title: string;
  label: string;
  details: Record<string, unknown> | null;
  referrer: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  browser: string;
  os: string;
  device_type: string;
  screen_size: string;
  language: string;
  timezone: string;
  country: string;
  city: string;
  ip_hint: string;
  duration_ms: number;
  is_admin: boolean;
  created_at: string;
};

const RANGES = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
  { label: "1 ano", days: 365 },
];

const fmtDuration = (ms: number) => {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const count = (rows: EventRow[], key: (r: EventRow) => string) => {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = key(r) || "—";
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};

const Stat = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div className="glass-card rounded-xl p-4">
    <div className="flex items-center gap-2 text-muted-foreground mb-2">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs font-body">{label}</span>
    </div>
    <p className="text-2xl font-bold font-heading">{value}</p>
    {hint && <p className="text-[11px] text-muted-foreground font-body mt-1">{hint}</p>}
  </div>
);

const RankList = ({
  title,
  icon: Icon,
  data,
  total,
}: {
  title: string;
  icon: typeof Eye;
  data: [string, number][];
  total: number;
}) => (
  <div className="glass-card rounded-xl p-5">
    <h3 className="text-sm font-semibold font-heading flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-primary" />
      {title}
    </h3>
    {data.length === 0 && <p className="text-xs text-muted-foreground font-body">Sem dados.</p>}
    <div className="space-y-2.5">
      {data.slice(0, 10).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-xs font-body mb-1 gap-3">
            <span className="truncate text-foreground">{key}</span>
            <span className="text-muted-foreground shrink-0">
              {value} · {total ? Math.round((value / total) * 100) : 0}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full bg-primary/70 rounded-full"
              style={{ width: `${total ? (value / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AccessReport = () => {
  const [days, setDays] = useState(30);
  const [includeAdmin, setIncludeAdmin] = useState(false);

  const since = useMemo(
    () => new Date(Date.now() - days * 86400000).toISOString(),
    [days],
  );

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["analytics-events", days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as unknown as EventRow[];
    },
  });

  const rows = useMemo(
    () => (data ?? []).filter((r) => includeAdmin || !r.is_admin),
    [data, includeAdmin],
  );

  const pageviews = rows.filter((r) => r.event_type === "pageview");
  const actions = rows.filter((r) => r.event_type === "action");
  const exits = rows.filter((r) => r.event_type === "page_exit" && r.duration_ms > 0);

  const visitors = new Set(rows.map((r) => r.visitor_id || r.session_id)).size;
  const sessions = new Set(rows.map((r) => r.session_id)).size;
  const avgTime = exits.length
    ? Math.round(exits.reduce((a, b) => a + b.duration_ms, 0) / exits.length)
    : 0;

  const daily = useMemo(() => {
    const map = new Map<string, { views: number; sessions: Set<string> }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map.set(d, { views: 0, sessions: new Set() });
    }
    pageviews.forEach((r) => {
      const d = r.created_at.slice(0, 10);
      const entry = map.get(d);
      if (entry) {
        entry.views += 1;
        entry.sessions.add(r.session_id);
      }
    });
    return [...map.entries()].map(([d, v]) => ({
      day: d,
      views: v.views,
      sessions: v.sessions.size,
    }));
  }, [pageviews, days]);

  const maxDaily = Math.max(1, ...daily.map((d) => d.views));

  const sessionsList = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    rows.forEach((r) => {
      const list = map.get(r.session_id) ?? [];
      list.push(r);
      map.set(r.session_id, list);
    });
    return [...map.entries()]
      .map(([id, events]) => {
        const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at));
        const first = sorted[0];
        return {
          id,
          first,
          events: sorted,
          views: sorted.filter((e) => e.event_type === "pageview").length,
          actions: sorted.filter((e) => e.event_type === "action").length,
          time: sorted.reduce((a, b) => a + b.duration_ms, 0),
        };
      })
      .sort((a, b) => b.first.created_at.localeCompare(a.first.created_at));
  }, [rows]);

  const exportCsv = () => {
    const headers = [
      "data",
      "sessao",
      "visitante",
      "tipo",
      "pagina",
      "titulo",
      "acao",
      "detalhes",
      "origem",
      "utm_source",
      "dispositivo",
      "navegador",
      "sistema",
      "tela",
      "idioma",
      "fuso",
      "pais",
      "cidade",
      "ip",
      "tempo_ms",
    ];
    const lines = rows.map((r) =>
      [
        r.created_at,
        r.session_id,
        r.visitor_id,
        r.event_type,
        r.path,
        r.page_title,
        r.label,
        JSON.stringify(r.details ?? {}),
        r.referrer || "direto",
        r.utm_source ?? "",
        r.device_type,
        r.browser,
        r.os,
        r.screen_size,
        r.language,
        r.timezone,
        r.country,
        r.city,
        r.ip_hint,
        r.duration_ms,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-acessos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body py-10">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando relatório...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              size="sm"
              variant={days === r.days ? "default" : "outline"}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant={includeAdmin ? "default" : "outline"}
            onClick={() => setIncludeAdmin((v) => !v)}
          >
            {includeAdmin ? "Incluindo meus acessos" : "Ignorando meus acessos"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={exportCsv} disabled={!rows.length}>
            <Download className="w-4 h-4 mr-1.5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat icon={Users} label="Visitantes únicos" value={visitors} />
        <Stat icon={Activity} label="Sessões" value={sessions} />
        <Stat icon={Eye} label="Visualizações" value={pageviews.length} />
        <Stat
          icon={MousePointerClick}
          label="Interações"
          value={actions.length}
          hint="cliques em dashboards, apps e IA"
        />
        <Stat icon={Clock} label="Tempo médio por página" value={fmtDuration(avgTime)} />
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold font-heading mb-4">Acessos por dia</h3>
        <div className="flex items-end gap-[3px] h-32">
          {daily.map((d) => (
            <div key={d.day} className="flex-1 group relative flex items-end h-full">
              <div
                className="w-full rounded-t bg-primary/60 group-hover:bg-primary transition-colors min-h-[2px]"
                style={{ height: `${(d.views / maxDaily) * 100}%` }}
              />
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full hidden group-hover:block whitespace-nowrap text-[10px] font-body glass-card px-2 py-1 rounded">
                {new Date(d.day + "T12:00:00").toLocaleDateString("pt-BR")} · {d.views} views ·{" "}
                {d.sessions} sessões
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <RankList
          title="Páginas mais vistas"
          icon={Eye}
          data={count(pageviews, (r) => r.path)}
          total={pageviews.length}
        />
        <RankList
          title="O que usaram (ações)"
          icon={MousePointerClick}
          data={count(actions, (r) => r.label)}
          total={actions.length}
        />
        <RankList
          title="Origem do tráfego"
          icon={Globe2}
          data={count(pageviews, (r) => {
            if (r.utm_source) return `utm: ${r.utm_source}`;
            if (!r.referrer) return "Direto";
            try {
              return new URL(r.referrer).hostname;
            } catch {
              return r.referrer;
            }
          })}
          total={pageviews.length}
        />
        <RankList
          title="Dispositivos"
          icon={MonitorSmartphone}
          data={count(rows, (r) => r.device_type)}
          total={rows.length}
        />
        <RankList
          title="Navegador e sistema"
          icon={MonitorSmartphone}
          data={count(rows, (r) => `${r.browser} · ${r.os}`)}
          total={rows.length}
        />
        <RankList
          title="Localização (fuso / país)"
          icon={Globe2}
          data={count(rows, (r) => [r.country, r.city].filter(Boolean).join(" · ") || r.timezone)}
          total={rows.length}
        />
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold font-heading mb-1">Quem acessou (sessões)</h3>
        <p className="text-xs text-muted-foreground font-body mb-4">
          Cada sessão é um visitante anônimo. Abra para ver o caminho completo dentro do portfólio.
        </p>
        {sessionsList.length === 0 && (
          <p className="text-xs text-muted-foreground font-body">
            Nenhum acesso registrado nesse período.
          </p>
        )}
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {sessionsList.slice(0, 100).map((s) => (
            <details key={s.id} className="rounded-lg border border-border/40 bg-card/40">
              <summary className="cursor-pointer px-4 py-3 text-xs font-body flex flex-wrap gap-x-4 gap-y-1 items-center">
                <span className="text-foreground font-medium">{fmtDate(s.first.created_at)}</span>
                <span className="text-muted-foreground">
                  Visitante {(s.first.visitor_id || s.id).slice(0, 8)}
                </span>
                <span className="text-muted-foreground">
                  {s.first.device_type} · {s.first.browser} · {s.first.os}
                </span>
                <span className="text-muted-foreground">
                  {[s.first.city, s.first.country].filter(Boolean).join(", ") ||
                    s.first.timezone ||
                    "local desconhecido"}
                </span>
                <span className="text-primary">
                  {s.views} páginas · {s.actions} ações · {fmtDuration(s.time)}
                </span>
              </summary>
              <div className="px-4 pb-4 space-y-3">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-body text-muted-foreground">
                  <span>Origem: {s.first.referrer || "acesso direto"}</span>
                  <span>Idioma: {s.first.language || "—"}</span>
                  <span>Tela: {s.first.screen_size || "—"}</span>
                  <span>Fuso: {s.first.timezone || "—"}</span>
                  <span>IP aproximado: {s.first.ip_hint || "—"}</span>
                  <span>Campanha: {s.first.utm_campaign || "—"}</span>
                </div>
                <ol className="space-y-1.5 border-l border-border/50 pl-4">
                  {s.events.map((e) => (
                    <li key={e.id} className="text-[11px] font-body relative">
                      <span className="absolute -left-[21px] top-1.5 w-1.5 h-1.5 rounded-full bg-primary/70" />
                      <span className="text-muted-foreground">
                        {new Date(e.created_at).toLocaleTimeString("pt-BR")}
                      </span>{" "}
                      <span className="text-foreground">
                        {e.event_type === "pageview"
                          ? `Abriu ${e.path}`
                          : e.event_type === "page_exit"
                            ? `Saiu de ${e.path} (${fmtDuration(e.duration_ms)})`
                            : e.label || e.event_type}
                      </span>
                      {e.details && Object.keys(e.details).length > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          — {Object.values(e.details).join(" · ")}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessReport;
