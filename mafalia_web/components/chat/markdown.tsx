import * as React from "react";

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf("**");
    const codeIdx = remaining.indexOf("`");
    const nextBold = boldIdx !== -1 ? boldIdx : Infinity;
    const nextCode = codeIdx !== -1 ? codeIdx : Infinity;
    if (nextBold === Infinity && nextCode === Infinity) {
      parts.push(remaining);
      break;
    }
    if (nextBold <= nextCode) {
      if (boldIdx > 0) parts.push(remaining.slice(0, boldIdx));
      const end = remaining.indexOf("**", boldIdx + 2);
      if (end === -1) {
        parts.push(remaining.slice(boldIdx));
        break;
      }
      parts.push(
        <strong key={key++} className="font-bold text-foreground">
          {remaining.slice(boldIdx + 2, end)}
        </strong>,
      );
      remaining = remaining.slice(end + 2);
    } else {
      if (codeIdx > 0) parts.push(remaining.slice(0, codeIdx));
      const end = remaining.indexOf("`", codeIdx + 1);
      if (end === -1) {
        parts.push(remaining.slice(codeIdx));
        break;
      }
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded-md text-[12px] font-mono bg-secondary text-primary border border-border"
        >
          {remaining.slice(codeIdx + 1, end)}
        </code>,
      );
      remaining = remaining.slice(end + 1);
    }
  }
  return parts;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div key={i} className="my-4 rounded-xl overflow-hidden border border-border shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
              <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-widest">
                {codeLang || "code"}
              </span>
            </div>
            <pre className="font-mono text-[12.5px] px-5 py-4 text-foreground overflow-x-auto bg-card whitespace-pre-wrap leading-relaxed">
              {codeLines.join("\n")}
            </pre>
          </div>,
        );
        codeLines = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        codeLang = line.slice(3).trim();
        inCodeBlock = true;
      }
      return;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-[15px] font-bold text-foreground mt-5 mb-2 tracking-tight">
          {parseInline(line.slice(4))}
        </h3>,
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-[17px] font-bold text-foreground mt-6 mb-3 tracking-tight">
          {parseInline(line.slice(3))}
        </h2>,
      );
      return;
    }
    if (line.startsWith("• ") || line.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex gap-3 mt-1.5 ml-1">
          <span className="mt-2 size-1.5 rounded-full flex-shrink-0 bg-primary/50" />
          <span className="text-foreground/80 leading-relaxed text-[14px]">
            {parseInline(line.slice(2))}
          </span>
        </div>,
      );
      return;
    }
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2.5" />);
      return;
    }
    elements.push(
      <p key={i} className="text-foreground/80 leading-relaxed text-[14px] mt-1">
        {parseInline(line)}
      </p>,
    );
  });

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre
        key="code-end"
        className="my-4 rounded-xl font-mono text-[12.5px] px-5 py-4 text-foreground overflow-x-auto bg-card border border-border whitespace-pre-wrap leading-relaxed"
      >
        {codeLines.join("\n")}
      </pre>,
    );
  }
  return <>{elements}</>;
}
