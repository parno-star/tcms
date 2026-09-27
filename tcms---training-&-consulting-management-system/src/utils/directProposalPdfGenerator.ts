import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { ProposalDocument, ProposalSection } from '../types';
import { formatCurrency } from './calculator';

// Helper pembersih prefix judul proposal otomatis
const cleanProposalTitle = (rawTitle: string): string => {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/^Proposal\s+Penawaran\s+(?:Program\s+)?(?:In-House\s+Training|Pelatihan|Jasa\s+Konsultansi|Konsultansi)?\s*:\s*/i, '')
    .replace(/^Proposal\s+(?:Penawaran|Program|Jasa|In-House\s+Training|Pelatihan|Konsultansi)?\s*:\s*/i, '')
    .trim();
};

// Helper pemisah judul utama dan batch/angkatan
const parseTitleAndBatch = (rawTitle: string): { mainTitle: string; batchText: string | null } => {
  const cleaned = cleanProposalTitle(rawTitle);
  const batchRegex = /(?:[\s\-–—\(\[\{]*)\b(Batch\s+[0-9IVXLCDM]+|Angkatan\s+[0-9IVXLCDM]+|Gelombang\s+[0-9IVXLCDM]+)(?:[\)\]\}]*)$/i;
  const match = cleaned.match(batchRegex);
  if (match) {
    const mainTitle = cleaned.replace(batchRegex, '').trim().replace(/[\-–—:\(\)]+$/, '').trim();
    const batchText = match[1].trim();
    return { mainTitle, batchText };
  }
  return { mainTitle: cleaned, batchText: null };
};

/**
 * Direct Native PDF Generator for Official Proposals.
 * Renders exact proposal content into a pure vector PDF.
 * Accepts customSplitKey from interactive drag divider so PDF page breaks match on-screen display 100%.
 */
