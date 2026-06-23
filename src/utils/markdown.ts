export function parseMarkdown(md: string): string {
  if (!md) return '';

  // If it already looks like HTML, do not parse as markdown
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(md);
  if (hasHtml) {
    return md;
  }

  // Normalize line endings
  const lines = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let html = '';
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle empty lines (paragraph breaks)
    if (!line) {
      if (inList) {
        html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
        inList = false;
        listType = null;
      }
      continue;
    }

    // Handle Headers
    if (line.startsWith('# ')) {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; listType = null; }
      html += `<h1 class="text-3xl font-bold mt-6 mb-4 text-primary">${line.slice(2)}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; listType = null; }
      html += `<h2 class="text-2xl font-bold mt-5 mb-3 text-primary">${line.slice(3)}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; listType = null; }
      html += `<h3 class="text-xl font-bold mt-4 mb-2 text-primary">${line.slice(4)}</h3>\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; listType = null; }
      html += `<h4 class="text-lg font-bold mt-3 mb-2 text-primary">${line.slice(5)}</h4>\n`;
      continue;
    }

    // Handle Unordered Lists (- item or * item)
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) {
          html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
        }
        html += '<ul class="list-disc pl-5 my-4 space-y-1">\n';
        inList = true;
        listType = 'ul';
      }
      html += `  <li>${parseInlineMarkdown(ulMatch[1])}</li>\n`;
      continue;
    }

    // Handle Ordered Lists (1. item)
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) {
          html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
        }
        html += '<ol class="list-decimal pl-5 my-4 space-y-1">\n';
        inList = true;
        listType = 'ol';
      }
      html += `  <li value="${olMatch[1]}">${parseInlineMarkdown(olMatch[2])}</li>\n`;
      continue;
    }

    // If it's regular text
    if (inList) {
      html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
      inList = false;
      listType = null;
    }

    // Paragraph
    html += `<p class="my-4 leading-relaxed">${parseInlineMarkdown(line)}</p>\n`;
  }

  if (inList) {
    html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
  }

  return html;
}

function parseInlineMarkdown(text: string): string {
  let formatted = text;
  // Bold (**text** or __text__)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
  // Italic (*text* or _text_)
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
  return formatted;
}
