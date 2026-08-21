import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

const inlineRuns = (text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) => {
  const { bold = false, size = 22, color } = opts;
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  parts.forEach((part) => {
    if (!part) return;
    const isBold = part.startsWith("**") && part.endsWith("**");
    runs.push(
      new TextRun({
        text: isBold ? part.slice(2, -2) : part,
        bold: isBold || bold,
        font: "Arial",
        size,
        ...(color ? { color } : {}),
      }),
    );
  });
  return runs.length ? runs : [new TextRun({ text, font: "Arial", size })];
};

/** Converte o markdown simples devolvido pela IA em um documento Word. */
export const buildReportDocx = (markdown: string, meta: { title: string; subtitle: string }) => {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: meta.title, bold: true, font: "Arial", size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [new TextRun({ text: meta.subtitle, font: "Arial", size: 20, color: "666666" })],
    }),
  ];

  markdown
    .split("\n")
    .map((line) => line.trimEnd())
    .forEach((line) => {
      const trimmed = line.trim();
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) return;
      if (!trimmed) {
        children.push(new Paragraph({ children: [new TextRun({ text: "", font: "Arial" })] }));
        return;
      }
      if (trimmed.startsWith("### ")) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: inlineRuns(trimmed.slice(4), { bold: true, size: 26 }),
          }),
        );
        return;
      }
      if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 320, after: 160 },
            children: inlineRuns(trimmed.replace(/^#+\s+/, ""), { bold: true, size: 30 }),
          }),
        );
        return;
      }

      if (/^[-*•]\s+/.test(trimmed)) {
        children.push(
          new Paragraph({
            numbering: { reference: "report-bullets", level: 0 },
            spacing: { after: 80 },
            children: inlineRuns(trimmed.replace(/^[-*•]\s+/, "")),
          }),
        );
        return;
      }
      const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
      if (numbered) {
        children.push(
          new Paragraph({
            numbering: { reference: "report-numbers", level: 0 },
            spacing: { after: 80 },
            children: inlineRuns(numbered[2]),
          }),
        );
        return;
      }
      children.push(
        new Paragraph({ spacing: { after: 120 }, children: inlineRuns(trimmed) }),
      );
    });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 30, bold: true, font: "Arial" },
          paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, font: "Arial" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "report-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: "report-numbers",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
