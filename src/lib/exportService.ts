import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';

interface ExportData {
  title: string;
  content: string;
  metadata?: {
    author?: string;
    date?: string;
    citation?: string;
    court?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Export service for generating PDF and DOCX files from legal research data
 */
export class ExportService {
  /**
   * Generate and download a PDF file
   */
  static async exportToPDF(data: ExportData): Promise<void> {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(data.title, maxWidth);
      doc.text(titleLines, margin, currentY);
      currentY += titleLines.length * 10 + 10;

      // Metadata
      if (data.metadata) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        Object.entries(data.metadata).forEach(([key, value]) => {
          if (value) {
            const text = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
            const lines = doc.splitTextToSize(text, maxWidth);
            
            // Check if we need a new page
            if (currentY + lines.length * 5 > pageHeight - margin) {
              doc.addPage();
              currentY = margin;
            }
            
            doc.text(lines, margin, currentY);
            currentY += lines.length * 5 + 2;
          }
        });
        
        currentY += 10; // Add space after metadata
      }

      // Content
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Split content by paragraphs
      const paragraphs = data.content.split('\n\n');
      
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          const lines = doc.splitTextToSize(paragraph, maxWidth);
          
          lines.forEach((line: string) => {
            // Check if we need a new page
            if (currentY + 7 > pageHeight - margin) {
              doc.addPage();
              currentY = margin;
            }
            
            doc.text(line, margin, currentY);
            currentY += 7;
          });
          
          currentY += 5; // Add space between paragraphs
        }
      });

      // Footer with page numbers
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const filename = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      doc.save(filename);
      
      return Promise.resolve();
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Generate and download a DOCX file
   */
  static async exportToDOCX(data: ExportData): Promise<void> {
    try {
      const children: Paragraph[] = [];

      // Title
      children.push(
        new Paragraph({
          text: data.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Metadata
      if (data.metadata) {
        Object.entries(data.metadata).forEach(([key, value]) => {
          if (value) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${key.charAt(0).toUpperCase() + key.slice(1)}: `,
                    bold: true,
                  }),
                  new TextRun({
                    text: value,
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
        });
        
        // Add spacing after metadata
        children.push(
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          })
        );
      }

      // Content - split by paragraphs
      const paragraphs = data.content.split('\n\n');
      
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          children.push(
            new Paragraph({
              text: paragraph.trim(),
              spacing: { after: 200 },
            })
          );
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
      });

      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      const filename = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
      saveAs(blob, filename);
      
      return Promise.resolve();
    } catch (error) {
      console.error('DOCX export error:', error);
      throw new Error('Failed to generate DOCX');
    }
  }

  /**
   * Export multiple items to a single PDF
   */
  static async exportMultipleToPDF(items: ExportData[]): Promise<void> {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);

      items.forEach((item, index) => {
        if (index > 0) {
          doc.addPage();
        }

        let currentY = margin;

        // Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(item.title, maxWidth);
        doc.text(titleLines, margin, currentY);
        currentY += titleLines.length * 8 + 8;

        // Metadata
        if (item.metadata) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          
          Object.entries(item.metadata).forEach(([key, value]) => {
            if (value) {
              const text = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
              const lines = doc.splitTextToSize(text, maxWidth);
              
              if (currentY + lines.length * 4 > pageHeight - margin) {
                doc.addPage();
                currentY = margin;
              }
              
              doc.text(lines, margin, currentY);
              currentY += lines.length * 4 + 2;
            }
          });
          
          currentY += 8;
        }

        // Content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const paragraphs = item.content.split('\n\n');
        
        paragraphs.forEach((paragraph) => {
          if (paragraph.trim()) {
            const lines = doc.splitTextToSize(paragraph, maxWidth);
            
            lines.forEach((line: string) => {
              if (currentY + 6 > pageHeight - margin) {
                doc.addPage();
                currentY = margin;
              }
              
              doc.text(line, margin, currentY);
              currentY += 6;
            });
            
            currentY += 4;
          }
        });
      });

      // Footer with page numbers
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      doc.save('legal_research_export.pdf');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Multiple PDF export error:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}
