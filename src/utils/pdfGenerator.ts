import { modes, ModeKey } from '@/config/minimind';

// ─── Color themes per mode ───────────────────────────────────────────
const MODE_COLORS: Record<ModeKey, { primary: [number, number, number]; light: [number, number, number]; accent: [number, number, number] }> = {
  beginner: { primary: [16, 185, 129], light: [236, 253, 245], accent: [5, 150, 105] },
  thinker:  { primary: [139, 92, 246],  light: [245, 243, 255], accent: [109, 40, 217] },
  story:    { primary: [245, 158, 11],  light: [255, 251, 235], accent: [217, 119, 6] },
  mastery:  { primary: [59, 130, 246],  light: [239, 246, 255], accent: [37, 99, 235] },
};

// ─── Thoroughly strip markdown to clean plain text ───────────────────
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\^\^(.+?)\^\^/g, '$1')
    .replace(/\[\[(.+?)\]\]/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();
}

// ─── Extract bold segments for rich rendering ────────────────────────
interface TextSegment {
  text: string;
  bold: boolean;
}

function parseInlineFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: stripMarkdown(text.slice(lastIndex, match.index)), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: stripMarkdown(text.slice(lastIndex)), bold: false });
  }

  return segments.length ? segments : [{ text: stripMarkdown(text), bold: false }];
}

// ─── Parse content into structured blocks ────────────────────────────
interface ContentBlock {
  type: 'heading' | 'paragraph' | 'bullet' | 'numbered' | 'emoji-heading' | 'divider';
  content: string;
  segments?: TextSegment[];
  level?: number;
  emoji?: string;
}

function parseContentToBlocks(text: string): ContentBlock[] {
  const lines = text.split('\n');
  const blocks: ContentBlock[] = [];
  let numberedIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip lines that are just markdown symbols
    if (/^[-=_*]{3,}$/.test(trimmed)) {
      blocks.push({ type: 'divider', content: '' });
      continue;
    }

    // Emoji heading pattern: "🌱 **The Simple Answer**" or "📌 **Memory Hook**"
    const emojiHeadingMatch = trimmed.match(/^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{2B50}\u{23F0}\u{2764}\u{FE0F}\u{1F004}-\u{1F0CF}]+)\s+\*\*(.+?)\*\*\s*[-—:]?\s*(.*)/u);
    if (emojiHeadingMatch) {
      const emoji = emojiHeadingMatch[1];
      const heading = emojiHeadingMatch[2];
      const rest = emojiHeadingMatch[3]?.trim();
      blocks.push({ type: 'emoji-heading', content: heading, emoji });
      if (rest) {
        blocks.push({ type: 'paragraph', content: rest, segments: parseInlineFormatting(rest) });
      }
      numberedIndex = 0;
      continue;
    }

    // Standard heading: # ## ###
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', content: stripMarkdown(headingMatch[2]), level: headingMatch[1].length });
      numberedIndex = 0;
      continue;
    }

    // Bold-only line as sub-heading: "**Something Important**"
    const boldLineMatch = trimmed.match(/^\*\*(.+?)\*\*\s*$/);
    if (boldLineMatch && trimmed.length < 80) {
      blocks.push({ type: 'heading', content: boldLineMatch[1], level: 3 });
      numberedIndex = 0;
      continue;
    }

    // Bullet points (-, *, •)
    const bulletMatch = trimmed.match(/^[-*\u2022]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({ type: 'bullet', content: bulletMatch[1], segments: parseInlineFormatting(bulletMatch[1]) });
      numberedIndex = 0;
      continue;
    }

    // Numbered lists
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      numberedIndex++;
      blocks.push({ type: 'numbered', content: numberedMatch[1], segments: parseInlineFormatting(numberedMatch[1]), level: numberedIndex });
      continue;
    }

    // Regular paragraph
    blocks.push({ type: 'paragraph', content: trimmed, segments: parseInlineFormatting(trimmed) });
    numberedIndex = 0;
  }

  return blocks;
}

// ─── Dynamic import of jsPDF ─────────────────────────────────────────
async function loadJsPDF() {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
}

// ─── Render rich text segments with bold support ─────────────────────
function renderRichText(
  doc: any,
  segments: TextSegment[],
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  textColor: [number, number, number],
  boldColor?: [number, number, number]
): number {
  // Flatten segments to plain text for splitTextToSize
  const fullText = segments.map(s => s.text).join('');
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  const wrappedLines: string[] = doc.splitTextToSize(fullText, maxWidth);

  let totalHeight = 0;
  const lineHeight = fontSize * 0.45;

  for (const line of wrappedLines) {
    // For each wrapped line, try to apply bold segments
    let charPos = 0;
    let xOffset = x;
    let remainingLine = line;

    // Simple approach: render the whole line, then overlay bold parts
    // For simplicity and reliability, render line-by-line with proper font
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(line, x, y + totalHeight);
    totalHeight += lineHeight;
  }

  return totalHeight;
}

