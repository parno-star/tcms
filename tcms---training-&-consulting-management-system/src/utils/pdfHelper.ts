import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

let sharedCanvasCtx: CanvasRenderingContext2D | null = null;

function getSharedCanvasCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!sharedCanvasCtx) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      sharedCanvasCtx = canvas.getContext('2d', { willReadFrequently: true });
    } catch {
      sharedCanvasCtx = null;
    }
  }
  return sharedCanvasCtx;
}

function oklchToRgb(oklchStr: string): string {
  try {
    const ctx = getSharedCanvasCtx();
    if (ctx) {
      ctx.fillStyle = '#123456';
      ctx.fillStyle = oklchStr;
      if (ctx.fillStyle && ctx.fillStyle !== '#123456' && !ctx.fillStyle.toLowerCase().includes('oklch')) {
        return ctx.fillStyle;
      }
    }
  } catch (e) {
    // Ignore canvas fallback
  }

  try {
    const cleaned = oklchStr
      .replace(/var\([^)]*,\s*([\d.]+)\)/gi, '$1')
      .replace(/var\([^)]+\)/gi, '1');

    const match = cleaned.match(/oklch\(\s*([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)(?:\s*[\/\s]\s*([\d.%]+))?\s*\)/i);
    if (match) {
      let L = parseFloat(match[1]);
      if (match[1].endsWith('%')) L /= 100;

      let C = parseFloat(match[2]);
      if (match[2].endsWith('%')) C /= 100;

      let H = parseFloat(match[3]);
      if (isNaN(H)) H = 0;

      let A = match[4] !== undefined ? parseFloat(match[4]) : 1;
      if (match[4] && match[4].endsWith('%')) A /= 100;
      if (isNaN(A)) A = 1;

      const hRad = (H * Math.PI) / 180;
      const a = C * Math.cos(hRad);
      const b = C * Math.sin(hRad);

      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 0.1291976484 * b;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      const r_lin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const b_lin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const gamma = (x: number) => (x > 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x);

      const R = Math.round(Math.min(255, Math.max(0, gamma(r_lin) * 255)));
      const G = Math.round(Math.min(255, Math.max(0, gamma(g_lin) * 255)));
      const B = Math.round(Math.min(255, Math.max(0, gamma(b_lin) * 255)));

      if (A < 1) {
        return `rgba(${R}, ${G}, ${B}, ${A.toFixed(2)})`;
      }
      return `rgb(${R}, ${G}, ${B})`;
    }
  } catch (e) {
    // Ignore math fallback
  }

  return 'transparent';
}

function replaceOklchInCss(cssText: string): string {
  if (!cssText) return cssText;
  if (!/oklch|oklab|color-mix|lch|lab/gi.test(cssText)) return cssText;

  return cssText.replace(/\b(oklch|oklab|color-mix|lch|lab)\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*\)/gi, (match, fnName) => {
    if (fnName.toLowerCase() === 'oklch') {
      return oklchToRgb(match);
    }
    return 'transparent';
  });
}

export function sanitizeAllStylesInDoc(doc: Document) {
  // 1. Fast regex replace for style tags
  const styleTags = doc.querySelectorAll('style');
  styleTags.forEach((tag) => {
    if (tag.textContent && /oklch|color-mix|oklab|lch/i.test(tag.textContent)) {
      tag.textContent = replaceOklchInCss(tag.textContent);
    }
  });

  // 2. Query ONLY elements with style attributes containing color functions
  const elementsWithStyle = doc.querySelectorAll('[style*="oklch"], [style*="oklab"], [style*="color-mix"], [style*="lch"]');
  elementsWithStyle.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const styleAttr = htmlEl.getAttribute('style');
    if (styleAttr) {
      htmlEl.setAttribute('style', replaceOklchInCss(styleAttr));
    }
  });

  // 3. Solid Black Text & Anti-Aliasing (Ensures crisp black text while preserving font weights)
  const renderStyle = doc.createElement('style');
  renderStyle.textContent = `
    .printable-doc, .printable-doc * {
      color: #000000 !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
      text-shadow: none !important;
    }
    .printable-doc p, 
    .printable-doc li, 
    .printable-doc span, 
    .printable-doc td, 
    .printable-doc th, 
    .printable-doc div {
      color: #000000 !important;
    }
  `;
  doc.head.appendChild(renderStyle);

  // 4. Prevent SVG clipping & ensure vector sharp rendering
  const allSvgs = doc.querySelectorAll('svg');
  allSvgs.forEach((svg) => {
    const svgEl = svg as unknown as HTMLElement;
    svgEl.style.overflow = 'visible';
    svgEl.style.boxSizing = 'content-box';
    svgEl.style.padding = '1px';
    svgEl.setAttribute('shape-rendering', 'geometricPrecision');
  });
}

