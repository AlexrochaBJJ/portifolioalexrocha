const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-ai`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type AiMessage = { role: "user" | "assistant"; content: string };

/**
 * Envia as mensagens para a edge function e entrega o texto em streaming.
 */
export async function streamPortfolioAi(
  messages: AiMessage[],
  onDelta: (chunk: string) => void,
  options: { mode?: "chat" | "report"; signal?: AbortSignal } = {},
): Promise<string> {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ messages, mode: options.mode ?? "chat" }),
    signal: options.signal,
  });

  if (!res.ok || !res.body) {
    let message = "Não foi possível falar com a IA agora.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* resposta sem json */
    }
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta: string = json?.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        /* chunk parcial: ignora */
      }
    }
  }

  return full;
}
