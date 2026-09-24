import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export interface PdfExportOptions {
  fileName?: string;
  margin?: number;
  quality?: number;
  landscape?: boolean;
}

/**
 * Converts OKLCH lightness, chroma, and hue into standard sRGB values [0..255].
 * Conforms strictly to the W3C Color Module 4 conversion formulas.
 */
function oklchToRgb(l: number, c: number, hDeg: number): [number, number, number] {
  const hRad = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = +4.0767434770 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const toSRGB = (cVal: number) => {
    const clamped = Math.max(0, Math.min(1, cVal));
    return clamped <= 0.0031308
      ? Math.round(12.92 * clamped * 255)
      : Math.round((1.055 * Math.pow(clamped, 1 / 2.4) - 0.055) * 255);
  };

  return [toSRGB(r), toSRGB(g), toSRGB(b_)];
}

/**
 * Parses any CSS oklch(...) expression and accurately translates it into standard rgb/rgba.
 */
export function parseOklchMatch(match: string): string {
  try {
    const inner = match.replace(/oklch\(/i, '').replace(/\)$/, '').trim();
    const slashParts = inner.split('/');
    const mainParts = slashParts[0].trim().split(/[\s,]+/);

    if (mainParts.length < 3) {
      return '#0f172a';
    }

    const lStr = mainParts[0];
    const cStr = mainParts[1];
    const hStr = mainParts[2];

    let l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
    let c = cStr.endsWith('%') ? (parseFloat(cStr) / 100) * 0.4 : parseFloat(cStr);
    let h = parseFloat(hStr);

    if (hStr.endsWith('rad')) h = (h * 180) / Math.PI;
    else if (hStr.endsWith('turn')) h = h * 360;

    if (isNaN(l)) l = 0.5;
    if (isNaN(c)) c = 0;
    if (isNaN(h)) h = 0;

    let alpha = 1;
    if (slashParts[1]) {
      const aStr = slashParts[1].trim();
      alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
      if (isNaN(alpha)) alpha = 1;
    }

    const [r, g, b] = oklchToRgb(l, c, h);
    if (alpha < 0.999) {
      return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return '#0f172a';
  }
}

export function convertOklchToRgb(colorStr: string): string {
  if (!colorStr || !colorStr.includes('oklch')) return colorStr;
  return colorStr.replace(/oklch\([^)]+\)/gi, (match) => parseOklchMatch(match));
}

/**
 * Renders an HTML element to a high-quality PDF with crisp typography and clean contrast.
 * Fully compatible with sandboxed browser environments, Bengali Unicode glyphs, and Tailwind v4.
 */