export interface PdfExportOptions {
  marginMm?: number; // Margin in mm (default: 12mm)
  orientation?: 'portrait' | 'landscape'; // default: portrait
  autoFitOnePage?: boolean; // If content is within ~12% of 1 page, fit to 1 page to avoid blank trailing page
  smartPageBreaks?: boolean; // Scan horizontal whitespace to avoid slicing text/cards
  addPageNumbers?: boolean; // Add "Halaman X dari Y" footer on multi-page docs
  documentTitle?: string;
  headerInfo?: string;
  scale?: number; // Canvas DPI scale (default 2.5 for retina sharpness)
}

/**
 * Triggers the browser's native Vector Print-to-PDF engine (Adobe Grade).
 * Produces 100% vector typography (crisp at any zoom level, copyable text, real text search),
 * perfectly formatted A4 pages with zero rasterization blur.
 */
export function printVectorPdfDocument(filename: string): boolean {
  try {
    const originalTitle = document.title;
    // Set document title temporarily so Chrome/Safari/Edge suggests this filename in "Save as PDF"
    const cleanDocTitle = filename.replace(/\.pdf$/i, '');
    document.title = cleanDocTitle;

    window.print();

    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);

    return true;
  } catch (err) {
    console.error('Vector Print Error:', err);
    return false;
  }
}

/**
 * Scans from the bottom of the canvas upwards to find the last row containing visible content
 */
function findLastContentY(ctx: CanvasRenderingContext2D, width: number, height: number): number {
  const stepX = 4;
  for (let y = height - 1; y >= 0; y--) {
    const rowData = ctx.getImageData(0, y, width, 1).data;
    for (let x = 0; x < width; x += stepX) {
      const idx = x * 4;
      const r = rowData[idx];
      const g = rowData[idx + 1];
      const b = rowData[idx + 2];
      const a = rowData[idx + 3];
      // If pixel is not white / transparent (dark enough to be text, line, or badge)
      if (a > 40 && (r < 248 || g < 248 || b < 248)) {
        return Math.min(height, y + 10);
      }
    }
  }
  return height;
}

/**
 * Checks if a specific row in the canvas is pure white background
 */
function isRowWhitespace(ctx: CanvasRenderingContext2D, width: number, y: number): boolean {
  if (y < 0 || y >= ctx.canvas.height) return true;
  const rowData = ctx.getImageData(0, y, width, 1).data;
  const stepX = 4;
  for (let x = 0; x < width; x += stepX) {
    const idx = x * 4;
    const r = rowData[idx];
    const g = rowData[idx + 1];
    const b = rowData[idx + 2];
    const a = rowData[idx + 3];
    if (a > 40 && (r < 248 || g < 248 || b < 248)) {
      return false;
    }
  }
  return true;
}

/**
 * Searches backwards from targetY to find the optimal whitespace row between sections/cards
 */
