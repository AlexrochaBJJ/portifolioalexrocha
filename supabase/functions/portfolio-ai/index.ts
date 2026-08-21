import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "google/gemini-3-flash";

type ChatMessage = { role: "user" | "assistant"; content: string };

const clip = (value: unknown, max = 1200) =>
  typeof value === "string" ? value.slice(0, max) : "";

const list = (value: unknown) =>
  Array.isArray(value) ? value.filter(Boolean).map(String).join("; ") : "";

async function buildContext(supabase: ReturnType<typeof createClient>) {
  const [about, skills, experiences, highlights, dashboards, webProjects, flowcharts, nodes, contacts] =
    await Promise.all([
      supabase.from("profile_about").select("*").order("created_at").limit(1).maybeSingle(),
      supabase.from("skills").select("*").order("sort_order"),
      supabase.from("career_experiences").select("*").order("sort_order"),
      supabase.from("experience_highlights").select("*").order("sort_order"),
      supabase.from("dashboards").select("*").order("sort_order"),
      supabase.from("web_projects").select("*").order("sort_order"),
      supabase.from("flowcharts").select("*").order("sort_order"),
      supabase.from("flowchart_nodes").select("*").order("sort_order"),
      supabase.from("contact_links").select("*").order("sort_order"),
    ]);

  const parts: string[] = [];

  const a = about.data as Record<string, unknown> | null;
  if (a) {
    parts.push(
      `# PERFIL\nNome: ${clip(a.full_name, 120)}\nCargo/Headline: ${clip(a.headline, 200)}\nResumo: ${clip(a.summary, 1500)}\nBiografia: ${clip(a.bio, 4000)}`,
    );
  }

  const skillRows = (skills.data ?? []) as Record<string, unknown>[];
  if (skillRows.length) {
    parts.push(
      `# HABILIDADES E FERRAMENTAS\n${skillRows
        .map((s) => `- ${clip(s.name, 80)}${s.category ? ` (${clip(s.category, 60)})` : ""}${s.level ? ` — nível ${clip(String(s.level), 30)}` : ""}`)
        .join("\n")}`,
    );
  }

  const expRows = ((experiences.data ?? []) as Record<string, unknown>[]).filter(
    (e) => e.is_published !== false,
  );
  const highlightRows = (highlights.data ?? []) as Record<string, unknown>[];
  const flowRows = (flowcharts.data ?? []) as Record<string, unknown>[];
  const nodeRows = (nodes.data ?? []) as Record<string, unknown>[];

  if (expRows.length) {
    parts.push(
      `# EXPERIÊNCIAS PROFISSIONAIS\n${expRows
        .map((e) => {
          const hs = highlightRows.filter((h) => h.experience_id === e.id);
          const fs = flowRows.filter((f) => f.experience_id === e.id);
          const flowText = fs
            .map((f) => {
              const steps = nodeRows
                .filter((n) => n.flowchart_id === f.id)
                .map((n) => `${clip(n.title, 120)}${n.node_type ? ` [${clip(n.node_type, 20)}]` : ""}${list(n.items) ? `: ${list(n.items).slice(0, 400)}` : ""}`)
                .join(" -> ");
              return `  * Fluxograma "${clip(f.title, 120)}": ${steps || "sem etapas"}`;
            })
            .join("\n");
          return [
            `## ${clip(e.role, 150)} — ${clip(e.company, 150)}`,
            `Período: ${clip(e.period, 100)} | Local: ${clip(e.location, 100)} | Setor: ${clip(e.sector, 100)} | Tipo: ${clip(e.employment_type, 60)}`,
            `Resumo: ${clip(e.short_summary, 600)}`,
            `Descrição: ${clip(e.description, 4000)}`,
            `Responsabilidades: ${list(e.responsibilities)}`,
            `Resultados: ${list(e.results)}`,
            `Ferramentas: ${list(e.tools)}`,
            hs.length
              ? `Destaques e impactos:\n${hs.map((h) => `  - ${clip(h.highlight, 600)}${h.impact ? ` => Impacto: ${clip(h.impact, 600)}` : ""}`).join("\n")}`
              : "",
            flowText ? `Processos mapeados:\n${flowText}` : "",
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n\n")}`,
    );
  }

  const dashRows = ((dashboards.data ?? []) as Record<string, unknown>[]).filter(
    (d) => d.is_published !== false,
  );
  if (dashRows.length) {
    parts.push(
      `# DASHBOARDS POWER BI\n${dashRows
        .map((d) => `- ${clip(d.title, 150)} (${clip(d.category, 80)}): ${clip(d.description, 500)}`)
        .join("\n")}`,
    );
  }

  const webRows = ((webProjects.data ?? []) as Record<string, unknown>[]).filter(
    (w) => w.is_published !== false,
  );
  if (webRows.length) {
    parts.push(
      `# APLICAÇÕES WEB\n${webRows
        .map((w) => `- ${clip(w.title, 150)} (${clip(w.category, 80)}): ${clip(w.description, 500)} — ${clip(w.url, 300)}`)
        .join("\n")}`,
    );
  }

  const contactRows = ((contacts.data ?? []) as Record<string, unknown>[]);
  if (contactRows.length) {
    parts.push(
      `# CONTATOS\n${contactRows.map((c) => `- ${clip(c.label, 80)}: ${clip(c.value ?? c.url, 300)}`).join("\n")}`,
    );
  }

  return parts.join("\n\n");
}