export async function downloadPdfFromElement(
  target: string | HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  try {
    const element = typeof target === 'string' ? document.getElementById(target) : target;
    if (!element) {
      console.error(`Element not found for PDF generation: ${target}`);
      return false;
    }

    // Ensure document fonts (Hind Siliguri / Bengali fonts) are fully loaded
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // continue gracefully
      }
    }

    const elementId = typeof target === 'string' ? target : element.id;
    const canvas = await html2canvas(element, {
      scale: 2.5, // 2.5x high-DPI scaling for sharp Bengali letters and vector-like lines
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: Math.max(element.scrollWidth, 1100),
      onclone: (clonedDoc) => {
        // 1. Force light mode in cloned document so PDF is always clean white background
        clonedDoc.documentElement.classList.remove('dark');
        clonedDoc.body.classList.remove('dark');

        // 2. Inject high-contrast, crystal-clear typography and color stylesheet
        const printStyle = clonedDoc.createElement('style');
        printStyle.id = 'pdf-custom-print-style';
        printStyle.textContent = `
          * {
            font-family: 'Nikosh', 'NikoshBAN', 'SolaimanLipi', 'Solaiman Lipi', 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: optimizeLegibility !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          body, #bazaar-register-table-area, #kitchen-work-order-area, #weekly-menu-schedule-area, #billing-full-sheet, #voucher-print-area {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }

          #bazaar-register-table-area {
            padding: 20px 24px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
          }

          /* Table typography & borders */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            background-color: #ffffff !important;
          }

          thead th {
            background-color: #064e2b !important;
            color: #ffffff !important;
            font-weight: 700 !important;
            border: 1px solid #04381f !important;
            padding: 9px 12px !important;
            font-size: 13px !important;
          }

          tbody td {
            border: 1px solid #cbd5e1 !important;
            color: #1e293b !important;
            background-color: #ffffff !important;
            padding: 9px 12px !important;
            font-size: 12px !important;
          }

          tbody tr:nth-child(even) td {
            background-color: #f8fafc !important;
          }

          /* Consolidated item breakdowns inside cells */
          .pdf-item-row {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
          }

          /* Show PDF-only print headers and verification signatures */
          .print-only-header {
            display: block !important;
          }

          .print-only-signatures {
            display: block !important;
          }

          /* Strictly hide interactive buttons and web controls */
          .no-print, [data-pdf-ignore="true"], button {
            display: none !important;
          }
        `;
        clonedDoc.head.appendChild(printStyle);

        // 3. Sanitize all <style> tags in cloned document to remove any raw oklch colors
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
            styleEl.textContent = convertOklchToRgb(styleEl.textContent);
          }
        });

        // 4. Patch getComputedStyle on the cloned document window to translate any residual oklch
        const win = clonedDoc.defaultView || window;
        if (win && win.getComputedStyle) {
          const originalGetComputedStyle = win.getComputedStyle.bind(win);
          win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
            const style = originalGetComputedStyle(elt, pseudoElt);
            return new Proxy(style, {
              get(targetObj, prop) {
                const val = (targetObj as unknown as Record<string | symbol, unknown>)[prop];
                if (typeof val === 'string' && val.includes('oklch')) {
                  return convertOklchToRgb(val);
                }
                if (typeof val === 'function') {
                  if (prop === 'getPropertyValue') {
                    return (p: string) => {
                      const raw = targetObj.getPropertyValue(p);
                      return typeof raw === 'string' && raw.includes('oklch')
                        ? convertOklchToRgb(raw)
                        : raw;
                    };
                  }
                  return val.bind(targetObj);
                }
                return val;
              },
            });
          };
        }

        // 5. Ensure target element has no clipping or scroll limits
        const targetEl = elementId ? clonedDoc.getElementById(elementId) : null;
        if (targetEl) {
          targetEl.style.maxHeight = 'none';
          targetEl.style.height = 'auto';
          targetEl.style.overflow = 'visible';

          // Clean inline styles on children
          targetEl.querySelectorAll<HTMLElement>('*').forEach((el) => {
            const inline = el.getAttribute('style');
            if (inline && inline.includes('oklch')) {
              el.setAttribute('style', convertOklchToRgb(inline));
            }
          });
        }

        // 6. Explicitly reveal PDF headers and signatures in cloned tree
        clonedDoc.querySelectorAll<HTMLElement>('.print-only-header, .print-only-signatures').forEach((el) => {
          el.style.display = 'block';
        });

        // 7. Strictly hide elements marked as no-print or ignore
        const ignores = clonedDoc.querySelectorAll<HTMLElement>('.no-print, [data-pdf-ignore="true"], button');
        ignores.forEach((el) => {
          el.style.display = 'none';
        });
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', options.quality ?? 0.98);
    const orientation = options.landscape ? 'landscape' : 'portrait';
    const pdf = new jsPDF(orientation, 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = options.margin ?? 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = contentHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
    heightLeft -= pageHeight - margin * 2;

    // Additional pages if needed
    while (heightLeft > 0) {
      position = margin - (contentHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    const safeFileName = options.fileName
      ? options.fileName.endsWith('.pdf')
        ? options.fileName
        : `${options.fileName}.pdf`
      : 'document.pdf';

    pdf.save(safeFileName);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    try {
      window.print();
    } catch {
      // ignore
    }
    return false;
  }
}
