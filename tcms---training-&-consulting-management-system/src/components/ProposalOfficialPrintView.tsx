import React, { useState } from 'react';
import { ProposalDocument } from '../types';
import { generateDirectProposalPdf } from '../utils/directProposalPdfGenerator';
import { formatCurrency } from '../utils/calculator';
import { RapAuthenticationQr } from './RapAuthenticationQr';
import {
  Printer,
  X,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  FileText,
} from 'lucide-react';

interface ProposalOfficialPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalDocument;
  onEdit?: () => void;
}

export const ProposalOfficialPrintView: React.FC<ProposalOfficialPrintViewProps> = ({
  isOpen,
  onClose,
  proposal,
  onEdit,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [userSplitKey, setUserSplitKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const fontCls = {
    body: 'text-[12px] text-black font-normal',
    heading: 'text-[13.5px] font-black text-black',
    title: 'text-base sm:text-lg font-black text-black',
    sub: 'text-[11px] text-black',
    cardPad: 'p-3.5',
    space: 'space-y-4',
    tableText: 'text-[12px] text-black',
  };

  // 1. Direct Native PDF Generator: Pure Vector PDF, ZERO Image/Canvas conversion
  const handleDownloadDirectPdf = async () => {
    setIsDownloading(true);
    try {
      const cleanNumber = proposal.proposalNumber.replace(/[\/\\]/g, '-');
      const filename = `Dokumen-Proposal-${cleanNumber}.pdf`;

      const success = await generateDirectProposalPdf(proposal, filename, userSplitKey);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Direct PDF Generation Error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const isTraining = proposal.projectType === 'training';
  const training = proposal.trainingDetails;
  const consulting = proposal.consultingDetails;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Floating Action Header for Screen Mode */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-teal-600 via-slate-700 to-emerald-700 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden border-b border-teal-500/60 shadow-md backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>Preview Dokumen Proposal Resmi (Siap Diajukan ke Klien)</span>
              </div>
              <div className="text-[11px] text-teal-100 font-mono font-semibold">
                {proposal.proposalNumber} • {proposal.clientName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Utama: Cetak PDF Langsung (Murni PDF Vektor) */}
            <button
              type="button"
              onClick={handleDownloadDirectPdf}
              disabled={isDownloading}
              className="px-4 py-2 bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-900 text-white rounded-lg text-[12px] font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer active:scale-95 border border-teal-600 disabled:opacity-50"
              title="Cetak langsung file PDF murni tanpa diubah menjadi image (100% teks font vektor murni 12px, teks bisa di-copy, tajam di semua level zoom)"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>PDF Tercetak!</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>{isDownloading ? 'Menyusun PDF...' : 'Cetak PDF'}</span>
                </>
              )}
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-slate-600 rounded-lg text-xs font-bold flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                title="Edit Isi Proposal Ini"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                <span>Edit Proposal</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/60 transition cursor-pointer ml-1"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="overflow-y-auto p-4 sm:p-8 print:p-0 bg-slate-100 print:bg-white flex-1">
          <div
            id="proposal-official-printable-doc"
            className="w-full max-w-4xl mx-auto font-sans text-slate-900 printable-doc"
          >
            {/* HELPER FUNCTIONS / SUB-RENDERERS ARE EXPRESSED INLINE FOR MAXIMUM ROBUSTNESS */}
            {(() => {
              const isMultiPage = true;

              // Header 1: Official Kop Surat / Letterhead
              const renderLetterhead = () => (
                <div className="border-b-2 border-slate-900 pb-3.5 flex items-center justify-between pdf-avoid-break">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] aspect-square rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black tracking-wider text-xl shadow-xs shrink-0">
                      TCMS
                    </div>
                    <div className="space-y-0.5">
                      <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase leading-tight">
                        PT CIPTA PERDANA ENTERPRISE
                      </h1>
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        STAR OFFICE — Training & Consulting Management System
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight pt-0.5">
                        Gedung Menara Mandiri Lt. 18, Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan 12190
                      </p>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        Telepon: (021) 5299-8800 • Email: commercial@tcms-staroffice.id • Website: tcms-staroffice.id
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                    <div className="text-right shrink-0">
                      <div className="text-right font-black text-xs text-slate-900 uppercase tracking-wider">
                        {isTraining ? 'PROPOSAL PELATIHAN' : 'PROPOSAL KONSULTANSI'}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-700 font-mono mt-0.5 font-semibold tracking-tight">
                        {proposal.proposalNumber}
                      </div>
                    </div>
                    <RapAuthenticationQr 
                      projectCode={proposal.proposalNumber || proposal.id} 
                      rapVersion="v1.0" 
                      size={46} 
                      className="mt-1"
                    />
                  </div>
                </div>
              );

              // Metadata & Surat Pengantar (Dihapus sesuai permintaan user)
              const renderMetadata = () => null;

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

              // Judul Proposal (Posisi Center, Batch di Baris Bawah, Spasi 300% sesuai permintaan)
              const renderSubject = () => {
                const { mainTitle, batchText } = parseTitleAndBatch(proposal.title);
                return (
                  <div className="pdf-avoid-break text-center pt-8 sm:pt-9 pb-8 sm:pb-9 px-3 my-2 mb-8 sm:mb-9">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-wide uppercase max-w-2xl mx-auto">
                      {mainTitle}
                    </h2>
                    {batchText && (
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-widest uppercase mt-2 mb-1.5">
                        {batchText}
                      </div>
                    )}
                    <div className="w-16 h-0.5 bg-slate-900 mx-auto mt-3 rounded-full"></div>
                  </div>
                );
              };

              // Single Section Item Renderer
              const renderSection = (
                sec: any,
                idx: number,
                customModules?: any[],
                customTitle?: string
              ) => {
                const effectiveModules = customModules || (isTraining && training ? training.modules : []);
                const displayTitle = customTitle || sec.title;

                return (
                  <div key={sec.id ? `${sec.id}-${customTitle ? 'cont' : 'main'}` : idx} className="space-y-3.5 pdf-avoid-break">
                    <h3 className={`${fontCls.heading} uppercase tracking-wider text-slate-950 pb-1.5 flex items-center justify-between`}>
                      <span>{displayTitle}</span>
                    </h3>
                    {sec.content && (
                      <p className={`${fontCls.body} text-black leading-relaxed whitespace-pre-line`}>
                        {sec.content}
                      </p>
                    )}

                    {/* Bullet list items */}
                    {sec.type === 'bullet_list' && sec.items && (
                      <ul className="grid grid-cols-1 gap-1.5 pl-1">
                        {sec.items.map((item: string, iIdx: number) => (
                          <li key={iIdx} className={`flex items-start ${fontCls.body} text-black`}>
                            <div className="shrink-0 mr-2.5 h-[1.5em] flex items-center justify-center p-[1px]">
                              <CheckCircle2 className="w-4 h-4 text-slate-900 overflow-visible" />
                            </div>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Table Syllabus */}
                    {sec.type === 'table_syllabus' && isTraining && training && (
                      <div className="space-y-2">
                        {effectiveModules.map((mod: any, midx: number) => (
                          <div key={midx} className="border border-slate-300 rounded-xl p-3 sm:p-3.5 bg-white syllabus-card">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                              <span className="font-black text-black text-xs sm:text-[13px]">
                                {mod.title}
                              </span>
                              <span className="text-xs font-bold text-black shrink-0">
                                {mod.durationHours} JP
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs sm:text-[12px] text-black">
                              {mod.topics.map((t: string, tidx: number) => (
                                <div key={tidx} className="flex items-start space-x-2">
                                  <div className="shrink-0 w-3 h-[1.5em] flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                  </div>
                                  <span className="leading-snug font-medium text-black">{t}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-dashed border-slate-200 text-xs text-black">
                              <span className="font-bold text-black">Metode:</span> {mod.interactiveMethod}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Table Milestones */}
                    {sec.type === 'table_milestones' && !isTraining && consulting && (
                      <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-left text-xs sm:text-[12px]">
                          <thead className="bg-slate-100 text-black font-black border-b border-slate-300">
                            <tr>
                              <th className="p-2.5 w-24">Fase</th>
                              <th className="p-2.5">Uraian Aktivitas Kunci</th>
                              <th className="p-2.5 w-48">Deliverable Resmi</th>
                              <th className="p-2.5 w-20 text-right">Bobot</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-black">
                            {consulting.milestones.map((m, midx) => (
                              <tr key={midx} className="hover:bg-slate-50">
                                <td className="p-2.5 align-top font-black text-slate-950">
                                  {m.phase}
                                  <div className="text-[10.5px] text-black font-normal">{m.durationWeeks}</div>
                                </td>
                                <td className="p-2.5 align-top">
                                  <div className="font-bold text-black">{m.phaseTitle}</div>
                                  <ul className="list-disc list-inside text-black mt-1 space-y-0.5 text-xs">
                                    {m.keyActivities.map((act, actIdx) => (
                                      <li key={actIdx}>{act}</li>
                                    ))}
                                  </ul>
                                </td>
                                <td className="p-2.5 align-top text-black font-semibold">
                                  {m.deliverables}
                                </td>
                                <td className="p-2.5 align-top text-right font-black text-black">
                                  {m.paymentPercentage > 0 ? `${m.paymentPercentage}%` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Commercial / Costs Table */}
                    {sec.type === 'table_costs' && (
                      <div className="border border-slate-300 bg-white rounded-xl p-4 sm:p-5 space-y-3 pdf-avoid-break">
                        <div className="border-b border-slate-200 pb-3.5">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Total Nilai Penawaran Resmi
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-slate-950">
                            {formatCurrency(proposal.proposedSellingPrice)}
                          </div>
                          {isTraining && proposal.participantsCount && (
                            <div className="text-xs text-slate-800 font-bold mt-0.5">
                              Setara: {formatCurrency(Math.round(proposal.proposedSellingPrice / proposal.participantsCount))} / Peserta ({proposal.participantsCount} Pax)
                            </div>
                          )}
                        </div>

                        <div className="text-xs sm:text-[12px] text-black space-y-1">
                          <div><strong className="text-black">Catatan Pajak: </strong>{proposal.taxNotes}</div>
                          <div><strong className="text-black">Metode Pembayaran: </strong>Transfer Bank Mandiri No. Rek: 122-00-9889-1024 a.n. PT Cipta Perdana Enterprise.</div>
                        </div>

                        {/* Kotak Status Penawaran & Termin Bayar di bawah teks Transfer Bank Mandiri (Jarak 3 spasi, padding 2 spasi) */}
                        <div className="mt-6 text-xs text-black bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-xs space-y-1.5">
                          <div>Status Penawaran: <strong className="text-black">{proposal.status}</strong></div>
                          <div>Termin Bayar: <strong className="text-black">{proposal.paymentTerms}</strong></div>
                        </div>
                      </div>
                    )}

                    {/* Signatory Block */}
                    {sec.type === 'signatory' && (
                      <div className="pt-16 sm:pt-20 border-t-2 border-slate-900 signatory-block pdf-avoid-break">
                        <div className="text-center font-black text-xs sm:text-sm uppercase tracking-wider text-slate-900 mb-6 sm:mb-7">
                          LEMBAR PENGESAHAN & KONFIRMASI KERJA SAMA
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-xs sm:text-[12.5px]">
                          {/* Pihak Penyedia */}
                          <div className="text-center flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="text-slate-600 text-[11px]">Diajukan Secara Resmi Oleh:</div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">PT CIPTA PERDANA ENTERPRISE (TCMS)</div>
                            </div>
                            {/* Area tanda tangan bersih lapang tanpa kotak putus-putus */}
                            <div className="h-24 sm:h-28" />
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{proposal.signatoryName}</div>
                              <div className="text-slate-600 text-[11px]">{proposal.signatoryTitle}</div>
                            </div>
                          </div>

                          {/* Pihak Klien */}
                          <div className="text-center flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="text-slate-600 text-[11px]">Disetujui & Dikonfirmasi Oleh Klien:</div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{proposal.clientName}</div>
                            </div>
                            {/* Area tanda tangan bersih lapang tanpa kotak putus-putus */}
                            <div className="h-24 sm:h-28" />
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{proposal.clientPicName}</div>
                              <div className="text-slate-600 text-[11px]">{proposal.clientPicPosition}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              };

              // Fallback Default Content for Page 1
              const renderFallbackPage1 = () => (
                <div className="space-y-4">
                  {/* 1. Latar Belakang */}
                  <div className="space-y-3.5 pdf-avoid-break">
                    <h3 className={`${fontCls.heading} uppercase tracking-wider text-slate-950 pb-1`}>
                      1. Latar Belakang & Urgensi Program
                    </h3>
                    {isTraining && training ? (
                      <div className={`${fontCls.body} text-black leading-relaxed space-y-2`}>
                        <p>
                          Dalam rangka akselerasi kapabilitas organisasi dan pemenuhan standar kinerja industri terdepan, 
                          <strong className="text-black"> {proposal.clientName}</strong> memerlukan program pengembangan kompetensi terstruktur yang berdampak 
                          langsung pada performa tim kerja di lini depan operasional.
                        </p>
                        <p>
                          Program ini dirancang khusus untuk target peserta: <span className="font-bold text-black">{training.targetAudience}</span> dengan metode pembelajaran <span className="font-bold text-black">{training.trainingMethod}</span>.
                        </p>
                      </div>
                    ) : consulting && (
                      <div className={`${fontCls.body} text-black leading-relaxed space-y-2`}>
                        <p>
                          Menghadapi kompleksitas operasional, regulasi terkini, dan dinamika pasar, 
                          <strong className="text-black"> {proposal.clientName}</strong> memerlukan pendampingan strategis independen untuk memformulasikan solusi tata kelola yang teruji.
                        </p>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-[11px]">
                          <span className="font-bold text-black">Urgensi & Problem Statement: </span>
                          <span className="text-black font-medium">{consulting.problemStatement}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Sasaran / Metodologi */}
                  <div className="space-y-3.5 pdf-avoid-break">
                    <h3 className={`${fontCls.heading} uppercase tracking-wider text-slate-950 pb-1`}>
                      {isTraining ? '2. Sasaran & Output Kompetensi Pembelajaran' : '2. Pendekatan & Metodologi Konsultansi'}
                    </h3>
                    {isTraining && training ? (
                      <ul className="grid grid-cols-1 gap-2 pl-1">
                        {training.learningObjectives.map((obj, i) => (
                          <li key={i} className={`flex items-start ${fontCls.body} text-black`}>
                            <div className="shrink-0 mr-2.5 h-[1.5em] flex items-center justify-center p-[1px]">
                              <CheckCircle2 className="w-4 h-4 text-slate-900 overflow-visible" />
                            </div>
                            <span className="leading-snug">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    ) : consulting && (
                      <div className={`${fontCls.body} text-black space-y-1.5`}>
                        <p>
                          Pelaksanaan konsultansi menerapkan kerangka kerja teruji: <strong className="text-black">{consulting.approachFramework}</strong>.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. Silabus Modul / Work Breakdown */}
                  <div className="space-y-3.5 pdf-avoid-break">
                    <h3 className={`${fontCls.heading} uppercase tracking-wider text-slate-950 pb-1`}>
                      {isTraining ? '3. Struktur Kurikulum & Agenda Silabus' : '3. Tahapan Pekerjaan (Work Breakdown & Milestone)'}
                    </h3>
                    {isTraining && training && (
                      <div className="space-y-2">
                        {training.modules.map((mod, idx) => (
                          <div key={idx} className="border border-slate-300 rounded-xl p-3 bg-white syllabus-card">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                              <span className="font-bold text-black text-xs sm:text-[13px]">
                                {mod.title}
                              </span>
                              <span className="text-xs font-bold text-black shrink-0">
                                {mod.durationHours} JP
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11.5px] text-black">
                              {mod.topics.map((t, tidx) => (
                                <div key={tidx} className="flex items-start space-x-2">
                                  <div className="shrink-0 w-3 h-[1.5em] flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                  </div>
                                  <span className="leading-snug font-medium text-black">{t}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!isTraining && consulting && (
                      <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-left text-[11.5px]">
                          <thead className="bg-slate-100 text-black font-black border-b border-slate-300">
                            <tr>
                              <th className="p-2 w-20">Fase</th>
                              <th className="p-2">Uraian Aktivitas</th>
                              <th className="p-2 w-40">Deliverable</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-black">
                            {consulting.milestones.map((m, midx) => (
                              <tr key={midx}>
                                <td className="p-2 align-top font-black text-slate-950">{m.phase}</td>
                                <td className="p-2 align-top">{m.phaseTitle}</td>
                                <td className="p-2 align-top">{m.deliverables}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );

              // Fallback Default Content for Page 2
              const renderFallbackPage2 = () => (
                <div className="space-y-4">
                  {/* Nilai Penawaran / Komersial */}
                  <div className="space-y-2 pdf-avoid-break">
                    <h3 className={`${fontCls.heading} uppercase tracking-wider text-slate-950 pb-0.5`}>
                      4. Nilai Penawaran & Rincian Investasi
                    </h3>
                    <div className="border border-slate-300 bg-white rounded-xl p-4 sm:p-5 space-y-3">
                      <div className="border-b border-slate-200 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                            Total Nilai Penawaran Resmi
                          </span>
                          <div className="text-xl sm:text-2xl font-black text-slate-950">
                            {formatCurrency(proposal.proposedSellingPrice)}
                          </div>
                          {isTraining && proposal.participantsCount && (
                            <div className="text-[11.5px] text-slate-800 font-semibold mt-0.5">
                              Setara: {formatCurrency(Math.round(proposal.proposedSellingPrice / proposal.participantsCount))} / Peserta ({proposal.participantsCount} Pax)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-[11.5px] text-black space-y-1">
                        <div><strong className="text-black">Catatan Pajak: </strong>{proposal.taxNotes}</div>
                        <div><strong className="text-black">Metode Pembayaran: </strong>Transfer Bank Mandiri No. Rek: 122-00-9889-1024 a.n. PT Cipta Perdana Enterprise.</div>
                      </div>

                      {/* Kotak Status Penawaran & Termin Bayar di bawah teks Transfer Bank Mandiri (Jarak 3 spasi, padding 2 spasi) */}
                      <div className="mt-5 text-[11.5px] text-black bg-slate-50 p-3.5 rounded-xl border border-slate-300 space-y-1">
                        <div>Status: <strong className="text-black">{proposal.status}</strong></div>
                        <div>Termin: <strong className="text-black">{proposal.paymentTerms}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Syarat & Ketentuan */}
                  <div className="space-y-1.5 pdf-avoid-break">
                    <h3 className={`${fontCls.heading} uppercase tracking-wider text-slate-950 pb-0.5`}>
                      5. Syarat & Ketentuan Penawaran
                    </h3>
                    <ol className="list-decimal list-inside text-[11.5px] text-black space-y-1 pl-1 font-normal">
                      {proposal.termsAndConditions.map((tc, i) => (
                        <li key={i}>{tc}</li>
                      ))}
                    </ol>
                  </div>

                    {/* Signatory Block */}
                    <div className="pt-16 sm:pt-20 border-t-2 border-slate-900 signatory-block pdf-avoid-break">
                      <div className="text-center font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-6 sm:mb-7">
                        LEMBAR PENGESAHAN & KONFIRMASI KERJA SAMA
                      </div>

                      <div className="grid grid-cols-2 gap-8 text-[11px]">
                        <div className="text-center flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="text-slate-600 text-[10.5px]">Diajukan Secara Resmi Oleh:</div>
                            <div className="font-bold text-slate-900 text-xs">PT CIPTA PERDANA ENTERPRISE (TCMS)</div>
                          </div>
                          {/* Area tanda tangan bersih lapang tanpa kotak putus-putus */}
                          <div className="h-24 sm:h-28" />
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 text-xs">{proposal.signatoryName}</div>
                            <div className="text-slate-600 text-[10px]">{proposal.signatoryTitle}</div>
                          </div>
                        </div>

                        <div className="text-center flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="text-slate-600 text-[10.5px]">Disetujui & Dikonfirmasi Oleh Klien:</div>
                            <div className="font-bold text-slate-900 text-xs">{proposal.clientName}</div>
                          </div>
                          {/* Area tanda tangan bersih lapang tanpa kotak putus-putus */}
                          <div className="h-24 sm:h-28" />
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 text-xs">{proposal.clientPicName}</div>
                            <div className="text-slate-600 text-[10px]">{proposal.clientPicPosition}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              );

              // -------------------------------------------------------------
              // MULTI-PAGE MODE (2 HALAMAN RESMI - OTOMATIS)
              // -------------------------------------------------------------
              if (isMultiPage) {
                const dynamicSections = proposal.sections || [];

                // Perhitungan Otomatis Pembagian Konten
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
                    const milestones = proposal.consultingDetails?.milestones || [];
                    if (milestones.length >= 4) {
                      return 'sec-2';
                    }
                    return 'sec-3';
                  }
                })();

                const activeSplitPoint = userSplitKey !== null ? userSplitKey : computedSplitPoint;

                // Distribusi Konten Section ke Halaman 1 & Halaman 2 berdasarkan activeSplitPoint
                let page1Items: { section: any; idx: number; customModules?: any[]; customTitle?: string }[] = [];
                let page2Items: { section: any; idx: number; customModules?: any[]; customTitle?: string }[] = [];

                if (activeSplitPoint === 'sec-1') {
                  page1Items = dynamicSections.slice(0, 1).map((s, i) => ({ section: s, idx: i }));
                  page2Items = dynamicSections.slice(1).map((s, i) => ({ section: s, idx: i + 1 }));
                } else if (activeSplitPoint === 'sec-2') {
                  page1Items = dynamicSections.slice(0, 2).map((s, i) => ({ section: s, idx: i }));
                  page2Items = dynamicSections.slice(2).map((s, i) => ({ section: s, idx: i + 2 }));
                } else if (activeSplitPoint.startsWith('mod-')) {
                  const modCutoff = parseInt(activeSplitPoint.replace('mod-', ''), 10);
                  const secSyllabusIdx = dynamicSections.findIndex((s) => s.type === 'table_syllabus');
                  const targetIdx = secSyllabusIdx !== -1 ? secSyllabusIdx : 2;
                  const syllabusSec = dynamicSections[targetIdx] || dynamicSections[2];
                  const allModules = training?.modules || [];

                  const p1Modules = allModules.slice(0, modCutoff + 1);
                  const p2Modules = allModules.slice(modCutoff + 1);

                  // Konten sebelum silabus
                  const beforeSyllabus = dynamicSections.slice(0, targetIdx).map((s, i) => ({ section: s, idx: i }));
                  page1Items = [...beforeSyllabus, { section: syllabusSec, idx: targetIdx, customModules: p1Modules }];

                  // Silabus lanjutan pada halaman 2
                  if (p2Modules.length > 0) {
                    page2Items.push({
                      section: syllabusSec,
                      idx: targetIdx,
                      customModules: p2Modules,
                      customTitle: `${syllabusSec.title} (Lanjutan)`,
                    });
                  }
                  // Konten setelah silabus
                  const afterSyllabus = dynamicSections
                    .slice(targetIdx + 1)
                    .map((s, i) => ({ section: s, idx: targetIdx + 1 + i }));
                  page2Items.push(...afterSyllabus);
                } else if (activeSplitPoint === 'sec-4') {
                  const sec4Idx = dynamicSections.findIndex((s) => s.type === 'table_costs' || s.id === 'sec-4');
                  const cutoff = sec4Idx !== -1 ? sec4Idx + 1 : 4;
                  page1Items = dynamicSections.slice(0, cutoff).map((s, i) => ({ section: s, idx: i }));
                  page2Items = dynamicSections.slice(cutoff).map((s, i) => ({ section: s, idx: cutoff + i }));
                } else {
                  // Default sec-3 (atau seluruh modul sebelum komersial)
                  const sec3Idx = dynamicSections.findIndex((s) => s.type === 'table_syllabus' || s.id === 'sec-3');
                  const cutoff = sec3Idx !== -1 ? sec3Idx + 1 : 3;
                  page1Items = dynamicSections.slice(0, cutoff).map((s, i) => ({ section: s, idx: i }));
                  page2Items = dynamicSections.slice(cutoff).map((s, i) => ({ section: s, idx: cutoff + i }));
                }

                return (
                  <div className="space-y-0">
                    {/* HALAMAN 1 (PAGE 1) */}
                    <div className="pdf-page-sheet bg-white p-7 sm:p-11 shadow-md border border-slate-200 rounded-2xl mb-8 print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        {renderLetterhead()}
                        {renderMetadata()}
                        {renderSubject()}

                        {page1Items.length > 0 ? (
                          <div className="space-y-4">
                            {page1Items.map((item) =>
                              renderSection(item.section, item.idx, item.customModules, item.customTitle)
                            )}
                          </div>
                        ) : (
                          renderFallbackPage1()
                        )}
                      </div>

                      {/* Running Footer Halaman 1 */}
                      <div className="pt-3.5 border-t border-slate-200 flex justify-between items-center text-[10.5px] text-slate-500">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">TCMS STAR OFFICE</span>
                          <span>•</span>
                          <span>PT Cipta Perdana Enterprise</span>
                        </div>
                        <div className="font-bold text-slate-800">
                          Halaman 1 dari 2
                        </div>
                      </div>
                    </div>

                    {/* HALAMAN 2 (PAGE 2) */}
                    <div className="pdf-page-sheet bg-white p-7 sm:p-11 shadow-md border border-slate-200 rounded-2xl mb-8 print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        {page2Items.length > 0 ? (
                          <div className="space-y-4">
                            {page2Items.map((item) =>
                              renderSection(item.section, item.idx, item.customModules, item.customTitle)
                            )}
                          </div>
                        ) : (
                          renderFallbackPage2()
                        )}
                      </div>

                      {/* Running Footer Halaman 2 */}
                      <div className="pt-3.5 border-t border-slate-200 flex justify-between items-center text-[10.5px] text-slate-500">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">TCMS STAR OFFICE</span>
                          <span>•</span>
                          <span>PT Cipta Perdana Enterprise</span>
                        </div>
                        <div className="font-bold text-slate-800">
                          Halaman 2 dari 2
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // -------------------------------------------------------------
              // COMPACT SINGLE-PAGE MODE
              // -------------------------------------------------------------
              const dynamicSections = proposal.sections || [];
              return (
                <div className="pdf-page-sheet bg-white p-6 sm:p-9 shadow-md border border-slate-200 rounded-2xl print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none space-y-3.5">
                  {renderLetterhead()}
                  {renderMetadata()}
                  {renderSubject()}

                  {dynamicSections.length > 0 ? (
                    <div className="space-y-3">
                      {dynamicSections.map((sec, idx) => renderSection(sec, idx))}
                    </div>
                  ) : (
                    <>
                      {renderFallbackPage1()}
                      {renderFallbackPage2()}
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9.5px] text-slate-400">
                    <span>TCMS STAR OFFICE — Format Kompak</span>
                    <span>1 Halaman</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
