export class PdfStylesUtils {
	static isPageOverflow(doc: PDFKit.PDFDocument, y: number): boolean {
		return y > doc.page.height - doc.page.margins.bottom;
	}

	static getMaxWidth(doc: PDFKit.PDFDocument, margin: number) {
		return doc.page.width - margin * 2;
	}

	static getWidth(doc: PDFKit.PDFDocument, margin: number, perc: number) {
		const totalWidth = PdfStylesUtils.getMaxWidth(doc, margin);
		const usableWidth = totalWidth * 0.95;
		return (perc / 100) * usableWidth;
	}
}