export async function generateDirectProposalPdf(
  proposal: ProposalDocument,
  filename?: string,
  customSplitKey?: string | null
): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
    const marginRight = 14;
    const marginLeft = 19.5; // Margin kiri
    const margin = 14; // margin bawah/default
    const contentWidth = pageWidth - marginLeft - marginRight; // 176.5 mm
    const titleCenterX = marginLeft + contentWidth / 2;
    const pageBottomLimit = pageHeight - margin - 12; // 271 mm max printable Y

    let y = margin - 1; // start at ~13mm

    const brandDark: [number, number, number] = [15, 23, 42]; // slate-900
    const textDark: [number, number, number] = [15, 23, 42]; // slate-900
    const textBody: [number, number, number] = [30, 41, 59]; // slate-800
    const textMuted: [number, number, number] = [100, 116, 139]; // slate-500
    const borderGray: [number, number, number] = [203, 213, 225]; // slate-300
    const borderLight: [number, number, number] = [226, 232, 240]; // slate-200
    const bgSlate50: [number, number, number] = [248, 250, 252];

    const isTraining = proposal.projectType === 'training';
    const training = proposal.trainingDetails;
    const consulting = proposal.consultingDetails;

    // Spacing constants:
    const lineSpacing15 = 4.8; // 1.5 spasi untuk font 12px (9pt) = 4.8mm
    const oneSpace = 3.8;      // Padding dalam box = 1 spasi (3.8mm)
    const twoSpaces = 7.6;     // Jarak antar box = 2 spasi (7.6mm)

    // Function to handle automatic overflow page breaks
    const ensureSpace = (neededHeight: number) => {
      if (y + neededHeight > pageBottomLimit) {
        doc.addPage();
        y = margin + 7.5;
        return true;
      }
      return false;
    };

    // Calculate default split point
    const computedSplitPoint = (() => {
      if (isTraining && training?.modules && training.modules.length > 0) {
        const modules = training.modules;
        const totalTopics = modules.reduce((sum, m) => sum + (m.topics?.length || 0), 0);
        if (modules.length >= 3) {
          const mid = Math.floor(modules.length / 2) - 1;
          return `mod-${Math.max(0, mid)}`;
        } else if (modules.length === 2 && totalTopics > 6) {
          return 'mod-0';
        }
        return 'sec-3';
      } else {
        const milestones = consulting?.milestones || [];
        if (milestones.length >= 4) {
          return 'sec-2';
        }
        return 'sec-3';
      }
    })();

    const activeSplitKey = customSplitKey !== undefined && customSplitKey !== null ? customSplitKey : computedSplitPoint;
    let hasExecutedSplit = false;

    const triggerPageBreakIfSplitKey = (key: string): boolean => {
      if (!hasExecutedSplit && activeSplitKey === key) {
        doc.addPage();
        y = margin + 7.5;
        hasExecutedSplit = true;
        return true;
      }
      return false;
    };

    // Generate Verification QR code data URL
    let qrDataUrl = '';
    try {
      const verifyUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/?rap=${encodeURIComponent(proposal.proposalNumber || proposal.id)}&version=v1.0`
        : `https://tcms.staroffice.id/verify-rap?code=${encodeURIComponent(proposal.proposalNumber || proposal.id)}&version=v1.0`;

      qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 140,
        errorCorrectionLevel: 'M',
        color: { dark: '#0f172a', light: '#ffffff' },
      });
    } catch (e) {
      // Safe fallback
    }

    // ==========================================
    // 1. KOP SURAT RESMI (LETTERHEAD) ON PAGE 1
    // ==========================================
    doc.setFillColor(...brandDark);
    doc.roundedRect(marginLeft, y, 15, 15, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text('TCMS', marginLeft + 7.5, y + 10, { align: 'center' });

    // Company & Address Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...brandDark);
    doc.text('PT CIPTA PERDANA ENTERPRISE', marginLeft + 18, y + 4.2);

    doc.setFontSize(8.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('STAR OFFICE — Training & Consulting Management System', marginLeft + 18, y + 8.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...textMuted);
    doc.text('Gedung Menara Mandiri Lt. 18, Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan 12190', marginLeft + 18, y + 11.8);
    doc.text('Telepon: (021) 5299-8800 • Email: commercial@tcms-staroffice.id • Website: tcms-staroffice.id', marginLeft + 18, y + 15.2);

    // Right-Hand Document Type, Proposal Number & QR Code
    const rightColX = pageWidth - marginRight;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...brandDark);
    doc.text(isTraining ? 'PROPOSAL PELATIHAN' : 'PROPOSAL KONSULTANSI', rightColX, y + 4.2, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(proposal.proposalNumber, rightColX, y + 8, { align: 'right' });

    // QR Code Box (12.5x12.5 mm)
    if (qrDataUrl) {
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.25);
      doc.roundedRect(rightColX - 13, y + 9.2, 13, 13, 1, 1, 'D');
      doc.addImage(qrDataUrl, 'PNG', rightColX - 12.5, y + 9.7, 12, 12);
    }

    y += 24;

    // Solid Divider Line under Kop Surat
    doc.setDrawColor(...brandDark);
    doc.setLineWidth(0.7);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 16.5;

    // ==========================================
    // 2. JUDUL PROPOSAL (CENTERED SUBJECT & BATCH)
    // ==========================================
    const { mainTitle, batchText } = parseTitleAndBatch(proposal.title);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...brandDark);
    const splitTitle = doc.splitTextToSize(mainTitle.toUpperCase(), contentWidth - 16);
    doc.text(splitTitle, titleCenterX, y, { align: 'center' });
    y += splitTitle.length * 4.8;

    if (batchText) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.0); // 12 px
      doc.setTextColor(51, 65, 85);
      doc.text(batchText.toUpperCase(), titleCenterX, y, { align: 'center' });
      y += 4.5;
    }

    // Center Accent Line
    doc.setDrawColor(...brandDark);
    doc.setLineWidth(0.5);
    doc.line(titleCenterX - 12, y, titleCenterX + 12, y);
    y += 18.0;

    // ==========================================
    // 3. SEKSI PROPOSAL (DYNAMIC SECTION BUILDER)
    // ==========================================
    const sectionsToRender: ProposalSection[] = (proposal.sections && proposal.sections.length > 0)
      ? proposal.sections
      : [
          {
            id: 'sec-1',
            title: '1. LATAR BELAKANG & URGENSI PROGRAM',
            type: 'text',
            content: `Dalam rangka akselerasi kapabilitas organisasi dan pemenuhan standar kinerja industri terdepan, ${proposal.clientName} memerlukan program pengembangan kompetensi terstruktur yang berdampak langsung pada performa tim kerja di lini depan operasional.\n\n${
              isTraining && training
                ? `Program ini dirancang khusus untuk target peserta: ${training.targetAudience || 'Staf & Tim Operasional'} dengan metode pembelajaran ${training.trainingMethod || 'Interactive Workshop & Studi Kasus'}.`
                : `Menghadapi kompleksitas operasional, regulasi terkini, dan dinamika pasar, ${proposal.clientName} memerlukan pendampingan strategis independen: ${consulting?.problemStatement || 'Optimalisasi tata kelola operasional dan efisiensi kerja'}.`
            }`
          },
          {
            id: 'sec-2',
            title: isTraining ? '2. SASARAN & OUTPUT KOMPETENSI PEMBELAJARAN' : '2. PENDEKATAN & METODOLOGI KONSULTANSI',
            type: 'bullet_list',
            content: '',
            items: isTraining && training?.learningObjectives && training.learningObjectives.length > 0
              ? training.learningObjectives
              : [
                  'Membangun paradigma Service Mindset 4.0 yang berorientasi pada kepuasan pelanggan loyal dan pemecahan masalah proaktif.',
                  'Menguasai practical methodology untuk menangani keluhan pelanggan tier-1 secara cepat, empatik, dan beretika tinggi.',
                  'Menerapkan gaya kepemimpinan transformasional dalam menggerakkan tim kerja di tengah disrupsi teknologi digital.',
                  'Menyusun Rencana Aksi Individu (Individual Action Plan) yang terukur dan berdampak langsung pada KPI unit kerja.',
                ]
          },
          {
            id: 'sec-3',
            title: isTraining ? '3. STRUKTUR KURIKULUM & AGENDA SILABUS' : '3. TAHAPAN PEKERJAAN & DELIVERABLE RESMI',
            type: isTraining ? 'table_syllabus' : 'table_milestones',
            content: ''
          },
          {
            id: 'sec-4',
            title: '4. KOMERSIAL & STRUKTUR INVESTASI',
            type: 'table_costs',
            content: ''
          },
          {
            id: 'sec-5',
            title: '5. SYARAT & KETENTUAN PENAWARAN',
            type: 'bullet_list',
            content: '',
            items: proposal.termsAndConditions && proposal.termsAndConditions.length > 0
              ? proposal.termsAndConditions
              : [
                  `Penawaran harga ini berlaku selama ${proposal.validityDays} (tiga puluh) hari kalender sejak tanggal proposal diterbitkan.`,
                  `Konfirmasi pelaksanaan dilakukan dengan menerbitkan Surat Perintah Kerja (SPK) atau Purchase Order (PO) resmi dari ${proposal.clientName}.`,
                  'Jadwal definitif disepakati selambat-lambatnya 7 (tujuh) hari kerja sebelum tanggal pelaksanaan dimulai.',
                  'Pembatalan sepihak setelah penandatanganan SPK/PO akan dikenakan biaya persiapan operasional sesuai ketentuan yang berlaku.',
                ]
          },
          {
            id: 'sec-6',
            title: '6. LEMBAR PENGESAHAN & KONFIRMASI KERJA SAMA',
            type: 'signatory',
            content: ''
          }
        ];

    const renderSectionTitle = (titleStr: string) => {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.0);
      doc.setTextColor(...brandDark);
      doc.text(titleStr.toUpperCase(), marginLeft, y);
      y += 6.0;
    };

    sectionsToRender.forEach((sec, sIdx) => {
      const sectionKey = `sec-${sIdx + 1}`;

      if (sec.type === 'text') {
        renderSectionTitle(sec.title);
        const textVal = sec.content || '';
        if (textVal) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.0);
          doc.setTextColor(...textBody);
          const splitLines = doc.splitTextToSize(textVal, contentWidth);

          splitLines.forEach((line: string) => {
            ensureSpace(lineSpacing15);
            doc.text(line, marginLeft, y, { lineHeightFactor: 1.5 });
            y += lineSpacing15;
          });
          y += 3.0;
        }

        // Check if page break split threshold is hit
        triggerPageBreakIfSplitKey(sectionKey);
        if (sec.id) triggerPageBreakIfSplitKey(sec.id);

      } else if (sec.type === 'bullet_list') {
        renderSectionTitle(sec.title);
        const items = sec.items || [];
        items.forEach((item) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.0);
          const splitItem = doc.splitTextToSize(item, contentWidth - 8);
          const itemHeight = splitItem.length * lineSpacing15 + 1.2;

          ensureSpace(itemHeight);

          // Vector CheckCircle Icon
          doc.setDrawColor(...brandDark);
          doc.setLineWidth(0.35);
          doc.circle(marginLeft + 2.2, y - 0.9, 1.4, 'D');
          doc.line(marginLeft + 1.4, y - 0.9, marginLeft + 2.0, y - 0.3);
          doc.line(marginLeft + 2.0, y - 0.3, marginLeft + 3.0, y - 1.6);

          doc.setTextColor(...textDark);
          doc.text(splitItem, marginLeft + 6, y, { lineHeightFactor: 1.5 });
          y += itemHeight;
        });
        y += 3.0;

        // Check if page break split threshold is hit
        triggerPageBreakIfSplitKey(sectionKey);
        if (sec.id) triggerPageBreakIfSplitKey(sec.id);

      } else if (sec.type === 'table_syllabus') {
        renderSectionTitle(sec.title);
        const modules = training?.modules && training.modules.length > 0
          ? training.modules
          : [
              {
                dayNumber: 1,
                title: 'Hari 1: Customer-Centric Culture & Customer Journey Mapping',
                durationHours: 8,
                topics: [
                  'Paradigma Baru Service Excellence di Era B2B Digital',
                  'Memetakan Customer Touchpoints & Momen Kritis (Moments of Truth)',
                  'Identifikasi Kebutuhan Tersembunyi (Customer Empathy Mapping)',
                  'Studi Kasus: Anatomi Kegagalan Layanan & Pelajaran Kritis',
                ],
                interactiveMethod: 'Kuliah Interaktif, Pemetaan Kanvas Persona, Diskusi Kelompok',
              },
              {
                dayNumber: 2,
                title: 'Hari 2: High-Impact Communication & Advanced Service Recovery',
                durationHours: 8,
                topics: [
                  'Teknik Komunikasi Asertif & De-eskalasi Ketegangan dengan Klien Strategis',
                  'Protokol HEAR (Hear, Empathize, Apologize, Resolve) dalam Komplain',
                  'Simulasi Menghadapi Situasi Kritis & Pelanggan Menuntut',
                  'Praktik Role-Play Langsung di Depan Kamera dengan Feedback Instan',
                ],
                interactiveMethod: 'Simulasi Role-Play dengan Rekaman Video & Umpan Balik Personal',
              },
              {
                dayNumber: 3,
                title: 'Hari 3: Transformational Leadership & Action Learning Execution',
                durationHours: 8,
                topics: [
                  'Prinsip Kepemimpinan Transformasional: Lead by Example & Coaching Tim',
                  'Membangun Iklim Kerja Kolaboratif Berdaya Tahan Tinggi (Resilience)',
                  'Penyusunan Individual Service Action Plan (ISAP) untuk 90 Hari ke Depan',
                  'Presentasi Kelompok Rencana Aksi, Evaluasi Level 2, dan Komitmen',
                ],
                interactiveMethod: 'Lokakarya Rencana Aksi & Post-Test Terstandar',
              },
            ];

        modules.forEach((mod, mIdx) => {
          const rawTopics = Array.isArray(mod.topics) ? mod.topics : [String(mod.topics || '')];
          const maxTopicWidth = contentWidth - oneSpace * 2 - 8;

          const processedTopics = rawTopics.map((top) => doc.splitTextToSize(top, maxTopicWidth));

          let totalTopicLines = 0;
          processedTopics.forEach((lines) => {
            totalTopicLines += lines.length;
          });

          const methodText = mod.interactiveMethod || 'Workshop & Diskusi';
          const methodLabelWidth = 14;
          const maxMethodWidth = contentWidth - oneSpace * 2 - methodLabelWidth;
          const splitMethodLines = doc.splitTextToSize(methodText, maxMethodWidth);

          const headerHeight = 7.5;
          const topicsHeight = totalTopicLines * lineSpacing15;
          const methodHeight = splitMethodLines.length * lineSpacing15;
          const totalBoxH = oneSpace + headerHeight + topicsHeight + 3.5 + methodHeight + oneSpace;

          ensureSpace(totalBoxH);

          // Card container
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(...borderGray);
          doc.setLineWidth(0.25);
          doc.roundedRect(marginLeft, y, contentWidth, totalBoxH, 2, 2, 'FD');

          // Card Header
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.0);
          doc.setTextColor(...brandDark);
          doc.text(mod.title, marginLeft + oneSpace, y + oneSpace + 3.5);
          doc.text(`${mod.durationHours} JP`, marginLeft + contentWidth - oneSpace, y + oneSpace + 3.5, { align: 'right' });

          // Header separator line
          doc.setDrawColor(...borderLight);
          doc.setLineWidth(0.2);
          doc.line(marginLeft + oneSpace, y + oneSpace + 5.5, marginLeft + contentWidth - oneSpace, y + oneSpace + 5.5);

          // Topics inside card
          let topicY = y + oneSpace + 5.5 + 4.2;
          processedTopics.forEach((lines) => {
            doc.setFillColor(...brandDark);
            doc.circle(marginLeft + oneSpace + 2, topicY - 1.0, 0.7, 'F');

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.0);
            doc.setTextColor(...textDark);
            doc.text(lines, marginLeft + oneSpace + 5, topicY, { lineHeightFactor: 1.5 });
            topicY += lines.length * lineSpacing15;
          });

          // Footer dashed line & interactive method
          doc.setDrawColor(...borderLight);
          doc.setLineDashPattern([1.2, 1.2], 0);
          doc.line(marginLeft + oneSpace, topicY - 1.0, marginLeft + contentWidth - oneSpace, topicY - 1.0);
          doc.setLineDashPattern([], 0);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(...brandDark);
          doc.text('Metode: ', marginLeft + oneSpace, topicY + 3.2);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.0);
          doc.setTextColor(...textBody);
          doc.text(splitMethodLines, marginLeft + oneSpace + methodLabelWidth, topicY + 3.2, { lineHeightFactor: 1.5 });

          // Jarak antar box = 2 spasi (7.6mm)
          y += totalBoxH + twoSpaces;

          // Trigger page break after specific module if requested
          const splitTriggered = triggerPageBreakIfSplitKey(`mod-${mIdx}`);
          if (splitTriggered && mIdx < modules.length - 1) {
            renderSectionTitle(`${sec.title} (Lanjutan)`);
          }
        });

        // Check if page break split threshold is hit after syllabus
        triggerPageBreakIfSplitKey(sectionKey);
        if (sec.id) triggerPageBreakIfSplitKey(sec.id);

      } else if (sec.type === 'table_milestones') {
        renderSectionTitle(sec.title);
        const milestones = consulting?.milestones && consulting.milestones.length > 0
          ? consulting.milestones
          : [
              {
                phase: 'Fase I',
                phaseTitle: 'Diagnostik As-Is & Gap Analysis',
                durationWeeks: 'Pekan 1–2',
                keyActivities: ['Wawancara pemangku kepentingan', 'Audit SOP berjalan'],
                deliverables: 'Laporan Diagnostik Kesenjangan Proses Bisnis',
                paymentPercentage: 30,
              },
              {
                phase: 'Fase II',
                phaseTitle: 'Redesain Arsitektur & SOP To-Be',
                durationWeeks: 'Pekan 3–4',
                keyActivities: ['Penyusunan matriks RACI', 'Perumusan pedoman tata kelola'],
                deliverables: 'Draft Buku Pedoman SOP & Dokumen Kebijakan Baru',
                paymentPercentage: 40,
              },
              {
                phase: 'Fase III',
                phaseTitle: 'Sosialisasi, Walkthrough & BAST',
                durationWeeks: 'Pekan 5–6',
                keyActivities: ['Uji coba pilot proyek', 'Pelatihan TOT internal klien'],
                deliverables: 'Final Deliverables, Berita Acara (BAST) & Handover',
                paymentPercentage: 30,
              },
            ];

        const consultingRows = milestones.map((ms) => [
          ms.phase,
          `${ms.phaseTitle}\n(${ms.durationWeeks})`,
          Array.isArray(ms.keyActivities) ? ms.keyActivities.join('\n• ') : (ms.keyActivities || '-'),
          ms.deliverables,
          `${ms.paymentPercentage}%`,
        ]);

        ensureSpace(40);

        autoTable(doc, {
          startY: y,
          margin: { left: marginLeft, right: marginRight },
          head: [['Fase', 'Tahapan Pekerjaan', 'Aktivitas Kunci', 'Output / Deliverables', 'Bobot']],
          body: consultingRows,
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 9.0,
            cellPadding: 2.8,
            textColor: textBody,
            lineColor: borderGray,
            lineWidth: 0.2,
          },
          headStyles: {
            fillColor: [241, 245, 249],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9.0,
          },
          columnStyles: {
            0: { cellWidth: 16, fontStyle: 'bold', halign: 'center' },
            1: { cellWidth: 44, fontStyle: 'bold' },
            2: { cellWidth: 52 },
            3: { cellWidth: 50 },
            4: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
          },
          didDrawPage: (data) => {
            if (data.cursor) {
              y = data.cursor.y + twoSpaces;
            }
          }
        });

        // Check if page break split threshold is hit
        triggerPageBreakIfSplitKey(sectionKey);
        if (sec.id) triggerPageBreakIfSplitKey(sec.id);

      } else if (sec.type === 'table_costs') {
        renderSectionTitle(sec.title);

        const innerMargin = marginLeft + oneSpace;
        const innerWidth = contentWidth - oneSpace * 2;

        const paymentTermsText = proposal.paymentTerms || 'DP 50%, Pelunasan 50%';
        const splitPaymentTerms = doc.splitTextToSize(paymentTermsText, innerWidth - 32);

        const rawTaxNotes = proposal.taxNotes || 'Harga penawaran belum termasuk PPN 11%. Pajak PPh 23 (2%) dipotong oleh klien sesuai ketentuan perpajakan BUMN.';
        const splitTaxNotes = doc.splitTextToSize(rawTaxNotes, innerWidth - 26);

        const bankText = 'Transfer Bank Mandiri No. Rek: 122-00-9889-1024 a.n. PT Cipta Perdana Enterprise.';
        const splitBank = doc.splitTextToSize(bankText, innerWidth - 36);

        const taxBlockH = splitTaxNotes.length * lineSpacing15;
        const bankBlockH = splitBank.length * lineSpacing15;
        const taxAndBankHeight = taxBlockH + bankBlockH + 2.0;

        const statusBoxPaddingY = oneSpace; // 3.8mm
        const statusBoxPaddingX = oneSpace; // 3.8mm
        const statusBoxH = statusBoxPaddingY + 2.8 + lineSpacing15 + (splitPaymentTerms.length - 1) * lineSpacing15 + oneSpace;

        const spaceToStatusBox = twoSpaces;
        const topPriceHeight = 22.0;
        const totalCardH = topPriceHeight + taxAndBankHeight + spaceToStatusBox + statusBoxH + oneSpace;

        ensureSpace(totalCardH + twoSpaces);

        const cardY = y;

        // Container Kartu Komersial Luar
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...borderGray);
        doc.setLineWidth(0.25);
        doc.roundedRect(marginLeft, cardY, contentWidth, totalCardH, 2.5, 2.5, 'FD');

        // 1. Nominal Harga
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.0);
        doc.setTextColor(71, 85, 105);
        doc.text('TOTAL NILAI PENAWARAN RESMI', innerMargin, cardY + 5.5);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandDark);
        doc.text(formatCurrency(proposal.proposedSellingPrice), innerMargin, cardY + 12.5);

        if (isTraining && proposal.participantsCount) {
          const perPax = Math.round(proposal.proposedSellingPrice / proposal.participantsCount);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.0);
          doc.setTextColor(30, 41, 59);
          doc.text(`Setara: ${formatCurrency(perPax)} / Peserta (${proposal.participantsCount} Pax)`, innerMargin, cardY + 18.0);
        }

        doc.setDrawColor(...borderLight);
        doc.setLineWidth(0.2);
        doc.line(innerMargin, cardY + 21.0, marginLeft + contentWidth - oneSpace, cardY + 21.0);

        // 2. Catatan Pajak & Bank
        const taxY = cardY + 26.8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.0);
        doc.setTextColor(...textDark);
        doc.text('Catatan Pajak: ', innerMargin, taxY);
        doc.setFont('helvetica', 'normal');
        doc.text(splitTaxNotes, innerMargin + 25.0, taxY, { lineHeightFactor: 1.5 });

        const bankY = taxY + (splitTaxNotes.length - 1) * lineSpacing15 + 5.2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.0);
        doc.text('Metode Pembayaran: ', innerMargin, bankY);
        doc.setFont('helvetica', 'normal');
        doc.text(splitBank, innerMargin + 35.0, bankY, { lineHeightFactor: 1.5 });

        // 3. Kotak Status & Termin
        const statusBoxY = bankY + spaceToStatusBox;
        doc.setFillColor(...bgSlate50);
        doc.setDrawColor(...borderGray);
        doc.setLineWidth(0.25);
        doc.roundedRect(innerMargin, statusBoxY, innerWidth, statusBoxH, 2, 2, 'FD');

        const textInsideY = statusBoxY + statusBoxPaddingY + 2.8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.0);
        doc.setTextColor(...textDark);
        doc.text('Status Penawaran: ', innerMargin + statusBoxPaddingX, textInsideY);
        doc.setFont('helvetica', 'bold');
        doc.text(proposal.status, innerMargin + statusBoxPaddingX + 30, textInsideY);

        doc.setFont('helvetica', 'normal');
        doc.text('Termin Bayar: ', innerMargin + statusBoxPaddingX, textInsideY + lineSpacing15);
        doc.setFont('helvetica', 'bold');
        doc.text(splitPaymentTerms, innerMargin + statusBoxPaddingX + 23, textInsideY + lineSpacing15, { lineHeightFactor: 1.5 });

        y = cardY + totalCardH + twoSpaces;

        // Check if page break split threshold is hit
        triggerPageBreakIfSplitKey(sectionKey);
        if (sec.id) triggerPageBreakIfSplitKey(sec.id);

      } else if (sec.type === 'signatory') {
        const signatoryH = 0.65 + 15.75 + 16.5 + 40.0;
        ensureSpace(signatoryH);

        doc.setDrawColor(...brandDark);
        doc.setLineWidth(0.65);
        doc.line(marginLeft, y, pageWidth - marginRight, y);
        y += 15.75; // 70% dari eksisting

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...brandDark);
        doc.text('LEMBAR PENGESAHAN & KONFIRMASI KERJA SAMA', titleCenterX, y, { align: 'center' });
        y += 16.5;

        const sigColWidth = 80;
        const col1X = marginLeft + 4;
        const col2X = marginLeft + contentWidth - sigColWidth - 4;

        // Penyedia
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.0);
        doc.setTextColor(...textMuted);
        doc.text('Diajukan Secara Resmi Oleh:', col1X + sigColWidth / 2, y, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.0);
        doc.setTextColor(...brandDark);
        doc.text('PT CIPTA PERDANA ENTERPRISE (TCMS)', col1X + sigColWidth / 2, y + 4.5, { align: 'center' });

        // Klien
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.0);
        doc.setTextColor(...textMuted);
        doc.text('Disetujui & Dikonfirmasi Oleh Klien:', col2X + sigColWidth / 2, y, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.0);
        doc.setTextColor(...brandDark);
        doc.text(proposal.clientName, col2X + sigColWidth / 2, y + 4.5, { align: 'center' });

        // Ruang tanda tangan (80% dari eksisting)
        const sigNameY = y + 4.5 + 28.0;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.0);
        doc.setTextColor(...brandDark);
        doc.text(proposal.signatoryName || 'Rian Pratama, S.E., M.M.', col1X + sigColWidth / 2, sigNameY, { align: 'center' });
        doc.text(proposal.clientPicName || '( ...................................................... )', col2X + sigColWidth / 2, sigNameY, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.0);
        doc.setTextColor(...textMuted);
        doc.text(proposal.signatoryTitle || 'Head of Commercial TCMS', col1X + sigColWidth / 2, sigNameY + 4.5, { align: 'center' });
        doc.text(proposal.clientPicPosition || 'Pejabat Berwenang / Pimpinan HC', col2X + sigColWidth / 2, sigNameY + 4.5, { align: 'center' });

        y = sigNameY + 12.0;
      }
    });

    // Render footers across all generated pages
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(...borderLight);
      doc.setLineWidth(0.2);
      doc.line(marginLeft, pageHeight - margin - 3, pageWidth - marginRight, pageHeight - margin - 3);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.0);
      doc.setTextColor(...brandDark);
      doc.text('TCMS STAR OFFICE', marginLeft, pageHeight - margin);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(' • PT Cipta Perdana Enterprise', marginLeft + 28, pageHeight - margin);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandDark);
      doc.text(`Halaman ${p} dari ${totalPages}`, pageWidth - marginRight, pageHeight - margin, { align: 'right' });
    }

    const cleanNumber = proposal.proposalNumber.replace(/[\/\\]/g, '-');
    const finalFilename = filename || `Dokumen-Proposal-${cleanNumber}.pdf`;

    doc.save(finalFilename);
    return true;
  } catch (err) {
    console.error('Direct Native PDF Generation Error:', err);
    return false;
  }
}
