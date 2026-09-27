import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Building,
  ShieldCheck,
  Search,
  ExternalLink,
  Eye,
  X,
  Sparkles,
  FileSignature,
} from 'lucide-react';

interface ContractDocumentHubViewProps {
  onNavigateToProposal?: () => void;
}

interface ContractDocument {
  id: string;
  docNumber: string;
  type: 'SPH' | 'Kontrak Klien' | 'PO Vendor';
  title: string;
  party: string;
  date: string;
  nominal: number;
  status: 'Disahkan' | 'Pending Review' | 'Terbit';
  signatory: string;
  summary: string;
}

const INITIAL_DOCS: ContractDocument[] = [
  {
    id: 'doc-1',
    docNumber: 'SPH-TCMS/2026/09/014-REV2',
    type: 'SPH',
    title: 'Surat Penawaran Harga (SPH) Resmi - Pelatihan Kepemimpinan Digital (35 Pax)',
    party: 'PT Cipta Perdana Enterprise',
    date: '20 Sep 2026',
    nominal: 115000000,
    status: 'Disahkan',
    signatory: 'Rian Pratama, S.E., M.M. (Head of Commercial)',
    summary: 'Penawaran harga resmi 3 hari pelatihan in-house (35 Pax), mencakup instruktur master, akomodasi hotel, kit peserta premium, dan garansi pasca-pelatihan.',
  },
  {
    id: 'doc-2',
    docNumber: 'SPK-CPE/DIR-HR/2026/088',
    type: 'Kontrak Klien',
    title: 'Surat Perjanjian Kerja Sama (SPK) Penyelenggaraan Pelatihan Manajerial BUMN',
    party: 'PT Cipta Perdana Enterprise',
    date: '18 Sep 2026',
    nominal: 115000000,
    status: 'Disahkan',
    signatory: 'Dr. Ir. Hendra Gunawan, MBA (Direktur Utama TCMS)',
    summary: 'Perjanjian pelaksanaan jasa konsultasi & pelatihan mencakup SLA kepuasan peserta min. 85%, kepatuhan kerahasiaan data, dan termin pembayaran 50%-50%.',
  },
  {
    id: 'doc-3',
    docNumber: 'PO-TCMS/VND/2026/001-HOTEL',
    type: 'PO Vendor',
    title: 'Purchase Order Resmi: Paket Fullboard Meeting Hotel 3 Hari 35 Pax',
    party: 'Grand Mercure Harmoni Hotel',
    date: '19 Sep 2026',
    nominal: 38850000,
    status: 'Disahkan',
    signatory: 'Siti Rahmawati, S.Ak., CA (Manager Keuangan & Otorisator)',
    summary: 'Pemenuhan POS 01 Venue & Ballroom: Sewa ruang pertemuan 3 hari, 2x coffee break & 1x lunch buffet per hari, sound system dan LCD projector.',
  },
  {
    id: 'doc-4',
    docNumber: 'PO-TCMS/VND/2026/002-KIT',
    type: 'PO Vendor',
    title: 'Purchase Order: Modul Eksklusif & Seminar Kit Leatherette (35 Set)',
    party: 'CV Citra Grafika Mandiri',
    date: '19 Sep 2026',
    nominal: 7700000,
    status: 'Disahkan',
    signatory: 'Siti Rahmawati, S.Ak., CA (Manager Keuangan)',
    summary: 'Pemenuhan POS 02 Kit: Cetak jilid modul full color 120 halaman, buku catatan hard cover, bolpoin laser engraving, dan name badge peserta.',
  },
  {
    id: 'doc-5',
    docNumber: 'SPH-TCMS/2026/09/015',
    type: 'SPH',
    title: 'Proposal & SPH: Asesmen Kematangan AI & Konsultasi Tata Kelola IT',
    party: 'Kementerian Komunikasi & Informatika RI',
    date: '16 Sep 2026',
    nominal: 180000000,
    status: 'Pending Review',
    signatory: 'Rian Pratama, S.E., M.M. (Head of Commercial)',
    summary: 'Penawaran jasa konsultasi 4 pekan untuk penyusunan roadmap AI governance pada 5 unit kerja kementerian.',
  },
];

export const ContractDocumentHubView: React.FC<ContractDocumentHubViewProps> = ({
  onNavigateToProposal,
}) => {
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<ContractDocument | null>(null);

  const types = ['Semua', 'SPH', 'Kontrak Klien', 'PO Vendor'];

  const filtered = INITIAL_DOCS.filter((doc) => {
    const matchType = selectedType === 'Semua' || doc.type === selectedType;
    const matchSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.party.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in relative">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              Pusat Dokumen Resmi: SPH, SPK Kontrak &amp; PO Vendor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Arsip terpusat Surat Penawaran Harga (SPH), Surat Perjanjian Kerja (SPK) Klien, dan Purchase Order (PO)
            mitra rekanan yang telah disahkan sesuai nominal RAP terkunci.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onNavigateToProposal && (
            <button
              onClick={onNavigateToProposal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg shadow-2xs transition cursor-pointer"
              title="Ke Halaman Proposal Penawaran Klien"
            >
              <FileSignature className="w-3.5 h-3.5 text-emerald-600" />
              <span>Proposal Penawaran</span>
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor dokumen, klien..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              selectedType === t
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {doc.docNumber}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {doc.type}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.status === 'Disahkan'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{doc.summary}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Pihak: <strong>{doc.party}</strong></span>
                <span className="font-mono font-bold text-slate-900">
                  Rp {doc.nominal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Tanggal: {doc.date}</span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold flex items-center space-x-1 transition cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Pratinjau</span>
                </button>
                <button
                  onClick={() => alert(`Mengunduh berkas ${doc.docNumber}.pdf`)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                  {previewDoc.type} • {previewDoc.docNumber}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">{previewDoc.title}</h2>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-500">Pihak Bersepakat:</span>
                <span className="font-bold text-slate-900">{previewDoc.party}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nilai Kontrak / PO:</span>
                <span className="font-mono font-bold text-emerald-700">
                  Rp {previewDoc.nominal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penandatangan Otorisator:</span>
                <span className="font-bold text-slate-900">{previewDoc.signatory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Validasi Hukum:</span>
                <span className="font-bold text-emerald-700">✓ Sah &amp; Mengikat (e-Sign Terverifikasi)</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Ringkasan Klausul:</span>
              <p>{previewDoc.summary}</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Dokumen</span>
              </button>
              <button
                onClick={() => {
                  alert(`Dokumen ${previewDoc.docNumber} berhasil diunduh.`);
                  setPreviewDoc(null);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
