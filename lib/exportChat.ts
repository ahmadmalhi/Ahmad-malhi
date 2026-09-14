import type { Conversation } from "./types";

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeName(title: string) {
  return (title || "conversation").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
}

export function exportAsTxt(conversation: Conversation) {
  const body = conversation.messages
    .map((m) => `${m.role === "user" ? "You" : "Nexora"}: ${m.content}`)
    .join("\n\n");
  download(`${safeName(conversation.title)}.txt`, new Blob([body], { type: "text/plain" }));
}

export function exportAsMarkdown(conversation: Conversation) {
  const body = [
    `# ${conversation.title}`,
    "",
    ...conversation.messages.map(
      (m) => `**${m.role === "user" ? "You" : "Nexora"}:**\n\n${m.content}`
    ),
  ].join("\n\n");
  download(`${safeName(conversation.title)}.md`, new Blob([body], { type: "text/markdown" }));
}

export async function exportAsPdf(conversation: Conversation) {
  // Lazy-loaded so the ~200kb pdf library never ships to users who don't export.
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(conversation.title || "Conversation", marginX, y);
  y += 28;

  doc.setFontSize(11);
  for (const message of conversation.messages) {
    const speaker = message.role === "user" ? "You" : "Nexora";
    doc.setFont("helvetica", "bold");
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 60;
    }
    doc.text(speaker, marginX, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    const lines: string[] = doc.splitTextToSize(message.content, maxWidth);
    for (const line of lines) {
      if (y > pageHeight - 48) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, marginX, y);
      y += 15;
    }
    y += 14;
  }

  doc.save(`${safeName(conversation.title)}.pdf`);
}
