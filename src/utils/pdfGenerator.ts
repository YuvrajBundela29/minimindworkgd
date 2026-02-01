import jsPDF from 'jspdf';
import { modes, ModeKey } from '@/config/minimind';

// Thoroughly clean all markdown and special characters
function cleanTextForPdf(text: string): string {
  return text
    // Remove bold markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic markers
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove strikethrough
    .replace(/~~(.+?)~~/g, '$1')
    // Remove inline code
    .replace(/`(.+?)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove custom markers
    .replace(/\^\^(.+?)\^\^/g, '$1')
    // Remove wiki links
    .replace(/\[\[(.+?)\]\]/g, '$1')
    // Remove markdown links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Clean bullet points at start of line
    .replace(/^[-*•]\s+/gm, '')
    // Clean numbered lists
    .replace(/^\d+\.\s+/gm, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse content into structured blocks
interface ContentBlock {
  type: 'heading' | 'paragraph' | 'bullet' | 'numbered';
  content: string;
  level?: number;
}

function parseContentToBlocks(text: string): ContentBlock[] {
  const lines = text.split('\n');
  const blocks: ContentBlock[] = [];
  let numberedIndex = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for headings (# ## ###)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const content = cleanTextForPdf(headingMatch[2]);
      blocks.push({ type: 'heading', content, level: headingMatch[1].length });
      numberedIndex = 0;
      continue;
    }
    
    // Check for bullet points (-, *, •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      const content = cleanTextForPdf(bulletMatch[1]);
      blocks.push({ type: 'bullet', content });
      numberedIndex = 0;
      continue;
    }
    
    // Check for numbered lists
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      numberedIndex++;
      const content = cleanTextForPdf(numberedMatch[1]);
      blocks.push({ type: 'numbered', content, level: numberedIndex });
      continue;
    }
    
    // Regular paragraph
    const content = cleanTextForPdf(trimmed);
    if (content) {
      blocks.push({ type: 'paragraph', content });
      numberedIndex = 0;
    }
  }
  
  return blocks;
}

export function generatePDF(
  content: string,
  modeKey: ModeKey,
  question: string
): jsPDF {
  const mode = modes[modeKey];
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;
  
  // Helper to check and add new page
  const checkNewPage = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - 25) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };
  
  // Title - Mode Name
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(`${mode.icon} ${mode.name} Mode`, margin, yPos);
  yPos += 10;
  
  // Badge
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(mode.badge, margin, yPos);
  yPos += 12;
  
  // Question section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Question:', margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const cleanQuestion = cleanTextForPdf(question);
  const questionLines = doc.splitTextToSize(cleanQuestion, contentWidth);
  doc.text(questionLines, margin, yPos);
  yPos += questionLines.length * 5 + 10;
  
  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;
  
  // Answer section header
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Answer:', margin, yPos);
  yPos += 8;
  
  // Parse and render content
  const blocks = parseContentToBlocks(content);
  
  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        const hFontSize = block.level === 1 ? 14 : block.level === 2 ? 12 : 11;
        checkNewPage(hFontSize + 6);
        doc.setFontSize(hFontSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        const headingLines = doc.splitTextToSize(block.content, contentWidth);
        doc.text(headingLines, margin, yPos);
        yPos += headingLines.length * (hFontSize * 0.45) + 6;
        break;
        
      case 'bullet':
        checkNewPage(12);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        // Draw bullet point
        doc.text('\u2022', margin, yPos);
        const bulletLines = doc.splitTextToSize(block.content, contentWidth - 8);
        doc.text(bulletLines, margin + 6, yPos);
        yPos += bulletLines.length * 4.5 + 3;
        break;
        
      case 'numbered':
        checkNewPage(12);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(`${block.level}.`, margin, yPos);
        const numLines = doc.splitTextToSize(block.content, contentWidth - 10);
        doc.text(numLines, margin + 8, yPos);
        yPos += numLines.length * 4.5 + 3;
        break;
        
      case 'paragraph':
        checkNewPage(12);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        const paraLines = doc.splitTextToSize(block.content, contentWidth);
        doc.text(paraLines, margin, yPos);
        yPos += paraLines.length * 4.5 + 5;
        break;
    }
  }
  
  // Footer on last page
  const footerY = pageHeight - 12;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by MiniMind - Your AI Learning Companion', margin, footerY);
  doc.text(new Date().toLocaleDateString(), pageWidth - margin - 25, footerY);
  
  return doc;
}

export function downloadPDF(content: string, modeKey: ModeKey, question: string): void {
  const doc = generatePDF(content, modeKey, question);
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
  const shareText = `Check out this ${mode.name} explanation from MiniMind:\n\n"${question.substring(0, 100)}..."\n\n${content.substring(0, 500)}...\n\n📚 Learn more at MiniMind`;
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
      downloadPDF(content, modeKey, question);
      return true;
    }

    case 'native':
    default: {
      const doc = generatePDF(content, modeKey, question);
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

      // Fallback to text-only share
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: `Check out this ${mode.name} explanation from MiniMind: "${question.substring(0, 50)}..."`,
          });
          downloadPDF(content, modeKey, question);
          return true;
        } catch (error: any) {
          if (error.name === 'AbortError') return false;
        }
      }

      // Final fallback: just download
      downloadPDF(content, modeKey, question);
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