// ─── Main PDF generator ──────────────────────────────────────────────
export async function generatePDF(
  content: string,
  modeKey: ModeKey,
  question: string
) {
  const jsPDF = await loadJsPDF();
  const mode = modes[modeKey];
  const colors = MODE_COLORS[modeKey];
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 0;

  // ── Helper: Add page with watermark & footer ──
  const addPageDecoration = (pageNum: number, totalPages?: number) => {
    // Subtle background color
    doc.setFillColor(252, 252, 253);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top accent bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Left accent stripe
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 3, pageHeight, 'F');

    // Diagonal watermark
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(230, 230, 235);
    doc.text('MiniMind', pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: 'center',
    });

    // Footer bar
    doc.setFillColor(245, 245, 248);
    doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
    doc.setDrawColor(220, 220, 225);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    // Footer text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 150);
    doc.text('Generated by MiniMind  |  Your AI Learning Companion', margin, pageHeight - 8);
    doc.text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // ── Helper: Check for new page ──
  const checkNewPage = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - 28) {
      doc.addPage();
      addPageDecoration(doc.getNumberOfPages());
      yPos = 18;
      return true;
    }
    return false;
  };

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 1 HEADER
  // ═══════════════════════════════════════════════════════════════════
  addPageDecoration(1);

  yPos = 16;

  // Mode banner
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin, yPos, contentWidth, 28, 4, 4, 'F');
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, yPos, contentWidth, 28, 4, 4, 'S');

  // Mode icon placeholder (text emoji) + Mode name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accent);
  doc.text(`${mode.name} Mode`, margin + 10, yPos + 13);

  // Mode tagline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 110);
  doc.text(mode.tagline, margin + 10, yPos + 22);

  // MiniMind brand on right
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('MiniMind', pageWidth - margin - 10, yPos + 13, { align: 'right' });

  yPos += 36;

  // ── Question card ──
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, yPos, contentWidth, 0, 3, 3, 'F'); // placeholder height

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('QUESTION', margin + 8, yPos + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 50);
  const cleanQuestion = stripMarkdown(question);
  const questionLines: string[] = doc.splitTextToSize(cleanQuestion, contentWidth - 16);
  doc.text(questionLines, margin + 8, yPos + 16);

  const questionBoxHeight = 22 + questionLines.length * 4.5;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, yPos, contentWidth, questionBoxHeight, 3, 3, 'F');
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, yPos, contentWidth, questionBoxHeight, 3, 3, 'S');

  // Re-render text on top of card
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('QUESTION', margin + 8, yPos + 8);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 50);
  doc.text(questionLines, margin + 8, yPos + 16);

  yPos += questionBoxHeight + 8;

  // ── Accent divider ──
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(1.2);
  doc.line(margin, yPos, margin + 40, yPos);
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.3);
  doc.line(margin + 42, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ═══════════════════════════════════════════════════════════════════
  // ANSWER CONTENT
  // ═══════════════════════════════════════════════════════════════════
  const blocks = parseContentToBlocks(content);

  for (const block of blocks) {
    switch (block.type) {
      case 'emoji-heading': {
        checkNewPage(18);
        // Colored background bar for section headings
        doc.setFillColor(...colors.light);
        doc.roundedRect(margin, yPos - 3, contentWidth, 12, 2, 2, 'F');
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.4);
        doc.line(margin, yPos - 3, margin, yPos + 9); // Left accent line
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.accent);
        doc.text(`${block.emoji || ''}  ${block.content}`, margin + 6, yPos + 5);
        yPos += 16;
        break;
      }

      case 'heading': {
        const level = block.level || 2;
        const hSize = level === 1 ? 14 : level === 2 ? 12 : 10;
        checkNewPage(hSize + 8);

        if (level <= 2) {
          // Accent line before major headings
          doc.setDrawColor(...colors.primary);
          doc.setLineWidth(0.6);
          doc.line(margin, yPos, margin + 20, yPos);
          yPos += 4;
        }

        doc.setFontSize(hSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 40);
        const headingLines: string[] = doc.splitTextToSize(block.content, contentWidth);
        doc.text(headingLines, margin, yPos);
        yPos += headingLines.length * (hSize * 0.45) + 6;
        break;
      }

      case 'bullet': {
        checkNewPage(14);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(45, 45, 55);

        // Colored bullet dot
        doc.setFillColor(...colors.primary);
        doc.circle(margin + 3, yPos - 1.2, 1.5, 'F');

        const bulletText = stripMarkdown(block.content);
        const bulletLines: string[] = doc.splitTextToSize(bulletText, contentWidth - 12);
        doc.text(bulletLines, margin + 9, yPos);
        yPos += bulletLines.length * 4.3 + 3;
        break;
      }

      case 'numbered': {
        checkNewPage(14);
        doc.setFontSize(9.5);

        // Numbered circle
        doc.setFillColor(...colors.primary);
        doc.circle(margin + 4, yPos - 1, 4, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${block.level}`, margin + 4, yPos + 0.5, { align: 'center' });

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(45, 45, 55);
        const numText = stripMarkdown(block.content);
        const numLines: string[] = doc.splitTextToSize(numText, contentWidth - 16);
        doc.text(numLines, margin + 12, yPos);
        yPos += numLines.length * 4.3 + 3;
        break;
      }

      case 'divider': {
        checkNewPage(8);
        doc.setDrawColor(210, 210, 215);
        doc.setLineWidth(0.3);
        doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
        yPos += 6;
        break;
      }

      case 'paragraph':
      default: {
        checkNewPage(14);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(45, 45, 55);
        const paraText = stripMarkdown(block.content);
        const paraLines: string[] = doc.splitTextToSize(paraText, contentWidth);
        doc.text(paraLines, margin, yPos);
        yPos += paraLines.length * 4.3 + 4;
        break;
      }
    }
  }

  // ── Bottom brand card on last page ──
  if (yPos < pageHeight - 50) {
    yPos = Math.max(yPos + 8, pageHeight - 45);
  } else {
    checkNewPage(35);
    yPos += 8;
  }
  
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin, yPos, contentWidth, 18, 3, 3, 'F');
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, contentWidth, 18, 3, 3, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accent);
  doc.text('MiniMind', margin + 8, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 110);
  doc.text('AI-powered learning that makes concepts click forever.', margin + 38, yPos + 8);
  doc.setFontSize(7);
  doc.text(`${mode.name} Mode  |  ${new Date().toLocaleDateString('en-IN')}`, margin + 8, yPos + 14);

  return doc;
}

export async function downloadPDF(content: string, modeKey: ModeKey, question: string): Promise<void> {
  const doc = await generatePDF(content, modeKey, question);
  const filename = generateFilename(modeKey, question);
  doc.save(filename);
}

export type SharePlatform = 'whatsapp' | 'email' | 'copy' | 'native' | 'download';

export async function sharePDF(
  content: string,
  modeKey: ModeKey,
  question: string,
  platform: SharePlatform = 'native'
): Promise<boolean> {
  const mode = modes[modeKey];
  const shareText = `Check out this ${mode.name} explanation from MiniMind:\n\n"${question.substring(0, 100)}..."\n\n${stripMarkdown(content).substring(0, 500)}...\n\nLearn more at MiniMind`;
  const shareTitle = `MiniMind ${mode.name} - ${question.substring(0, 50)}`;

  switch (platform) {
    case 'whatsapp': {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
      return true;
    }

    case 'email': {
      const subject = encodeURIComponent(shareTitle);
      const body = encodeURIComponent(shareText);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      return true;
    }

    case 'copy': {
      try {
        await navigator.clipboard.writeText(shareText);
        return true;
      } catch {
        return false;
      }
    }

    case 'download': {
      await downloadPDF(content, modeKey, question);
      return true;
    }

    case 'native':
    default: {
      const doc = await generatePDF(content, modeKey, question);
      const filename = generateFilename(modeKey, question);
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: shareTitle,
          text: `Check out this ${mode.name} explanation from MiniMind: "${question.substring(0, 50)}..."`,
          files: [file],
        };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            return true;
          } catch (error: any) {
            if (error.name === 'AbortError') return false;
            console.error('Share failed:', error);
          }
        }
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: `Check out this ${mode.name} explanation from MiniMind: "${question.substring(0, 50)}..."`,
          });
          await downloadPDF(content, modeKey, question);
          return true;
        } catch (error: any) {
          if (error.name === 'AbortError') return false;
        }
      }

      await downloadPDF(content, modeKey, question);
      return false;
    }
  }
}

function generateFilename(modeKey: ModeKey, question: string): string {
  const mode = modes[modeKey];
  const sanitizedQuestion = question
    .substring(0, 35)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .trim();

  const timestamp = new Date().toISOString().split('T')[0];
  return `MiniMind_${mode.name}_${sanitizedQuestion || 'answer'}_${timestamp}.pdf`;
}