const systemPrompt = (context: string, mode: string) => `Você é o assistente de IA do portfólio profissional de Allex Rocha, criado para ajudar recrutadores e profissionais de RH a avaliarem o perfil rapidamente.

REGRAS:
- Responda sempre em português do Brasil, de forma clara, objetiva e profissional.
- Use SOMENTE as informações do contexto abaixo. Se algo não estiver no contexto, diga que a informação não está registrada no portfólio e sugira o contato direto.
- Nunca invente empresas, datas, números ou resultados.
- Formate com markdown simples: títulos com "## ", listas com "- " e negrito com **texto**.
${
  mode === "report"
    ? `- Esta resposta será exportada como relatório em Word. Produza um documento COMPLETO e bem estruturado, com as seções: Resumo Executivo; Perfil Profissional; Experiências (uma subseção por empresa, com responsabilidades, resultados e destaques com impacto); Processos e Fluxos de Trabalho; Competências Técnicas e Ferramentas; Dashboards e Aplicações Desenvolvidas; Considerações Finais para o RH. Comece com "## " nas seções principais e "### " nas subseções.`
    : `- Seja conciso (até ~350 palavras), a menos que o usuário peça detalhes.`
}

=== CONTEXTO DO PORTFÓLIO ===
${context}
=== FIM DO CONTEXTO ===`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "IA não configurada (LOVABLE_API_KEY ausente)." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    const mode: string = body.mode === "report" ? "report" : "chat";

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "Nenhuma mensagem enviada." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const context = await buildContext(supabase);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt(context, mode) },
          ...messages.map((m) => ({
            role: m.role,
            content: String(m.content ?? "").slice(0, 4000),
          })),
        ],
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      let message = "Falha ao consultar a IA.";
      if (res.status === 429) message = "Muitas solicitações à IA. Aguarde alguns segundos e tente novamente.";
      if (res.status === 402) message = "Os créditos de IA do workspace foram esgotados. Adicione créditos para continuar.";
      if (res.status === 403) message = "O acesso à IA está bloqueado nas configurações do workspace.";
      console.error("gateway error", res.status, detail.slice(0, 500));
      return new Response(JSON.stringify({ error: message }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("portfolio-ai error", error);
    return new Response(JSON.stringify({ error: "Erro inesperado no assistente de IA." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