function findBestSplitPoint(
  ctx: CanvasRenderingContext2D,
  width: number,
  startY: number,
  targetY: number,
  maxSearchPx: number
): number {
  if (targetY >= ctx.canvas.height) {
    return ctx.canvas.height;
  }

  const minSearchY = Math.max(startY + 100, targetY - maxSearchPx);
  const stepX = 4;
  let bestY = targetY;
  let bestScore = -1;

  for (let y = Math.floor(targetY); y >= Math.floor(minSearchY); y--) {
    const rowData = ctx.getImageData(0, y, width, 1).data;
    let nonWhitePixels = 0;
    const totalSamples = Math.floor(width / stepX);

    for (let x = 0; x < width; x += stepX) {
      const idx = x * 4;
      const r = rowData[idx];
      const g = rowData[idx + 1];
      const b = rowData[idx + 2];
      const a = rowData[idx + 3];
      if (a > 40 && (r < 248 || g < 248 || b < 248)) {
        nonWhitePixels++;
      }
    }

    // Completely white row found!
    if (nonWhitePixels === 0) {
      return y;
    }

    const whiteScore = (totalSamples - nonWhitePixels) / totalSamples;
    if (whiteScore > bestScore) {
      bestScore = whiteScore;
      bestY = y;
    }
  }

  // If we found a row that is at least 95% whitespace, prefer it over a hard cut
  if (bestScore >= 0.95) {
    return bestY;
  }

  return targetY;
}

