type RichTextNode =
  | { type: "text"; text: string; bold?: boolean; italic?: boolean; underline?: boolean }
  | { type: "paragraph"; children: RichTextNode[] }
  | { type: "heading"; level?: number; children: RichTextNode[] }
  | { type: "list"; format?: "ordered" | "unordered"; children: RichTextNode[] }
  | { type: "list-item"; children: RichTextNode[] }
  | { type: string; children?: RichTextNode[]; [key: string]: any };

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderText(node: any): string {
  let text = escapeHtml(node.text ?? "");

  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;

  return text;
}

function renderNodes(nodes: any[]): string {
  return nodes.map(renderNode).join("");
}

function renderNode(node: any): string {
  if (!node) return "";

  if (node.type === "text") {
    return renderText(node);
  }

  const children = Array.isArray(node.children) ? renderNodes(node.children) : "";

  switch (node.type) {
    case "paragraph":
      return `<p>${children}</p>`;

    case "heading": {
      const level = Math.min(Math.max(Number(node.level ?? 2), 1), 6);
      return `<h${level}>${children}</h${level}>`;
    }

    case "list": {
      const tag = node.format === "ordered" ? "ol" : "ul";
      return `<${tag}>${children}</${tag}>`;
    }

    case "list-item":
      return `<li>${children}</li>`;

    default:
      return children; // ignore unknown blocks but keep their text
  }
}

export function strapiRichTextToHtml(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return renderNodes(content as any[]);
}
