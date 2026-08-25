// Prepara código HTML colado pelo admin para rodar isolado dentro do iframe do modal.
// O iframe usa sandbox sem "allow-same-origin", então o código não acessa o portfólio.

const STRIP_PATTERNS: RegExp[] = [
  // impede tentativas de escapar do iframe / navegar o portfólio
  /\bwindow\.(top|parent)\b/gi,
  /\bwindow\.(top|parent)\.location\b/gi,
  /\bdocument\.domain\b/gi,
  /\btop\.location\b/gi,
  /\bparent\.location\b/gi,
];

const BASE_STYLE = `
  <style>
    html, body { margin: 0; padding: 0; background: transparent; }
    body { overflow-x: hidden; }
    img, canvas, svg, video, iframe, table { max-width: 100%; }
  </style>
`;

/** Remove acessos ao contexto pai e garante um documento HTML completo. */
export const prepareSandboxHtml = (raw?: string | null): string => {
  if (!raw) return "";
  let code = String(raw);

  // neutraliza referências ao contexto pai (sandbox já bloqueia, isto evita erros ruidosos)
  STRIP_PATTERNS.forEach((pattern) => {
    code = code.replace(pattern, "window");
  });

  const hasHtmlTag = /<html[\s>]/i.test(code);
  const hasHead = /<head[\s>]/i.test(code);

  const injected = `${BASE_STYLE}<base target="_blank">`;

  if (hasHtmlTag && hasHead) {
    return code.replace(/<head([^>]*)>/i, (m) => `${m}${injected}`);
  }
  if (hasHtmlTag) {
    return code.replace(/<html([^>]*)>/i, (m) => `${m}<head>${injected}</head>`);
  }
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${injected}</head><body>${code}</body></html>`;
};