/**
 * Pure jsPDF + html2canvas generator that creates a pixel-perfect A4 PDF document
 * with generous margins, zero cut-off text/tables, and no unnecessary blank pages.
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  filename: string,
  options?: PdfExportOptions
): Promise<boolean> {
  if (!element) return false;

  try {
    // 1. Sanitize all <style> tags in document to avoid OKLCH parse errors in html2canvas
    sanitizeAllStylesInDoc(document);

    const marginMm = options?.marginMm ?? 12;
    const addPageNumbers = options?.addPageNumbers !== false;

    // Check if element contains explicit A4 page sheets (.pdf-page-sheet)
    const pageSheets = Array.from(element.querySelectorAll<HTMLElement>('.pdf-page-sheet'));

    if (pageSheets.length > 0) {
      const pdf = new jsPDF({
        orientation: options?.orientation ?? 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageTotalWidthMm = pdf.internal.pageSize.getWidth(); // 210 mm
      const pageTotalHeightMm = pdf.internal.pageSize.getHeight(); // 297 mm
      const printableWidthMm = pageTotalWidthMm - (marginMm * 2); // 186 mm
      const printableHeightMm = pageTotalHeightMm - (marginMm * 2); // 273 mm

      // Parallel Canvas Generation for Ultra-Fast ~1s rendering with true 12px typography
      const sheetWidth = 750; // Calibrated to 1:1 A4 scale at 96 DPI for true 12px font size
      const canvasPromises = pageSheets.map(async (sheet) => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = `${sheetWidth}px`;
        container.style.backgroundColor = '#ffffff';
        container.style.zIndex = '-9999';
        container.style.overflow = 'visible';

        const clonedSheet = sheet.cloneNode(true) as HTMLElement;
        clonedSheet.style.width = `${sheetWidth}px`;
        clonedSheet.style.maxWidth = `${sheetWidth}px`;
        clonedSheet.style.boxSizing = 'border-box';
        clonedSheet.style.backgroundColor = '#ffffff';
        clonedSheet.style.boxShadow = 'none';
        clonedSheet.style.border = 'none';
        clonedSheet.style.margin = '0';
        clonedSheet.style.padding = '18px 22px';
        clonedSheet.style.fontSize = '12px';
        clonedSheet.style.setProperty('-webkit-font-smoothing', 'antialiased');

        container.appendChild(clonedSheet);
        document.body.appendChild(container);

        try {
          const canvas = await html2canvas(container, {
            scale: options?.scale ?? 2.5, // Enhanced high-DPI retina sharpness
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 0,
            width: sheetWidth,
            windowWidth: sheetWidth,
          });
          return canvas;
        } finally {
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        }
      });

      const canvases = await Promise.all(canvasPromises);

      for (let i = 0; i < canvases.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = canvases[i];
        // High quality JPEG 0.95 renders in <5ms with sharp typography
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgHeightMm = (canvas.height / canvas.width) * printableWidthMm;
        const renderHeightMm = Math.min(printableHeightMm, imgHeightMm);

        pdf.addImage(
          imgData,
          'JPEG',
          marginMm,
          marginMm,
          printableWidthMm,
          renderHeightMm,
          undefined,
          'FAST'
        );

        if (canvases.length > 1 && addPageNumbers) {
          pdf.setFontSize(8.5);
          pdf.setTextColor(71, 85, 105);
          pdf.text(
            `Halaman ${i + 1} dari ${canvases.length}`,
            pageTotalWidthMm / 2,
            pageTotalHeightMm - Math.max(marginMm / 2, 5),
            { align: 'center' }
          );
        }
      }

      pdf.save(filename);
      return true;
    }

    // 2. Setup rendering container with clean 1080px width
    const containerWidth = 1080;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${containerWidth}px`;
    container.style.backgroundColor = '#ffffff';
    container.style.zIndex = '-9999';
    container.style.overflow = 'visible';

    // 3. Clone printable element
    const clonedEl = element.cloneNode(true) as HTMLElement;
    clonedEl.style.width = `${containerWidth}px`;
    clonedEl.style.maxWidth = `${containerWidth}px`;
    clonedEl.style.margin = '0';
    clonedEl.style.padding = '16px 20px';
    clonedEl.style.backgroundColor = '#ffffff';
    clonedEl.style.color = '#000000';
    clonedEl.style.boxSizing = 'border-box';
    clonedEl.style.overflow = 'visible';
    clonedEl.style.setProperty('-webkit-font-smoothing', 'antialiased');

    // Ensure all inline style attributes on cloned elements are sanitized
    const allCloned = clonedEl.querySelectorAll('*');
    allCloned.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.hasAttribute && htmlEl.hasAttribute('style')) {
        const styleAttr = htmlEl.getAttribute('style');
        if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab') || styleAttr.includes('color-mix'))) {
          htmlEl.setAttribute('style', replaceOklchInCss(styleAttr));
        }
      }
    });

    container.appendChild(clonedEl);
    document.body.appendChild(container);

    // 4. Capture canvas using html2canvas at scale 3.0 for ultra-sharp MS Word grade output
    const canvas = await html2canvas(container, {
      scale: 3.0,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: containerWidth,
      windowWidth: containerWidth,
    });

    // Remove offscreen container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to acquire 2D rendering context');
    }

    // 5. Calculate Page Geometry & Margins (A4: 210mm x 297mm)
    const smartPageBreaks = options?.smartPageBreaks !== false; // true by default

    const pdf = new jsPDF({
      orientation: options?.orientation ?? 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageTotalWidthMm = pdf.internal.pageSize.getWidth(); // 210 mm
    const pageTotalHeightMm = pdf.internal.pageSize.getHeight(); // 297 mm
    const printableWidthMm = pageTotalWidthMm - (marginMm * 2); // 186 mm
    const printableHeightMm = pageTotalHeightMm - (marginMm * 2); // 273 mm

    // Effective content height without trailing empty whitespace
    const lastContentY = findLastContentY(ctx, canvas.width, canvas.height);
    const effectiveContentHeight = lastContentY; // Use raw height

    // Pixels per mm in the rendered canvas
    const pxPerMm = canvas.width / printableWidthMm;
    const pageHeightPx = printableHeightMm * pxPerMm;

    // Directly use the Multi-Page logic for ALL content
    // Slice intelligently at whitespace borders between sections to avoid cutting text/tables
    const slices: { startY: number; endY: number }[] = [];
    let currentY = 0;
    const maxSearchBackPx = Math.floor(pageHeightPx * 0.25); // Look up to 25% back for whitespace gap

    while (currentY < effectiveContentHeight) {
      const targetY = currentY + pageHeightPx;

      if (targetY >= effectiveContentHeight) {
        slices.push({ startY: currentY, endY: effectiveContentHeight });
        break;
      }

      let splitY = targetY;
      if (smartPageBreaks) {
        splitY = findBestSplitPoint(ctx, canvas.width, currentY, targetY, maxSearchBackPx);
      }

      // Safeguard against infinite loops
      if (splitY <= currentY + 50) {
        splitY = targetY;
      }

      slices.push({ startY: currentY, endY: splitY });
      currentY = splitY;

      // Skip any consecutive pure white rows at the top of the next page
      while (currentY < effectiveContentHeight && isRowWhitespace(ctx, canvas.width, currentY)) {
        currentY++;
      }
    }

    // Render each slice as an independent PDF page
    const totalPages = slices.length;
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const slice = slices[i];
      const sliceHeight = slice.endY - slice.startY;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const sliceCtx = sliceCanvas.getContext('2d');

      if (sliceCtx) {
        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          canvas,
          0,
          slice.startY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        const sliceHeightMm = (sliceHeight / canvas.width) * printableWidthMm;

        pdf.addImage(
          sliceImgData,
          'JPEG',
          marginMm,
          marginMm,
          printableWidthMm,
          sliceHeightMm,
          undefined,
          'MEDIUM'
        );

        // Page Numbering Footer on Multi-Page Documents
        if (totalPages > 1 && addPageNumbers) {
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184); // slate-400
          const pageStr = `Halaman ${i + 1} dari ${totalPages}`;
          pdf.text(pageStr, pageTotalWidthMm / 2, pageTotalHeightMm - Math.max(marginMm / 2, 5), {
            align: 'center',
          });
        }
      }
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('jsPDF Generation Error:', err);
    return false;
  }
}

let cachedHtml2pdfFn: any = null;

async function getHtml2PdfFn() {
  if (!cachedHtml2pdfFn) {
    const html2pdfModule = await import('html2pdf.js');
    cachedHtml2pdfFn = (html2pdfModule.default || html2pdfModule) as unknown as () => any;
  }
  return cachedHtml2pdfFn;
}

/**
 * Generate PDF directly using html2pdf.js for optimal sharpness,
 * CSS multi-page break control (.printable-doc), and client-side rendering.
 */
