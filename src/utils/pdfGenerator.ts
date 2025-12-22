import jsPDF from 'jspdf';
import { modes, ModeKey } from '@/config/minimind';

// Helper to strip markdown and get clean text with formatting info
function parseMarkdownToPdfContent(text: string): Array<{ type: 'heading' | 'paragraph' | 'bullet' | 'numbered'; content: string; level?: number }> {
  const lines = text.split('\n');
  const result: Array<{ type: 'heading' | 'paragraph' | 'bullet' | 'numbered'; content: string; level?: number }> = [];
  
  let numberedIndex = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      result.push({ type: 'heading', content: cleanMarkdown(headingMatch[2]), level: headingMatch[1].length });
      numberedIndex = 0;
      continue;
    }
    
    // Check for bullet points
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      result.push({ type: 'bullet', content: cleanMarkdown(bulletMatch[1]) });
      numberedIndex = 0;
      continue;
    }
    
    // Check for numbered lists
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      numberedIndex++;
      result.push({ type: 'numbered', content: cleanMarkdown(numberedMatch[1]), level: numberedIndex });
      continue;
    }
    
    // Regular paragraph
    result.push({ type: 'paragraph', content: cleanMarkdown(trimmed) });
    numberedIndex = 0;
  }
  
  return result;
}

// Clean markdown syntax from text
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/__(.+?)__/g, '$1') // Bold alt
    .replace(/_(.+?)_/g, '$1') // Italic alt
    .replace(/~~(.+?)~~/g, '$1') // Strikethrough
    .replace(/`(.+?)`/g, '$1') // Inline code
    .replace(/\[\[(.+?)\]\]/g, '$1') // Wiki links
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
    .replace(/\^\^(.+?)\^\^/g, '$1') // Custom markers
    .trim();
}

export function generatePDF(
  content: string,
  modeKey: ModeKey,
  question: string
): jsPDF {
  const mode = modes[modeKey];
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;
  
  // Title - Mode Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${mode.icon} ${mode.name} Mode`, margin, yPos);
  yPos += 12;
  
  // Badge
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(mode.badge, margin, yPos);
  yPos += 10;
  
  // Question
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Question:', margin, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  const questionLines = doc.splitTextToSize(question, contentWidth);
  doc.text(questionLines, margin, yPos);
  yPos += questionLines.length * 6 + 10;
  
  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // Content
  const parsedContent = parseMarkdownToPdfContent(content);
  
  for (const item of parsedContent) {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = margin;
    }
    
    switch (item.type) {
      case 'heading':
        const fontSize = item.level === 1 ? 16 : item.level === 2 ? 14 : 12;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const headingLines = doc.splitTextToSize(item.content, contentWidth);
        doc.text(headingLines, margin, yPos);
        yPos += headingLines.length * (fontSize * 0.5) + 6;
        break;
        
      case 'bullet':
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('•', margin, yPos);
        const bulletLines = doc.splitTextToSize(item.content, contentWidth - 10);
        doc.text(bulletLines, margin + 8, yPos);
        yPos += bulletLines.length * 5 + 4;
        break;
        
      case 'numbered':
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`${item.level}.`, margin, yPos);
        const numLines = doc.splitTextToSize(item.content, contentWidth - 12);
        doc.text(numLines, margin + 10, yPos);
        yPos += numLines.length * 5 + 4;
        break;
        
      case 'paragraph':
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const paraLines = doc.splitTextToSize(item.content, contentWidth);
        doc.text(paraLines, margin, yPos);
        yPos += paraLines.length * 5 + 6;
        break;
    }
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by MiniMind - Your AI Learning Companion', margin, footerY);
  doc.text(new Date().toLocaleDateString(), pageWidth - margin - 30, footerY);
  
  return doc;
}

export function downloadPDF(content: string, modeKey: ModeKey, question: string): void {
  const doc = generatePDF(content, modeKey, question);
  const filename = generateFilename(modeKey, question);
  doc.save(filename);
}

export async function sharePDF(content: string, modeKey: ModeKey, question: string): Promise<void> {
  const doc = generatePDF(content, modeKey, question);
  const filename = generateFilename(modeKey, question);
  
  // Convert to blob
  const pdfBlob = doc.output('blob');
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });
  
  // Try Web Share API
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `MiniMind ${modes[modeKey].name} - ${question.substring(0, 50)}`,
        files: [file],
      });
      return;
    } catch (error) {
      console.log('Share cancelled or failed, falling back to download');
    }
  }
  
  // Fallback to download
  downloadPDF(content, modeKey, question);
}

function generateFilename(modeKey: ModeKey, question: string): string {
  const mode = modes[modeKey];
  const sanitizedQuestion = question
    .substring(0, 40)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
  
  return `MiniMind_${mode.name}_${sanitizedQuestion || 'answer'}.pdf`;
}