export async function generatePdfWithHtml2Pdf(
  element: HTMLElement,
  filename: string,
  options?: {
    marginMm?: number;
    scale?: number;
  }
): Promise<boolean> {
  try {
    const marginMm = options?.marginMm ?? 10;
    const scale = options?.scale ?? 3.0;

    // Ensure all SVG icons within element have overflow: visible so they are never clipped
    const allSvgs = element.querySelectorAll('svg');
    allSvgs.forEach((svg) => {
      const svgEl = svg as unknown as HTMLElement;
      svgEl.style.overflow = 'visible';
      svgEl.style.boxSizing = 'content-box';
      svgEl.style.padding = '1px';
    });

    const marginTuple: [number, number, number, number] = [marginMm, marginMm, marginMm, marginMm];

    const opt = {
      margin: marginTuple,
      filename: filename,
      image: { type: 'png' as const, quality: 1.0 },
      html2canvas: {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc: Document) => {
          sanitizeAllStylesInDoc(clonedDoc);
        },
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
        compress: true,
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.pdf-page-break-before',
        after: '.pdf-page-break-after',
        avoid: ['.pdf-avoid-break', 'tr', 'table', '.syllabus-card', '.signatory-block'],
      },
    };

    const html2pdf = await getHtml2PdfFn();
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.error('html2pdf.js Generation Error:', err);
    // Fallback to jsPDF engine
    return generatePdfFromElement(element, filename, options);
  }
}
